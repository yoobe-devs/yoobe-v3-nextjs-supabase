import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createApprovalPolicy } from '@/lib/approval-workflow'

// GET - Listar políticas de aprovação
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

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId é obrigatório' },
        { status: 400 }
      )
    }

    const { data: policies, error: policiesError } = await supabase
      .from('approval_policies')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (policiesError) {
      return NextResponse.json(
        { error: policiesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: policies,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar política de aprovação
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
    const { tenantId, name, description, spec } = body

    if (!tenantId || !name || !spec) {
      return NextResponse.json(
        {
          error: 'tenantId, name e spec são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar spec
    if (!validateApprovalSpec(spec)) {
      return NextResponse.json(
        {
          error: 'Formato de spec inválido',
        },
        { status: 400 }
      )
    }

    const policy = await createApprovalPolicy(
      tenantId,
      name,
      description || '',
      spec
    )

    return NextResponse.json({
      success: true,
      data: policy,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar política de aprovação
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
    const { id, name, description, spec, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    // Validar spec se fornecido
    if (spec && !validateApprovalSpec(spec)) {
      return NextResponse.json(
        {
          error: 'Formato de spec inválido',
        },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (spec !== undefined) updateData.spec = spec
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: policy, error: policyError } = await supabase
      .from('approval_policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (policyError) {
      return NextResponse.json({ error: policyError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: policy,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deletar política de aprovação
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
      .from('approval_policies')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Política de aprovação deletada com sucesso',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Função para validar spec de aprovação
function validateApprovalSpec(spec: any): boolean {
  try {
    // Verificar se é um objeto
    if (typeof spec !== 'object' || spec === null) {
      return false
    }

    // Verificar thresholds
    if (!spec.thresholds || !Array.isArray(spec.thresholds)) {
      return false
    }

    for (const threshold of spec.thresholds) {
      if (typeof threshold !== 'object' || threshold === null) {
        return false
      }

      if (
        threshold.requiresApprovalAbove &&
        typeof threshold.requiresApprovalAbove !== 'boolean'
      ) {
        return false
      }

      if (
        threshold.maxPoints &&
        (typeof threshold.maxPoints !== 'number' || threshold.maxPoints <= 0)
      ) {
        return false
      }

      if (
        threshold.maxAmount &&
        (typeof threshold.maxAmount !== 'number' || threshold.maxAmount <= 0)
      ) {
        return false
      }
    }

    // Verificar steps
    if (!spec.steps || !Array.isArray(spec.steps)) {
      return false
    }

    for (const step of spec.steps) {
      if (typeof step !== 'object' || step === null) {
        return false
      }

      if (typeof step.step !== 'number' || step.step <= 0) {
        return false
      }

      if (!step.approver || typeof step.approver !== 'object') {
        return false
      }

      if (
        !['manager_of_department', 'role', 'user'].includes(step.approver.type)
      ) {
        return false
      }
    }

    // Verificar slaHours
    if (
      spec.slaHours &&
      (typeof spec.slaHours !== 'number' || spec.slaHours <= 0)
    ) {
      return false
    }

    // Verificar escalation se fornecido
    if (spec.escalation) {
      if (typeof spec.escalation !== 'object' || spec.escalation === null) {
        return false
      }

      if (
        spec.escalation.afterHours &&
        (typeof spec.escalation.afterHours !== 'number' ||
          spec.escalation.afterHours <= 0)
      ) {
        return false
      }

      if (
        spec.escalation.toRole &&
        typeof spec.escalation.toRole !== 'string'
      ) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}
