import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { storeId, items, usePoints, currency } = await request.json()

    if (!storeId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Calcular total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + item.unitPrice * item.quantity
    }, 0)

    // Calcular desconto de pontos
    const pointsValue = (usePoints || 0) * 0.1 // 1 ponto = R$ 0,10
    const finalAmount = Math.max(0, totalAmount - pointsValue)

    // Gerar número do pedido e código de rastreamento
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`
    const trackingCode = `TRK-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`

    // Criar pedido no banco
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        tracking_code: trackingCode,
        company_id: storeId,
        user_id: user.id,
        status: finalAmount === 0 ? 'confirmed' : 'pending_payment',
        total_amount: finalAmount,
        points_used: usePoints || 0,
        currency: currency || 'BRL',
        items: items,
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

    // Se o pedido foi pago 100% com pontos
    if (finalAmount === 0) {
      // Deduzir pontos do usuário
      if (usePoints > 0) {
        const { error: pointsError } = await supabase
          .from('point_transactions')
          .insert({
            company_id: storeId,
            user_id: user.id,
            type: 'spend',
            points: -usePoints,
            source: 'order_redemption',
            order_id: order.id,
            note: `Resgate do pedido ${orderNumber}`,
          })

        if (pointsError) {
          console.error('Erro ao deduzir pontos:', pointsError)
        }
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber,
        trackingCode,
        amountDue: 0,
        message: 'Pedido confirmado com pontos',
      })
    }

    // Se há valor a pagar, retornar URL do Stripe (mock)
    const stripeUrl = `https://checkout.stripe.com/pay/cs_test_${Math.random()
      .toString(36)
      .substr(2, 20)}`

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      trackingCode,
      amountDue: finalAmount,
      checkoutUrl: stripeUrl,
    })
  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
