import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, currency = 'brl', company_id, order_id, payment_method_types = ['card'] } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    // Buscar empresa para obter conta Stripe
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id_br, stripe_account_id_us')
      .eq('id', company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Determinar qual conta Stripe usar baseado na moeda
    const stripeAccountId = currency === 'usd' ? company.stripe_account_id_us : company.stripe_account_id_br

    if (!stripeAccountId) {
      return NextResponse.json({ error: 'Conta Stripe não configurada para esta moeda' }, { status: 400 })
    }

    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: currency,
      payment_method_types: payment_method_types,
      metadata: {
        user_id: user.id,
        company_id: company_id,
        order_id: order_id
      },
      application_fee_amount: Math.round(amount * 0.029 + 30), // 2.9% + 30 centavos
      transfer_data: {
        destination: stripeAccountId,
      },
    }, {
      stripeAccount: stripeAccountId,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('Erro ao criar Payment Intent:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
