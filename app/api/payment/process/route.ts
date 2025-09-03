// =====================================================
// API: PROCESSAR PAGAMENTO
// YOOBE v3.1.0 - Payment API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { paymentGatewayService } from '@/lib/services/payment-gateway-service'
import { auditService } from '@/lib/services/audit-service'
import { ProcessPaymentRequest } from '@/types/advanced-features'
import { z } from 'zod'

// Validação do payload de processamento de pagamento
const ProcessPaymentSchema = z.object({
  checkout_session_id: z.string().min(1),
  gateway_id: z.string().min(1),
  payment_method: z.string().min(1),
  payment_data: z
    .object({
      amount: z.number().nonnegative(),
    })
    .passthrough(),
  currency_code: z.string().min(1).optional(),
  metadata: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies })
    let {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Fallback: Authorization Bearer token
    if (authError || !user) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const alt = await supabase.auth.getUser(token)
        user = alt.data.user
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter e validar dados da requisição
    const rawBody = (await request.json()) as unknown
    const parsed = ProcessPaymentSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload inválido',
          details: parsed.error.flatten(),
        },
        { status: 422 }
      )
    }

    const {
      checkout_session_id,
      gateway_id,
      payment_method,
      payment_data,
      currency_code,
      metadata,
    } = parsed.data as ProcessPaymentRequest

    // Header de idempotência (opcional)
    const idempotencyKey = request.headers.get('idempotency-key') || undefined

    // Verificar se a sessão de checkout pertence ao usuário
    const { data: checkoutSession, error: checkoutError } = await supabase
      .from('checkout_sessions')
      .select('user_id, tenant_id')
      .eq('id', checkout_session_id)
      .single()

    if (checkoutError || !checkoutSession) {
      return NextResponse.json(
        { success: false, error: 'Sessão de checkout não encontrada' },
        { status: 404 }
      )
    }

    if (checkoutSession.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado a esta sessão de checkout' },
        { status: 403 }
      )
    }

    // Idempotência por Idempotency-Key
    if (idempotencyKey) {
      try {
        const idemTx = await paymentGatewayService.getTransactionByIdempotency(
          checkout_session_id,
          idempotencyKey
        )
        if (idemTx) {
          return NextResponse.json({
            success: true,
            data: { transaction: idemTx },
            message: 'Pagamento já processado (Idempotency-Key).',
          })
        }
      } catch (e) {
        console.warn('Falha ao verificar Idempotency-Key:', e)
      }
    }

    // Idempotência simplificada: se já existir transação bem-sucedida
    // para esta sessão com mesmo método/valor, retorna a existente
    try {
      const existing = await paymentGatewayService.getTransactionsByCheckout(
        checkout_session_id
      )
      const match = existing.find(
        t =>
          t.status === 'succeeded' &&
          t.payment_method === (payment_method as any) &&
          Number(t.amount) === Number(payment_data.amount)
      )
      if (match) {
        return NextResponse.json({
          success: true,
          data: { transaction: match },
          message: 'Pagamento já processado (idempotente).',
        })
      }
    } catch (e) {
      // Não bloquear o processamento por falha de leitura de histórico
      console.warn('Falha ao verificar idempotência:', e)
    }

    // Processar pagamento
    const paymentResult = await paymentGatewayService.processPayment({
      checkout_session_id,
      gateway_id,
      payment_method,
      payment_data,
      currency_code,
      metadata: { ...(metadata || {}), idempotency_key: idempotencyKey },
    })

    if (paymentResult.success && paymentResult.data) {
      // Registrar auditoria de pagamento
      try {
        await auditService.logCreate(
          checkoutSession.tenant_id,
          'payment_transactions',
          paymentResult.data.transaction.id,
          {
            user_id: user.id,
            checkout_session_id,
            gateway_id,
            payment_method,
            amount: paymentResult.data.transaction.amount,
            currency_code,
            status: paymentResult.data.transaction.status,
            ip_address: request.ip || 'unknown',
          }
        )
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError)
      }

      return NextResponse.json({
        success: true,
        data: paymentResult.data,
        message: 'Pagamento processado com sucesso!',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error || 'Erro ao processar pagamento',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error)

    const response = {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Método não permitido' },
    { status: 405 }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
