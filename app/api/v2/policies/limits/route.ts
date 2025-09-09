import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createRedemptionLimit } from '@/lib/time-windows'

// GET - Listar limites de resgate
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

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenantId')
    const scope = url.searchParams.get('scope')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId é obrigatório' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('redemption_limits')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (scope) {
      query = query.eq('scope', scope)
    }

    const { data: limits, error: limitsError } = await query

    if (limitsError) {
      return NextResponse.json({ error: limitsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: limits,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar limite de resgate
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

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { tenantId, scope, refId, period, maxQty, maxPoints, maxAmount } =
      body

    if (!tenantId || !scope || !period) {
      return NextResponse.json(
        {
          error: 'tenantId, scope e period são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar scope
    if (!['user', 'department', 'category'].includes(scope)) {
      return NextResponse.json(
        {
          error: 'scope deve ser "user", "department" ou "category"',
        },
        { status: 400 }
      )
    }

    // Validar period
    if (
      !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(period)
    ) {
      return NextResponse.json(
        {
          error:
            'period deve ser "daily", "weekly", "monthly", "quarterly" ou "yearly"',
        },
        { status: 400 }
      )
    }

    // Validar que pelo menos um limite foi definido
    if (!maxQty && !maxPoints && !maxAmount) {
      return NextResponse.json(
        {
          error:
            'Pelo menos um limite deve ser definido (maxQty, maxPoints ou maxAmount)',
        },
        { status: 400 }
      )
    }

    // Validar valores numéricos
    if (maxQty && (typeof maxQty !== 'number' || maxQty <= 0)) {
      return NextResponse.json(
        {
          error: 'maxQty deve ser um número positivo',
        },
        { status: 400 }
      )
    }

    if (maxPoints && (typeof maxPoints !== 'number' || maxPoints <= 0)) {
      return NextResponse.json(
        {
          error: 'maxPoints deve ser um número positivo',
        },
        { status: 400 }
      )
    }

    if (maxAmount && (typeof maxAmount !== 'number' || maxAmount <= 0)) {
      return NextResponse.json(
        {
          error: 'maxAmount deve ser um número positivo',
        },
        { status: 400 }
      )
    }

    const limit = await createRedemptionLimit(
      tenantId,
      scope,
      refId || '',
      period,
      maxQty,
      maxPoints,
      maxAmount
    )

    return NextResponse.json({
      success: true,
      data: limit,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar limite de resgate
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { id, scope, refId, period, maxQty, maxPoints, maxAmount, isActive } =
      body

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    // Validar scope se fornecido
    if (scope && !['user', 'department', 'category'].includes(scope)) {
      return NextResponse.json(
        {
          error: 'scope deve ser "user", "department" ou "category"',
        },
        { status: 400 }
      )
    }

    // Validar period se fornecido
    if (
      period &&
      !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(period)
    ) {
      return NextResponse.json(
        {
          error:
            'period deve ser "daily", "weekly", "monthly", "quarterly" ou "yearly"',
        },
        { status: 400 }
      )
    }

    // Validar valores numéricos se fornecidos
    if (maxQty !== undefined && (typeof maxQty !== 'number' || maxQty <= 0)) {
      return NextResponse.json(
        {
          error: 'maxQty deve ser um número positivo',
        },
        { status: 400 }
      )
    }

    if (
      maxPoints !== undefined &&
      (typeof maxPoints !== 'number' || maxPoints <= 0)
    ) {
      return NextResponse.json(
        {
          error: 'maxPoints deve ser um número positivo',
        },
        { status: 400 }
      )
    }

    if (
      maxAmount !== undefined &&
      (typeof maxAmount !== 'number' || maxAmount <= 0)
    ) {
      return NextResponse.json(
        {
          error: 'maxAmount deve ser um número positivo',
        },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (scope !== undefined) updateData.scope = scope
    if (refId !== undefined) updateData.ref_id = refId
    if (period !== undefined) updateData.period = period
    if (maxQty !== undefined) updateData.max_qty = maxQty
    if (maxPoints !== undefined) updateData.max_points = maxPoints
    if (maxAmount !== undefined) updateData.max_amount = maxAmount
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: limit, error: limitError } = await supabase
      .from('redemption_limits')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (limitError) {
      return NextResponse.json({ error: limitError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: limit,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deletar limite de resgate
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('redemption_limits')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Limite de resgate deletado com sucesso',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
