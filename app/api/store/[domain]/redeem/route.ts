import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Resgatar produto da loja
export async function POST(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity = 1, method = 'free' } = body

    if (!product_id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a loja pelo domínio
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, company_id')
      .eq('domain', params.domain)
      .eq('status', 'active')
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Buscar produto e verificar elegibilidade
    const { data: product, error: productError } = await supabase
      .from('company_products')
      .select(
        `
        *,
        company_product_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `
      )
      .eq('id', product_id)
      .eq('store_id', store.id)
      .eq('status', 'active')
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar estoque
    if (product.stock_quantity !== null && product.stock_quantity < quantity) {
      return NextResponse.json(
        {
          error: 'Estoque insuficiente',
          available: product.stock_quantity,
        },
        { status: 400 }
      )
    }

    // Verificar elegibilidade por tags
    const { data: userTags } = await supabase
      .from('user_tags')
      .select('tag_id, tags(name)')
      .eq('user_id', session.user.id)

    const userTagNames = userTags?.map(t => t.tags?.name).filter(Boolean) || []
    const productTagNames =
      product.company_product_tags
        ?.map((cpt: any) => cpt.tags?.name)
        .filter(Boolean) || []

    // Se o produto tem tags, verificar se o usuário tem pelo menos uma em comum
    if (productTagNames.length > 0) {
      const hasCommonTags = productTagNames.some((tag: string) =>
        userTagNames.includes(tag)
      )
      if (!hasCommonTags) {
        return NextResponse.json(
          {
            error: 'Produto não elegível para seu perfil',
            requiredTags: productTagNames,
          },
          { status: 403 }
        )
      }
    }

    // Verificar método de resgate
    if (method === 'points') {
      const pointsRequired = (product.points_cost || 0) * quantity

      // Verificar se o usuário tem pontos suficientes
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('balance')
        .eq('user_id', session.user.id)
        .eq('company_id', store.company_id)
        .single()

      if (!userPoints || userPoints.balance < pointsRequired) {
        return NextResponse.json(
          {
            error: 'Pontos insuficientes',
            required: pointsRequired,
            available: userPoints?.balance || 0,
          },
          { status: 400 }
        )
      }
    }

    // Criar pedido de resgate
    const orderNumber = `RED-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        company_id: store.company_id,
        store_id: store.id,
        total_amount: method === 'free' ? 0 : (product.price || 0) * quantity,
        points_used:
          method === 'points' ? (product.points_cost || 0) * quantity : 0,
        payment_method:
          method === 'free' ? 'free' : method === 'points' ? 'points' : 'money',
        status: 'confirmed',
        order_number: orderNumber,
        tracking_code: `TRK-${orderNumber}`,
        meta: {
          redemption: true,
          method,
          product_id,
          quantity,
        },
      })
      .select('id, order_number')
      .single()

    if (orderError) {
      console.error('Erro ao criar pedido de resgate:', orderError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Criar item do pedido
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product_id,
      quantity: quantity,
      unit_price: method === 'free' ? 0 : product.price || 0,
      points_cost: method === 'points' ? product.points_cost || 0 : 0,
      subtotal: method === 'free' ? 0 : (product.price || 0) * quantity,
      points_subtotal:
        method === 'points' ? (product.points_cost || 0) * quantity : 0,
    })

    if (itemError) {
      console.error('Erro ao criar item do pedido:', itemError)
      return NextResponse.json(
        { error: 'Erro ao criar item do pedido' },
        { status: 500 }
      )
    }

    // Decrementar estoque se necessário
    if (product.stock_quantity !== null) {
      const { error: stockError } = await supabase
        .from('company_products')
        .update({
          stock_quantity: product.stock_quantity - quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product_id)

      if (stockError) {
        console.error('Erro ao atualizar estoque:', stockError)
        // Não falhar o resgate por erro de estoque, apenas logar
      }
    }

    // Decrementar pontos se necessário
    if (method === 'points') {
      const pointsUsed = (product.points_cost || 0) * quantity
      const { error: pointsError } = await supabase
        .from('user_points')
        .update({
          balance: (userPoints?.balance || 0) - pointsUsed,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id)
        .eq('company_id', store.company_id)

      if (pointsError) {
        console.error('Erro ao atualizar pontos:', pointsError)
        // Não falhar o resgate por erro de pontos, apenas logar
      }
    }

    // Log de auditoria
    await supabase.from('audit_log').insert({
      event_type: 'store.redeem',
      actor_id: session.user.id,
      role: 'user',
      tenant_id: store.company_id,
      target: 'orders',
      target_id: order.id,
      payload: {
        action: 'redeem',
        product_id,
        quantity,
        method,
        order_number: order.order_number,
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: 'confirmed',
      },
      message: 'Resgate realizado com sucesso!',
    })
  } catch (error) {
    console.error('Erro na API de resgate:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}







