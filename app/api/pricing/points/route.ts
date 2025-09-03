import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateProductPointsPrice } from '@/lib/points-utils'
import { logErrorToCatalog } from '@/lib/points-utils'
import { PointsPricingResponse, ApiError } from '@/types/points'

export async function GET(request: NextRequest) {
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
          route: '/api/pricing/points',
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
          route: '/api/pricing/points',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url)
    const storeProductId = searchParams.get('store_product_id')

    if (!storeProductId) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'ID do produto é obrigatório',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'store_product_id',
              message: 'Parâmetro obrigatório na query string',
              code: 'REQUIRED',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/pricing/points',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Calcular preço em pontos
    const pricing = await calculateProductPointsPrice(
      storeProductId,
      userProfile.tenant_id
    )

    if (!pricing) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Produto não disponível para resgate por pontos',
          code: 'PRODUCT_NOT_AVAILABLE',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/pricing/points',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    return NextResponse.json(pricing)
  } catch (error) {
    console.error('Erro ao calcular preço em pontos:', error)

    await logErrorToCatalog(
      'points_pricing_error',
      '/api/pricing/points',
      error as Error,
      {
        store_product_id: 'unknown',
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
        route: '/api/pricing/points',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
