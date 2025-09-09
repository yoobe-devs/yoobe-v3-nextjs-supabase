import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const tenantId = user.user_metadata?.tenant_id
    const employeeId = user.user_metadata?.employee_id

    if (!tenantId || !employeeId) {
      return NextResponse.json(
        { error: 'ID do tenant ou funcionário não encontrado' },
        { status: 400 }
      )
    }

    // Buscar itens do carrinho do localStorage (simulado)
    // Em produção, isso viria de uma tabela de carrinho no banco
    const cartItems = await getCartItemsFromStorage(tenantId, employeeId)

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({
        items: [],
        subtotal: 0,
        subtotalPoints: 0,
      })
    }

    // Buscar dados dos produtos
    const productIds = cartItems.map((item: any) => item.productId)

    const { data: products, error: productsError } = await supabase
      .from('client_products')
      .select(
        `
        id,
        name,
        price,
        stock_quantity,
        status,
        final_sku
      `
      )
      .eq('client_id', tenantId)
      .in('id', productIds)

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      )
    }

    // Montar resumo do carrinho
    const items = cartItems
      .map((cartItem: any) => {
        const product = products?.find(p => p.id === cartItem.productId)
        if (!product) return null

        const pointsCost = Math.floor(product.price * 10) // 1 real = 10 pontos
        const subtotal = product.price * cartItem.quantity
        const subtotalPoints = pointsCost * cartItem.quantity

        return {
          id: product.id,
          name: product.name,
          thumb: '/placeholder.png', // Em produção, buscar imagem real
          qty: cartItem.quantity,
          price: product.price,
          points: pointsCost,
          subtotal,
          subtotalPoints,
          stock_quantity: product.stock_quantity,
          status: product.status,
          final_sku: product.final_sku,
        }
      })
      .filter(Boolean)

    const subtotal = items.reduce((sum, item) => sum + (item?.subtotal || 0), 0)
    const subtotalPoints = items.reduce(
      (sum, item) => sum + (item?.subtotalPoints || 0),
      0
    )

    return NextResponse.json({
      items,
      subtotal,
      subtotalPoints,
    })
  } catch (error) {
    console.error('Erro no GET /api/cart/summary:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função simulada para buscar itens do carrinho
async function getCartItemsFromStorage(tenantId: string, employeeId: string) {
  // Em produção, isso viria de uma tabela de carrinho no banco
  // Por enquanto, simular com dados do localStorage
  try {
    // Simular dados de carrinho para teste
    return [
      {
        productId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 2,
      },
      {
        productId: '550e8400-e29b-41d4-a716-446655440002',
        quantity: 1,
      },
    ]
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error)
    return []
  }
}










