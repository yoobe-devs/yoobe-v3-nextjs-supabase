import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getWalletBalance, getOrCreateWallet } from '@/lib/points-utils'
import { logErrorToCatalog } from '@/lib/points-utils'
import { WalletBalanceResponse, ApiError } from '@/types/points'

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
          route: '/api/wallet/balance',
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
          route: '/api/wallet/balance',
        },
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Obter ou criar carteira
    const wallet = await getOrCreateWallet(user.id, userProfile.tenant_id)

    // Obter saldo
    const balance = await getWalletBalance(user.id, userProfile.tenant_id)

    // Obter regra de conversão ativa para mostrar taxa
    const { data: conversionRule } = await supabase
      .from('points_conversion_rules')
      .select('points_per_currency')
      .eq('tenant_id', userProfile.tenant_id)
      .eq('status', 'active')
      .single()

    const response: WalletBalanceResponse = {
      success: true,
      data: {
        balance_points: balance,
        wallet_id: wallet.id,
        last_updated: new Date().toISOString(),
      },
      error: null,
      meta: {
        currency: 'BRL',
        conversion_rate: conversionRule?.points_per_currency,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao obter saldo da carteira:', error)

    // Registrar erro no catálogo
    await logErrorToCatalog(
      'wallet_balance_error',
      '/api/wallet/balance',
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
        route: '/api/wallet/balance',
      },
    }

    return NextResponse.json(apiError, { status: 500 })
  }
}
