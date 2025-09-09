import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { canViewProduct, canRedeem } from '@/lib/abac'

// POST - Verificar acesso por tags
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, tenantId, action = 'view', quantity, points } = body

    if (!productId || !tenantId) {
      return NextResponse.json(
        {
          error: 'productId e tenantId são obrigatórios',
        },
        { status: 400 }
      )
    }

    const userId = user.id

    if (action === 'view') {
      // Verificar se pode visualizar o produto
      const canView = await canViewProduct(userId, productId, tenantId)

      return NextResponse.json({
        success: true,
        data: {
          canAccess: canView,
          action: 'view',
          productId,
          userId,
          tenantId,
        },
      })
    }

    if (action === 'redeem') {
      // Verificar se pode resgatar o produto
      if (!quantity || !points) {
        return NextResponse.json(
          {
            error: 'quantity e points são obrigatórios para ação redeem',
          },
          { status: 400 }
        )
      }

      const redeemCheck = await canRedeem(
        userId,
        productId,
        quantity,
        points,
        tenantId
      )

      return NextResponse.json({
        success: true,
        data: {
          canAccess: redeemCheck.canRedeem,
          action: 'redeem',
          productId,
          userId,
          tenantId,
          requiresApproval: redeemCheck.requiresApproval,
          reason: redeemCheck.reason,
        },
      })
    }

    return NextResponse.json(
      {
        error: 'Ação inválida. Use "view" ou "redeem"',
      },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Verificar acesso por tags (via query params)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    const tenantId = url.searchParams.get('tenantId')
    const action = url.searchParams.get('action') || 'view'

    if (!productId || !tenantId) {
      return NextResponse.json(
        {
          error: 'productId e tenantId são obrigatórios',
        },
        { status: 400 }
      )
    }

    const userId = user.id

    if (action === 'view') {
      // Verificar se pode visualizar o produto
      const canView = await canViewProduct(userId, productId, tenantId)

      return NextResponse.json({
        success: true,
        data: {
          canAccess: canView,
          action: 'view',
          productId,
          userId,
          tenantId,
        },
      })
    }

    return NextResponse.json(
      {
        error: 'Ação inválida. Use "view"',
      },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
