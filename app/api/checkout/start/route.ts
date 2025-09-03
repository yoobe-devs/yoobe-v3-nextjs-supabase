// =====================================================
// API: INICIAR CHECKOUT
// YOOBE v3.1.0 - Checkout API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkoutService } from '@/lib/services/checkout-service'
import { auditService } from '@/lib/services/audit-service'
import { StartCheckoutRequest, CheckoutResponse } from '@/types/cart'
import { z } from 'zod'

const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zip_code: z.string().min(1),
  state: z.string().optional(),
  country: z.string().optional(),
})

const StartCheckoutSchema = z.object({
  shipping_address: AddressSchema,
  billing_address: AddressSchema.optional(),
  payment_method: z.string().min(1),
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
    const parsed = StartCheckoutSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 422 }
      )
    }
    const { shipping_address, billing_address, payment_method, metadata } =
      parsed.data as StartCheckoutRequest

    // Obter cart_id da query string
    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cart_id')

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'ID do carrinho é obrigatório' },
        { status: 400 }
      )
    }

    // Obter tenant_id do usuário (em produção, viria do contexto)
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    // Criar sessão de checkout
    const checkoutSession = await checkoutService.createCheckoutFromCart(
      cartId,
      { shipping_address, billing_address, payment_method, metadata }
    )

    // Registrar auditoria
    try {
      await auditService.logCreate(
        tenantId,
        'checkout_sessions',
        checkoutSession.id,
        {
          cart_id: cartId,
          payment_method,
          amount_total: checkoutSession.amount_total,
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

    // Buscar sessão completa com detalhes
    const sessionWithDetails = await checkoutService.getCheckoutSession(
      checkoutSession.id
    )

    const response: CheckoutResponse = {
      success: true,
      data: sessionWithDetails,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Erro ao iniciar checkout:', error)

    const response: CheckoutResponse = {
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
