import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { processPointsCheckout } from '@/lib/points-utils'
import { logErrorToCatalog } from '@/lib/points-utils'
import {
  CheckoutPointsRequest,
  CheckoutPointsResponse,
  ApiError,
} from '@/types/points'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Não autorizado',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/checkout/points',
        },
      }
      return NextResponse.json(error, { status: 401 })
    }

    // Obter tenant_id do usuário
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.tenant_id) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Perfil de usuário não encontrado',
          code: 'PROFILE_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/checkout/points',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Validar payload
    const body = await request.json()
    const { store_product_id, qty, address_id, idempotency_key, meta } = body

    if (!store_product_id || !qty || !idempotency_key) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Campos obrigatórios não fornecidos',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'store_product_id',
              message: 'ID do produto é obrigatório',
              code: 'REQUIRED',
            },
            {
              field: 'qty',
              message: 'Quantidade é obrigatória',
              code: 'REQUIRED',
            },
            {
              field: 'idempotency_key',
              message: 'Chave de idempotência é obrigatória',
              code: 'REQUIRED',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/checkout/points',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (qty <= 0) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Quantidade deve ser maior que zero',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'qty',
              message: 'Quantidade deve ser maior que zero',
              code: 'INVALID_VALUE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/checkout/points',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Verificar se o produto existe e permite pontos
    const { data: product, error: productError } = await supabase
      .from('product_store')
      .select('*')
      .eq('id', store_product_id)
      .eq('tenant_id', userProfile.tenant_id)
      .eq('allow_points', true)
      .single()

    if (productError || !product) {
      const error: ApiError = {
        success: false,
        error: {
          message:
            'Produto não encontrado ou não disponível para resgate por pontos',
          code: 'PRODUCT_NOT_AVAILABLE',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/checkout/points',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Verificar estoque
    if (product.stock_quantity !== null && product.stock_quantity < qty) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Estoque insuficiente',
          code: 'INSUFFICIENT_STOCK',
          details: [
            {
              field: 'qty',
              message: `Estoque disponível: ${product.stock_quantity}`,
              code: 'STOCK_LIMIT',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/checkout/points',
        },
      }
      return NextResponse.json(error, { status: 422 })
    }

    // Processar checkout por pontos
    const result = await processPointsCheckout(
      { store_product_id, qty, address_id, idempotency_key, meta },
      user.id,
      userProfile.tenant_id
    )

    // Atualizar estoque
    if (product.stock_quantity !== null) {
      const { error: stockError } = await supabase
        .from('product_store')
        .update({
          stock_quantity: product.stock_quantity - qty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', store_product_id)

      if (stockError) {
        console.error('Erro ao atualizar estoque:', stockError)
        // Não falhar o checkout por erro de estoque, apenas logar
      }
    }

    const response: CheckoutPointsResponse = {
      success: true,
      data: {
        redemption_id: result.redemptionId,
        total_points: result.totalPoints,
        status: 'approved',
        estimated_delivery: '5-7 dias úteis',
      },
      error: null,
      meta: {
        checkout_at: new Date().toISOString(),
        conversion_snapshot: {
          product_price_brl: product.price,
          points_per_currency: product.points_override
            ? 'override'
            : 'calculated',
          qty,
          total_brl: product.price * qty,
        },
      },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Erro ao processar checkout por pontos:', error)

    await logErrorToCatalog(
      'checkout_points_error',
      '/api/checkout/points',
      error as Error,
      {
        store_product_id: 'unknown',
        qty: 'unknown',
        user_id: 'unknown',
      }
    )

    const apiError: ApiError = {
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      data: null,
      meta: {
        request_id: request.headers.get('x-request-id') || 'unknown',
        route: '/api/checkout/points',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
