import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { checkoutService } from '@/lib/services/checkout-service'
import { auditService } from '@/lib/services/audit-service'
import { z } from 'zod'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

const ProcessPaymentSchema = z.object({
  session_id: z.string().uuid(),
  shipping_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zip_code: z.string().min(1),
    state: z.string().optional(),
    country: z.string().optional(),
  }),
  payment_method: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter e validar dados da requisição
    const rawBody = await request.json()
    const parsed = ProcessPaymentSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: parsed.error.flatten(),
        },
        { status: 422 }
      )
    }

    const { session_id, shipping_address, payment_method } = parsed.data

    // Obter tenant_id do usuário
    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa não encontrado' },
        { status: 400 }
      )
    }

    // Buscar sessão de checkout
    const session = await checkoutService.getCheckoutSession(session_id)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a sessão pertence ao usuário
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar se a sessão ainda está ativa
    if (session.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Sessão já foi processada ou expirou' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem pontos suficientes
    const { data: userPoints, error: pointsError } = await supabaseService
      .from('users')
      .select('points')
      .eq('id', user.id)
      .single()

    if (pointsError || !userPoints) {
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar pontos do usuário' },
        { status: 500 }
      )
    }

    if (userPoints.points < session.amount_total) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pontos insuficientes',
          details: {
            required: session.amount_total,
            available: userPoints.points,
            shortfall: session.amount_total - userPoints.points,
          },
        },
        { status: 400 }
      )
    }

    // Processar pagamento com pontos
    const { data: paymentResult, error: paymentError } =
      await supabaseService.rpc('process_points_payment', {
        p_user_id: user.id,
        p_tenant_id: companyId,
        p_amount: session.amount_total,
        p_session_id: session_id,
        p_description: `Resgate de brindes - Sessão ${session_id}`,
      })

    if (paymentError) {
      console.error('Erro ao processar pagamento:', paymentError)
      return NextResponse.json(
        { success: false, error: 'Erro ao processar pagamento' },
        { status: 500 }
      )
    }

    // Atualizar sessão de checkout
    const { error: updateError } = await supabaseService
      .from('checkout_sessions')
      .update({
        status: 'completed',
        payment_status: 'paid',
        shipping_address,
        payment_method,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id)

    if (updateError) {
      console.error('Erro ao atualizar sessão:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erro ao finalizar checkout' },
        { status: 500 }
      )
    }

    // Atualizar status do carrinho
    const { error: cartError } = await supabaseService
      .from('carts')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.cart_id)

    if (cartError) {
      console.error('Erro ao atualizar carrinho:', cartError)
      // Não falhar a operação por erro no carrinho
    }

    // Registrar auditoria
    try {
      await auditService.logUpdate(
        companyId,
        'checkout_sessions',
        session_id,
        {
          status: 'completed',
          payment_status: 'paid',
          shipping_address,
          payment_method,
        },
        {
          user_id: user.id,
          ip_address: request.ip || 'unknown',
          session_id: request.headers.get('x-session-id'),
        }
      )
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
      // Não falhar a operação principal por erro de auditoria
    }

    // Buscar sessão atualizada
    const updatedSession = await checkoutService.getCheckoutSession(session_id)

    return NextResponse.json({
      success: true,
      data: {
        session: updatedSession,
        payment: paymentResult,
        message: 'Resgate realizado com sucesso!',
      },
    })
  } catch (error) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
