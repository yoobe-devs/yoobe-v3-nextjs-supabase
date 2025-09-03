// =====================================================
// API: VALIDAR CUPOM DE DESCONTO
// YOOBE v3.1.0 - Coupon API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { couponService } from '@/lib/services/coupon-service'
import { auditService } from '@/lib/services/audit-service'
import {
  CouponValidationRequest,
  CouponValidationResult,
} from '@/types/advanced-features'

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
    const body: CouponValidationRequest = await request.json()
    const { code, order_total, products, categories } = body

    // Validações básicas
    if (!code || !order_total) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código do cupom e valor do pedido são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Obter tenant_id do usuário (implementar conforme sua lógica)
    const tenantId = 'default-tenant' // Substituir por lógica real

    // Validar cupom
    const validationResult = await couponService.validateCoupon(
      {
        code,
        order_total,
        user_id: user.id,
        products,
        categories,
      },
      tenantId
    )

    // Registrar auditoria
    try {
      await auditService.logAccess(
        tenantId,
        'discount_coupons',
        'validation',
        'READ',
        {
          user_id: user.id,
          coupon_code: code,
          order_total,
          validation_result: validationResult,
          ip_address: request.ip || 'unknown',
        }
      )
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }

    if (validationResult.valid) {
      return NextResponse.json({
        success: true,
        data: validationResult,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: validationResult.error,
      })
    }
  } catch (error) {
    console.error('Erro ao validar cupom:', error)

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
