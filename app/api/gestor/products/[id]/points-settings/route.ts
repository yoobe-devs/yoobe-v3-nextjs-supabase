import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logErrorToCatalog } from '@/lib/points-utils'
import { ProductPointsSettings, ApiError } from '@/types/points'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
          route: '/api/gestor/products/[id]/points-settings',
        },
      }
      return NextResponse.json(error, { status: 401 })
    }

    // Verificar se é gestor
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
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
          route: '/api/gestor/products/[id]/points-settings',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    if (userProfile.role !== 'gestor' && userProfile.role !== 'admin_global') {
      const error: ApiError = {
        success: false,
        error: {
          message:
            'Acesso negado. Apenas gestores podem configurar pontos nos produtos.',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/products/[id]/points-settings',
        },
      }
      return NextResponse.json(error, { status: 403 })
    }

    const productId = params.id

    // Verificar se o produto existe e pertence ao tenant
    const { data: product, error: productError } = await supabase
      .from('product_store')
      .select('*')
      .eq('id', productId)
      .eq('tenant_id', userProfile.tenant_id)
      .single()

    if (productError || !product) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Produto não encontrado',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/products/[id]/points-settings',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Validar payload
    const body = await request.json()
    const {
      allow_points,
      points_price,
      points_override,
      points_override_value,
    } = body

    if (typeof allow_points !== 'boolean') {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Campo allow_points deve ser um booleano',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'allow_points',
              message: 'Deve ser true ou false',
              code: 'INVALID_TYPE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/products/[id]/points-settings',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (allow_points && typeof points_override !== 'boolean') {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Campo points_override deve ser um booleano',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'points_override',
              message: 'Deve ser true ou false',
              code: 'INVALID_TYPE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/products/[id]/points-settings',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (
      allow_points &&
      points_override &&
      (!points_override_value || points_override_value <= 0)
    ) {
      const error: ApiError = {
        success: false,
        error: {
          message:
            'Valor de override é obrigatório quando points_override é true',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'points_override_value',
              message: 'Deve ser maior que zero',
              code: 'REQUIRED',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/products/[id]/points-settings',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = {
      allow_points,
      points_override,
      updated_at: new Date().toISOString(),
    }

    if (allow_points) {
      if (points_override) {
        updateData.points_override_value = points_override_value
        updateData.points_price = null // Limpar preço calculado
      } else {
        updateData.points_override_value = null
        // Calcular preço em pontos baseado na regra ativa
        const { data: conversionRule } = await supabase
          .from('points_conversion_rules')
          .select('points_per_currency, rounding_mode')
          .eq('tenant_id', userProfile.tenant_id)
          .eq('status', 'active')
          .single()

        if (conversionRule) {
          let calculatedPoints: number
          switch (conversionRule.rounding_mode) {
            case 'ceil':
              calculatedPoints = Math.ceil(
                product.price * conversionRule.points_per_currency
              )
              break
            case 'floor':
              calculatedPoints = Math.floor(
                product.price * conversionRule.points_per_currency
              )
              break
            case 'round':
              calculatedPoints = Math.round(
                product.price * conversionRule.points_per_currency
              )
              break
            default:
              calculatedPoints = Math.ceil(
                product.price * conversionRule.points_per_currency
              )
          }
          updateData.points_price = calculatedPoints
        }
      }
    } else {
      // Se não permite pontos, limpar todos os campos relacionados
      updateData.points_price = null
      updateData.points_override = false
      updateData.points_override_value = null
    }

    // Atualizar produto
    const { data: updatedProduct, error: updateError } = await supabase
      .from('product_store')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar produto: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        product_id: updatedProduct.id,
        allow_points: updatedProduct.allow_points,
        points_price: updatedProduct.points_price,
        points_override: updatedProduct.points_override,
        points_override_value: updatedProduct.points_override_value,
        message: 'Configuração de pontos atualizada com sucesso',
      },
      error: null,
      meta: {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar configuração de pontos do produto:', error)

    await logErrorToCatalog(
      'product_points_settings_error',
      '/api/gestor/products/[id]/points-settings',
      error as Error,
      {
        product_id: params.id,
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
        route: '/api/gestor/products/[id]/points-settings',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
