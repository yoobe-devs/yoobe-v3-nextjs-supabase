// =====================================================
// API: CONVERSÃO DE MOEDAS
// YOOBE v3.1.0 - Currency API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { currencyService } from '@/lib/services/currency-service'
import { auditService } from '@/lib/services/audit-service'
import { CurrencyConversionRequest } from '@/types/advanced-features'

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
    const body: CurrencyConversionRequest = await request.json()
    const { amount, from_currency, to_currency, tenant_id } = body

    // Validações básicas
    if (!amount || !from_currency || !to_currency || !tenant_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Valor, moeda de origem, moeda de destino e tenant_id são obrigatórios',
        },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Converter moeda
    const conversionResult = await currencyService.convertCurrency({
      amount,
      from_currency,
      to_currency,
      tenant_id,
    })

    // Registrar auditoria
    try {
      await auditService.logAccess(
        tenant_id,
        'currencies',
        'conversion',
        'READ',
        {
          user_id: user.id,
          from_currency,
          to_currency,
          amount,
          converted_amount: conversionResult.converted_amount,
          exchange_rate: conversionResult.exchange_rate,
          ip_address: request.ip || 'unknown',
        }
      )
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: conversionResult,
    })
  } catch (error) {
    console.error('Erro ao converter moeda:', error)

    const response = {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
