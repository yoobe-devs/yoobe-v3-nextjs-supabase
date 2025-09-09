import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const {
      addressId,
      addressInline,
      saveAsPrimary = false,
      paymentMethod,
      mixRatio = 1,
      notes,
    } = body

    // Validações
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Método de pagamento é obrigatório' },
        { status: 400 }
      )
    }

    if (!['pix', 'card', 'pontos', 'misto'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // 1. Resolver address_snapshot
    let addressSnapshot = null
    if (addressId) {
      // Buscar endereço salvo
      const { data: address, error: addressError } = await supabase
        .from('employee_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('tenant_id', tenantId)
        .eq('employee_id', employeeId)
        .single()

      if (addressError || !address) {
        return NextResponse.json(
          { error: 'Endereço não encontrado' },
          { status: 404 }
        )
      }

      addressSnapshot = address
    } else if (addressInline) {
      // Validar endereço inline
      if (
        !addressInline.postal_code ||
        !addressInline.street ||
        !addressInline.number ||
        !addressInline.city ||
        !addressInline.state
      ) {
        return NextResponse.json(
          { error: 'Endereço incompleto' },
          { status: 400 }
        )
      }

      addressSnapshot = addressInline

      // Salvar como principal se solicitado
      if (saveAsPrimary) {
        await supabase.from('employee_addresses').upsert({
          tenant_id: tenantId,
          employee_id: employeeId,
          is_primary: true,
          full_name: addressInline.full_name,
          document_id: addressInline.document_id,
          phone: addressInline.phone,
          country: addressInline.country || 'BR',
          postal_code: addressInline.postal_code,
          state: addressInline.state,
          city: addressInline.city,
          neighborhood: addressInline.neighborhood,
          street: addressInline.street,
          number: addressInline.number,
          complement: addressInline.complement,
          reference: addressInline.reference,
          lat: addressInline.lat,
          lng: addressInline.lng,
        })
      }
    } else {
      return NextResponse.json(
        { error: 'Endereço é obrigatório' },
        { status: 400 }
      )
    }

    // 2. Carregar cart_snapshot
    const cartItems = await getCartItemsFromStorage(tenantId, employeeId)
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
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

    // Montar cart_snapshot
    const cartSnapshot = cartItems
      .map((cartItem: any) => {
        const product = products?.find(p => p.id === cartItem.productId)
        if (!product) return null

        const pointsCost = Math.floor(product.price * 10)
        const subtotal = product.price * cartItem.quantity
        const subtotalPoints = pointsCost * cartItem.quantity

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          pointsCost,
          quantity: cartItem.quantity,
          subtotal,
          subtotalPoints,
          final_sku: product.final_sku,
        }
      })
      .filter(Boolean)

    const totalAmount = cartSnapshot.reduce(
      (sum, item) => sum + (item?.subtotal || 0),
      0
    )
    const totalPoints = cartSnapshot.reduce(
      (sum, item) => sum + (item?.subtotalPoints || 0),
      0
    )

    // 3. Processar pagamento (simulado)
    const paymentState = await processPayment(
      paymentMethod,
      totalAmount,
      totalPoints,
      mixRatio
    )

    // 4. Criar pedido
    const orderNumber = `ORD-${Date.now()}`
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        company_id: tenantId,
        store_id: tenantId, // Usando tenant_id como store_id temporariamente
        tenant_id: tenantId,
        employee_id: employeeId,
        total_amount: totalAmount,
        status: 'confirmed',
        payment_method: paymentMethod,
        payment_state: paymentState,
        address_snapshot: addressSnapshot,
        cart_snapshot: cartSnapshot,
        redemption_info: {
          total_points: totalPoints,
          conversion_rate: 10, // 1 real = 10 pontos
          payment_method: paymentMethod,
          mix_ratio: mixRatio,
        },
        tracking_info: {
          code: `TRK-${Date.now()}`,
          url: `https://tracking.example.com/TRK-${Date.now()}`,
          status: 'preparing',
        },
        invoice_info: {
          number: `NF-${Date.now()}`,
          url: `https://invoice.example.com/NF-${Date.now()}`,
        },
        confirmed_at: new Date().toISOString(),
        notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // 5. Criar itens do pedido
    const orderItems = cartSnapshot.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      base_product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price,
      unit_points: item.pointsCost,
      subtotal_points: item.subtotalPoints,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError)
      return NextResponse.json(
        { error: 'Erro ao criar itens do pedido' },
        { status: 500 }
      )
    }

    // 6. Limpar carrinho (simulado)
    await clearCartFromStorage(tenantId, employeeId)

    return NextResponse.json({
      orderId: order.id,
      number: orderNumber,
      payment_state: paymentState,
      redirectTo: `/gestor/pedidos/${order.id}`,
    })
  } catch (error) {
    console.error('Erro no POST /api/checkout/confirm:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função simulada para processar pagamento
async function processPayment(
  method: string,
  amount: number,
  points: number,
  mixRatio: number
) {
  // Simular processamento de pagamento
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Em produção, integrar com gateway de pagamento real
  return 'paid'
}

// Função simulada para buscar itens do carrinho
async function getCartItemsFromStorage(tenantId: string, employeeId: string) {
  // Em produção, isso viria de uma tabela de carrinho no banco
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
}

// Função simulada para limpar carrinho
async function clearCartFromStorage(tenantId: string, employeeId: string) {
  // Em produção, limpar tabela de carrinho no banco
  console.log('Carrinho limpo para:', tenantId, employeeId)
}










