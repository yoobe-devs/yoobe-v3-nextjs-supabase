import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null
const endpointSecret = WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  if (!stripe || !endpointSecret) {
    // In build or missing envs, no-op to avoid build failures
    return NextResponse.json({ ok: true })
  }
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    console.error('Erro na assinatura do webhook:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent, supabase)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent, supabase)
        break
      
      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge, supabase)
        break
      
      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { order_id, user_id, company_id } = paymentIntent.metadata

  if (!order_id) {
    console.error('Order ID não encontrado no metadata')
    return
  }

  // Atualizar status do pedido
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      payment_intent_id: paymentIntent.id,
      paid_at: new Date().toISOString()
    })
    .eq('id', order_id)

  if (orderError) {
    console.error('Erro ao atualizar pedido:', orderError)
    return
  }

  // Criar notificação para o usuário
  await supabase
    .from('notifications')
    .insert({
      user_id: user_id,
      type: 'success',
      title: 'Pagamento Confirmado',
      message: `Seu pedido ${order_id} foi confirmado com sucesso!`,
      action_url: `/store/orders/${order_id}/confirmed`
    })

  console.log(`Pagamento confirmado para pedido ${order_id}`)
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { order_id, user_id } = paymentIntent.metadata

  if (!order_id) {
    console.error('Order ID não encontrado no metadata')
    return
  }

  // Atualizar status do pedido
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'payment_failed',
      payment_intent_id: paymentIntent.id
    })
    .eq('id', order_id)

  if (orderError) {
    console.error('Erro ao atualizar pedido:', orderError)
    return
  }

  // Criar notificação para o usuário
  await supabase
    .from('notifications')
    .insert({
      user_id: user_id,
      type: 'error',
      title: 'Falha no Pagamento',
      message: `Houve um problema com o pagamento do pedido ${order_id}. Tente novamente.`,
      action_url: `/store/cart`
    })

  console.log(`Falha no pagamento para pedido ${order_id}`)
}

async function handleRefund(charge: Stripe.Charge, supabase: any) {
  const { order_id, user_id } = charge.metadata

  if (!order_id) {
    console.error('Order ID não encontrado no metadata')
    return
  }

  // Atualizar status do pedido
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString()
    })
    .eq('id', order_id)

  if (orderError) {
    console.error('Erro ao atualizar pedido:', orderError)
    return
  }

  // Criar notificação para o usuário
  await supabase
    .from('notifications')
    .insert({
      user_id: user_id,
      type: 'info',
      title: 'Reembolso Processado',
      message: `O reembolso do pedido ${order_id} foi processado com sucesso.`,
      action_url: `/store/orders/${order_id}`
    })

  console.log(`Reembolso processado para pedido ${order_id}`)
}
