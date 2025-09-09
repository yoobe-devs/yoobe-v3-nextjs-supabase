// =====================================================
// API: ADICIONAR AO CARRINHO
// YOOBE v3.1.0 - Cart API com validação de elegibilidade por tags
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { cartService } from '@/lib/services/cart-service'
import { auditService } from '@/lib/services/audit-service'
import { AddToCartRequest, CartResponse } from '@/types/cart'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

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

    // Obter dados da requisição
    const body: AddToCartRequest = await request.json()
    const { product_id, quantity, metadata } = body

    // Validação básica
    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Obter tenant_id do usuário
    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa não encontrado no token' },
        { status: 400 }
      )
    }

    // VALIDAÇÃO DE ELEGIBILIDADE POR TAGS
    const { data: eligibilityResult, error: eligibilityError } = await supabaseService
      .rpc('fn_is_product_allowed_for_employee', {
        p_tenant_id: companyId,
        p_user_id: user.id,
        p_product_id: product_id
      })

    if (eligibilityError) {
      console.error('Erro ao verificar elegibilidade:', eligibilityError)
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar elegibilidade do produto' },
        { status: 500 }
      )
    }

    const isAllowed = eligibilityResult?.[0]?.is_allowed
    const reason = eligibilityResult?.[0]?.reason

    if (!isAllowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Produto não elegível',
          details: {
            reason,
            product_id,
            code: 'PRODUCT_NOT_ELIGIBLE'
          }
        },
        { status: 403 }
      )
    }

    // Adicionar ao carrinho
    const cartItem = await cartService.addToCart(
      { product_id, quantity, metadata },
      companyId
    )

    // Registrar auditoria
    try {
      await auditService.logCreate(
        companyId,
        'cart_items',
        cartItem.id,
        { product_id, quantity, metadata },
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

    // Buscar carrinho completo com itens
    const cart = await cartService.getCartWithItems(cartItem.cart_id)

    const response: CartResponse = {
      success: true,
      data: cart,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error)

    const response: CartResponse = {
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
