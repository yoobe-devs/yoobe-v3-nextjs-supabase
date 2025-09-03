import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logErrorToCatalog } from '@/lib/points-utils'
import { ApiError } from '@/types/points'

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
          route: '/api/gestor/points-conversion/[id]/activate',
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
          route: '/api/gestor/points-conversion/[id]/activate',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    if (userProfile.role !== 'gestor' && userProfile.role !== 'admin_global') {
      const error: ApiError = {
        success: false,
        error: {
          message:
            'Acesso negado. Apenas gestores podem ativar regras de conversão.',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion/[id]/activate',
        },
      }
      return NextResponse.json(error, { status: 403 })
    }

    const ruleId = params.id

    // Verificar se a regra existe e pertence ao tenant
    const { data: rule, error: ruleError } = await supabase
      .from('points_conversion_rules')
      .select('*')
      .eq('id', ruleId)
      .eq('tenant_id', userProfile.tenant_id)
      .single()

    if (ruleError || !rule) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Regra de conversão não encontrada',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion/[id]/activate',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Verificar se a regra pode ser ativada
    if (rule.status === 'active') {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Regra já está ativa',
          code: 'ALREADY_ACTIVE',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/gestor/points-conversion/[id]/activate',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Desativar todas as regras ativas do tenant
    await supabase
      .from('points_conversion_rules')
      .update({
        status: 'inactive',
        effective_to: new Date().toISOString(),
      })
      .eq('tenant_id', userProfile.tenant_id)
      .eq('status', 'active')

    // Ativar a regra selecionada
    const { data: activatedRule, error: activateError } = await supabase
      .from('points_conversion_rules')
      .update({
        status: 'active',
        effective_from: new Date().toISOString(),
        effective_to: null,
      })
      .eq('id', ruleId)
      .select()
      .single()

    if (activateError) {
      throw new Error(`Erro ao ativar regra: ${activateError.message}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        rule_id: activatedRule.id,
        status: activatedRule.status,
        activated_at: new Date().toISOString(),
        message: 'Regra ativada com sucesso',
      },
      error: null,
      meta: {
        tenant_id: userProfile.tenant_id,
        activated_by: user.id,
      },
    })
  } catch (error) {
    console.error('Erro ao ativar regra de conversão:', error)

    await logErrorToCatalog(
      'conversion_rules_activate_error',
      '/api/gestor/points-conversion/[id]/activate',
      error as Error,
      {
        rule_id: params.id,
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
        route: '/api/gestor/points-conversion/[id]/activate',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
