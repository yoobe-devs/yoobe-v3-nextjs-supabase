import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { addPointsToWallet, getOrCreateWallet } from '@/lib/points-utils'
import { logErrorToCatalog } from '@/lib/points-utils'
import {
  WebhookGamificationRequest,
  WebhookGamificationResponse,
  ApiError,
} from '@/types/points'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { providerKey: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const providerKey = params.providerKey

    // Obter provedor
    const { data: provider, error: providerError } = await supabase
      .from('point_providers')
      .select('*')
      .eq('name', providerKey)
      .eq('is_active', true)
      .single()

    if (providerError || !provider) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Provedor não encontrado ou inativo',
          code: 'PROVIDER_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: `/api/webhooks/gamification/${providerKey}`,
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Validar assinatura HMAC se fornecida
    const signature = request.headers.get('x-provider-signature')
    if (signature) {
      const payload = await request.text()
      const expectedSignature = crypto
        .createHmac('sha256', provider.hmac_secret)
        .update(payload)
        .digest('hex')

      if (signature !== expectedSignature) {
        const error: ApiError = {
          success: false,
          error: {
            message: 'Assinatura inválida',
            code: 'INVALID_SIGNATURE',
            timestamp: new Date().toISOString(),
          },
          data: null,
          meta: {
            request_id: request.headers.get('x-request-id') || 'unknown',
            route: `/api/webhooks/gamification/${providerKey}`,
          },
        }
        return NextResponse.json(error, { status: 401 })
      }

      // Reconstruir o body para processamento
      request = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: payload,
      })
    }

    // Obter payload
    const body = await request.json()
    const { event_type, user_id, points, reason, idempotency_key, meta } = body

    if (!event_type || !user_id || !points || !reason || !idempotency_key) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Campos obrigatórios não fornecidos',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'event_type',
              message: 'Tipo de evento é obrigatório',
              code: 'REQUIRED',
            },
            {
              field: 'user_id',
              message: 'ID do usuário é obrigatório',
              code: 'REQUIRED',
            },
            {
              field: 'points',
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
          route: `/api/webhooks/gamification/${providerKey}`,
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    if (points <= 0) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Quantidade de pontos deve ser maior que zero',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'points',
              message: 'Quantidade deve ser maior que zero',
              code: 'INVALID_VALUE',
            },
          ],
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: `/api/webhooks/gamification/${providerKey}`,
        },
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user_id)
      .single()

    if (userError || !user?.tenant_id) {
      const error: ApiError = {
        success: false,
        error: {
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        data: null,
        meta: {
          request_id: request.headers.get('x-request-id') || 'unknown',
          route: `/api/webhooks/gamification/${providerKey}`,
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Registrar webhook no inbox para auditoria
    const { error: inboxError } = await supabase.from('webhook_inbox').insert({
      tenant_id: user.tenant_id,
      provider_id: provider.id,
      event_type,
      signature: signature || null,
      payload: body,
      idempotency_key,
      status: 'received',
    })

    if (inboxError) {
      console.error('Erro ao registrar webhook no inbox:', inboxError)
      // Não falhar o processamento por erro de auditoria
    }

    try {
      // Adicionar pontos à carteira
      const result = await addPointsToWallet(
        {
          user_id,
          amount_points: points,
          reason: 'external_award',
          idempotency_key,
          meta: {
            ...meta,
            provider: providerKey,
            event_type,
          },
        },
        user.tenant_id,
        'system' // Criado pelo sistema
      )

      // Marcar webhook como processado
      await supabase
        .from('webhook_inbox')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('idempotency_key', idempotency_key)

      const response: WebhookGamificationResponse = {
        success: true,
        data: {
          processed: true,
          wallet_updated: true,
          points_awarded: points,
          new_balance: result.newBalance,
        },
        error: null,
        meta: {
          processed_at: new Date().toISOString(),
          provider: providerKey,
        },
      }

      return NextResponse.json(response, { status: 200 })
    } catch (walletError) {
      // Marcar webhook como erro
      await supabase
        .from('webhook_inbox')
        .update({
          status: 'error',
          error:
            walletError instanceof Error
              ? walletError.message
              : 'Erro desconhecido',
          processed_at: new Date().toISOString(),
        })
        .eq('idempotency_key', idempotency_key)

      throw walletError
    }
  } catch (error) {
    console.error('Erro ao processar webhook de gamificação:', error)

    await logErrorToCatalog(
      'webhook_gamification_error',
      `/api/webhooks/gamification/${params.providerKey}`,
      error as Error,
      {
        provider_key: params.providerKey,
        event_type: 'unknown',
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
        route: `/api/webhooks/gamification/${params.providerKey}`,
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
