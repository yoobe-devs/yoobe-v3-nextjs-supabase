import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { addPointsToWallet } from '@/lib/points-utils'
import { logErrorToCatalog } from '@/lib/points-utils'
import {
  CreditPointsRequest,
  CreditPointsResponse,
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
          route: '/api/wallet/credit',
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
          route: '/api/wallet/credit',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    if (userProfile.role !== 'gestor' && userProfile.role !== 'admin_global') {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Acesso negado. Apenas gestores podem creditar pontos.',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/wallet/credit',
        },
      }
      return NextResponse.json(error, { status: 403 })
    }

    // Validar payload
    const body = await request.json()
    const { user_id, amount_points, reason, idempotency_key, meta } = body

    if (!user_id || !amount_points || !reason || !idempotency_key) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Campos obrigatórios não fornecidos',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'user_id',
              message: 'ID do usuário é obrigatório',
              code: 'REQUIRED',
            },
            {
              field: 'amount_points',
              message: 'Quantidade de pontos é obrigatória',
              code: 'REQUIRED',
            },
            {
              field: 'reason',
              message: 'Motivo é obrigatório',
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
          route: '/api/wallet/credit',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (amount_points <= 0) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Quantidade de pontos deve ser maior que zero',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'amount_points',
              message: 'Quantidade deve ser maior que zero',
              code: 'INVALID_VALUE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/wallet/credit',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (!['manual_credit', 'external_award'].includes(reason)) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Motivo inválido',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'reason',
              message: 'Motivo deve ser manual_credit ou external_award',
              code: 'INVALID_VALUE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: '/api/wallet/credit',
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Verificar se o usuário alvo pertence ao mesmo tenant (exceto para admin global)
    if (userProfile.role !== 'admin_global') {
      const { data: targetUser, error: targetUserError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user_id)
        .single()

      if (targetUserError || targetUser?.tenant_id !== userProfile.tenant_id) {
        const error: ApiError = {
          success: false,
          error: {
            message: 'Usuário não encontrado ou não pertence ao mesmo tenant',
            code: 'FORBIDDEN',
            timestamp: new Date().toISOString(),
          },
          data: null,
          meta: {
            request_id: request.headers.get('x-request-id') || 'unknown',
            route: '/api/wallet/credit',
          },
        }
        return NextResponse.json(error, { status: 403 })
      }
    }

    // Adicionar pontos
    const result = await addPointsToWallet(
      { user_id, amount_points, reason, idempotency_key, meta },
      userProfile.tenant_id,
      user.id
    )

    const response: CreditPointsResponse = {
      success: true,
      data: {
        entry_id: result.entryId,
        new_balance: result.newBalance,
        transaction_id: idempotency_key,
      },
      error: null,
      meta: {
        credited_at: new Date().toISOString(),
        credited_by: user.id,
      },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Erro ao creditar pontos:', error)

    // Registrar erro no catálogo
    await logErrorToCatalog(
      'wallet_credit_error',
      '/api/wallet/credit',
      error as Error,
      {
        user_id: 'unknown',
        amount_points: 'unknown',
        reason: 'unknown',
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
        route: '/api/wallet/credit',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
