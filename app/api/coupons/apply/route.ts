// =====================================================
// API: APLICAR CUPOM DE DESCONTO
// YOOBE v3.0.0 - Coupon API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { couponService } from '@/lib/services/coupon-service'
import { auditService } from '@/lib/services/audit-service'
import { ApplyCouponRequest } from '@/types/advanced-features'

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
    const body: ApplyCouponRequest = await request.json()
    const { coupon_code, checkout_session_id, tenant_id } = body

    // Validações básicas
    if (!coupon_code || !checkout_session_id || !tenant_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Código do cupom, ID da sessão de checkout e tenant_id são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Aplicar cupom
    const result = await couponService.applyCoupon({
      coupon_code,
      checkout_session_id,
      tenant_id,
    })

    if (result.success && result.data) {
      // Registrar auditoria de aplicação
      try {
        await auditService.logCreate(
          tenant_id,
          'coupon_usage',
          'coupon_applied',
          {
            user_id: user.id,
            coupon_code,
            checkout_session_id,
            discount_amount: result.data.discount_amount,
            final_total: result.data.final_total,
            ip_address: request.ip || 'unknown',
          }
        )
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError)
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Cupom aplicado com sucesso!',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Erro ao aplicar cupom',
      })
    }
  } catch (error) {
    console.error('Erro ao aplicar cupom:', error)

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
