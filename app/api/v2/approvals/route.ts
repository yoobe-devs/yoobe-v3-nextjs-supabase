import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createApproval, getPendingApprovals } from '@/lib/approval-workflow'

// GET - Listar aprovações pendentes
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
    const tenantId = url.searchParams.get('tenantId')
    const type = url.searchParams.get('type') // 'pending' | 'all'

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId é obrigatório' },
        { status: 400 }
      )
    }

    const userId = user.id

    if (type === 'pending') {
      // Buscar aprovações pendentes para o usuário
      const pendingApprovals = await getPendingApprovals(userId, tenantId)

      return NextResponse.json({
        success: true,
        data: pendingApprovals,
      })
    } else {
      // Buscar todas as aprovações do tenant
      const { data: approvals, error: approvalsError } = await supabase
        .from('approvals')
        .select(
          `
          *,
          approval_steps(
            step_no,
            approver_user_id,
            approver_role,
            status,
            comment,
            acted_at
          )
        `
        )
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (approvalsError) {
        return NextResponse.json(
          { error: approvalsError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: approvals,
      })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar aprovação
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
    const { tenantId, requestType, requestId, policyId, meta = {} } = body

    if (!tenantId || !requestType || !requestId || !policyId) {
      return NextResponse.json(
        {
          error: 'tenantId, requestType, requestId e policyId são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar requestType
    if (!['rescue', 'order'].includes(requestType)) {
      return NextResponse.json(
        {
          error: 'requestType deve ser "rescue" ou "order"',
        },
        { status: 400 }
      )
    }

    const userId = user.id

    const approval = await createApproval(
      tenantId,
      requestType,
      requestId,
      policyId,
      userId,
      meta
    )

    return NextResponse.json({
      success: true,
      data: approval,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
