import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Processar checkout da loja pública
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const body = await request.json()
    const { store_id, customer_info, items } = body

    if (!store_id || !customer_info || !items || items.length === 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Buscar dados da loja
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('company_id')
      .eq('id', store_id)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já existe
    let userId: string
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', customer_info.email)
      .single()

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Criar novo usuário
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          email: customer_info.email,
          full_name: customer_info.name,
          name: customer_info.name,
          role: 'user',
          company_id: store.company_id,
          store_id: store_id,
          status: 'active',
        })
        .select('id')
        .single()

      if (createUserError) {
        console.error('Erro ao criar usuário:', createUserError)
        return NextResponse.json(
          { error: 'Erro ao criar usuário' },
          { status: 500 }
        )
      }

      userId = newUser.id
    }

    // Calcular total do pedido
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const { data: product } = await supabase
        .from('company_products')
        .select('price, points_cost')
        .eq('id', item.product_id)
        .single()

      if (product) {
        const itemTotal = product.price * item.quantity
        totalAmount += itemTotal
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
          points_cost: product.points_cost,
        })
      }
    }

    // Gerar número do pedido e código de rastreamento
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`
    const trackingCode = `TRK-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        company_id: store.company_id,
        store_id: store_id,
        total_amount: totalAmount,
        points_used: 0,
        payment_method: 'money',
        status: 'pending',
        shipping_address: customer_info.address || '',
        order_number: orderNumber,
        tracking_code: trackingCode,
      })
      .select('id, order_number, tracking_code')
      .single()

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Criar itens do pedido
    for (const item of orderItems) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        points_cost: item.points_cost,
      })
    }

    return NextResponse.json({
      message: 'Pedido criado com sucesso',
      order_id: order.id,
      order_number: order.order_number,
      tracking_code: order.tracking_code,
      total_amount: totalAmount,
    })
  } catch (error) {
    console.error('Erro na API de checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
