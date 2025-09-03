// =====================================================
// API: ADICIONAR AO CARRINHO
// YOOBE v3.0.0 - Cart API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cartService } from '@/lib/services/cart-service'
import { auditService } from '@/lib/services/audit-service'
import { AddToCartRequest, CartResponse } from '@/types/cart'

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

    // Obter tenant_id do usuário (em produção, viria do contexto)
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    // Adicionar ao carrinho
    const cartItem = await cartService.addToCart(
      { product_id, quantity, metadata },
      tenantId
    )

    // Registrar auditoria
    try {
      await auditService.logCreate(
        tenantId,
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
