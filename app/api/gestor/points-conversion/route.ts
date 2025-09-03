import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logErrorToCatalog } from '@/lib/points-utils'
import {
  PointsConversionRequest,
  PointsConversionResponse,
  ApiError,
} from '@/types/points'

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
          route: '/api/gestor/points-conversion',
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
          route: '/api/gestor/points-conversion',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    if (userProfile.role !== 'gestor' && userProfile.role !== 'admin_global') {
      const error: ApiError = {
        success: false,
        error: {
          message:
            'Acesso negado. Apenas gestores podem configurar conversão de pontos.',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion',
        },
      }
      return NextResponse.json(error, { status: 403 })
    }

    // Obter regra ativa
    const { data: activeRule, error: ruleError } = await supabase
      .from('points_conversion_rules')
      .select('*')
      .eq('tenant_id', userProfile.tenant_id)
      .eq('status', 'active')
      .lte('effective_from', new Date().toISOString())
      .or(`effective_to.is.null,effective_to.gt.${new Date().toISOString()}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single()

    if (ruleError && ruleError.code !== 'PGRST116') {
      throw new Error(`Erro ao obter regra ativa: ${ruleError.message}`)
    }

    // Obter histórico de regras
    const { data: rulesHistory, error: historyError } = await supabase
      .from('points_conversion_rules')
      .select('*')
      .eq('tenant_id', userProfile.tenant_id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (historyError) {
      throw new Error(`Erro ao obter histórico: ${historyError.message}`)
    }

    // Calcular preview para valores comuns
    const preview = activeRule
      ? {
          brl_100: Math.ceil(100 * activeRule.points_per_currency),
          brl_50: Math.ceil(50 * activeRule.points_per_currency),
          brl_25: Math.ceil(25 * activeRule.points_per_currency),
          brl_10: Math.ceil(10 * activeRule.points_per_currency),
          brl_5: Math.ceil(5 * activeRule.points_per_currency),
        }
      : null

    return NextResponse.json({
      success: true,
      data: {
        active_rule: activeRule,
        rules_history: rulesHistory,
        preview,
      },
      error: null,
      meta: {
        tenant_id: userProfile.tenant_id,
        requested_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Erro ao obter regras de conversão:', error)

    await logErrorToCatalog(
      'conversion_rules_get_error',
      '/api/gestor/points-conversion',
      error as Error,
      { user_id: 'unknown' }
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
        route: '/api/gestor/points-conversion',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}

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
          route: '/api/gestor/points-conversion',
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
          route: '/api/gestor/points-conversion',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    if (userProfile.role !== 'gestor' && userProfile.role !== 'admin_global') {
      const error: ApiError = {
        success: false,
        error: {
          message:
            'Acesso negado. Apenas gestores podem configurar conversão de pontos.',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion',
        },
      }
      return NextResponse.json(error, { status: 403 })
    }

    // Validar payload
    const body = await request.json()
    const {
      points_per_currency,
      rounding_mode,
      min_points,
      max_points,
      effective_from,
      effective_to,
    } = body

    if (!points_per_currency || !rounding_mode) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Campos obrigatórios não fornecidos',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'points_per_currency',
              message: 'Taxa de conversão é obrigatória',
              code: 'REQUIRED',
            },
            {
              field: 'rounding_mode',
              message: 'Modo de arredondamento é obrigatório',
              code: 'REQUIRED',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (points_per_currency <= 0) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Taxa de conversão deve ser maior que zero',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'points_per_currency',
              message: 'Taxa deve ser maior que zero',
              code: 'INVALID_VALUE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (!['ceil', 'floor', 'round'].includes(rounding_mode)) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Modo de arredondamento inválido',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'rounding_mode',
              message: 'Modo deve ser ceil, floor ou round',
              code: 'INVALID_VALUE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Se a nova regra será ativa imediatamente, desativar regras anteriores
    const effectiveFrom = effective_from || new Date().toISOString()
    const willBeActive = new Date(effectiveFrom) <= new Date()

    if (willBeActive) {
      // Desativar regras anteriores
      await supabase
        .from('points_conversion_rules')
        .update({
          status: 'inactive',
          effective_to: new Date().toISOString(),
        })
        .eq('tenant_id', userProfile.tenant_id)
        .eq('status', 'active')
    }

    // Criar nova regra
    const { data: newRule, error: insertError } = await supabase
      .from('points_conversion_rules')
      .insert({
        tenant_id: userProfile.tenant_id,
        status: willBeActive ? 'active' : 'scheduled',
        base_currency: 'BRL',
        points_per_currency,
        rounding_mode,
        min_points: min_points || 0,
        max_points: max_points || null,
        effective_from: effectiveFrom,
        effective_to: effective_to || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Erro ao criar regra: ${insertError.message}`)
    }

    // Calcular preview
    const preview = {
      brl_100: Math.ceil(100 * points_per_currency),
      brl_50: Math.ceil(50 * points_per_currency),
      brl_25: Math.ceil(25 * points_per_currency),
      brl_10: Math.ceil(10 * points_per_currency),
      brl_5: Math.ceil(5 * points_per_currency),
    }

    const response: PointsConversionResponse = {
      success: true,
      data: {
        rule_id: newRule.id,
        status: newRule.status,
        preview,
      },
      error: null,
      meta: {
        created_at: new Date().toISOString(),
        effective_from: effectiveFrom,
      },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar regra de conversão:', error)

    await logErrorToCatalog(
      'conversion_rules_create_error',
      '/api/gestor/points-conversion',
      error as Error,
      {
        points_per_currency: 'unknown',
        rounding_mode: 'unknown',
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
        route: '/api/gestor/points-conversion',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
