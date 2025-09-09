import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Listar políticas de acesso
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
      .from('access_policies')
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

// POST - Criar política de acesso
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
    const { tenantId, name, rule, isActive = true } = body

    if (!tenantId || !name || !rule) {
      return NextResponse.json(
        {
          error: 'tenantId, name e rule são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar schema da regra
    if (!validateAccessRule(rule)) {
      return NextResponse.json(
        {
          error: 'Formato de regra inválido',
        },
        { status: 400 }
      )
    }

    const { data: policy, error: policyError } = await supabase
      .from('access_policies')
      .insert({
        tenant_id: tenantId,
        name,
        rule,
        is_active: isActive,
      })
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

// PUT - Atualizar política de acesso
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
    const { id, name, rule, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    // Validar schema da regra se fornecida
    if (rule && !validateAccessRule(rule)) {
      return NextResponse.json(
        {
          error: 'Formato de regra inválido',
        },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (rule !== undefined) updateData.rule = rule
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: policy, error: policyError } = await supabase
      .from('access_policies')
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

// DELETE - Deletar política de acesso
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
      .from('access_policies')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Política deletada com sucesso',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Função para validar schema da regra de acesso
function validateAccessRule(rule: any): boolean {
  try {
    // Verificar se é um objeto
    if (typeof rule !== 'object' || rule === null) {
      return false
    }

    // Verificar campos opcionais
    if (rule.allowedDepartments && !Array.isArray(rule.allowedDepartments)) {
      return false
    }

    if (rule.requiredUserTags && !Array.isArray(rule.requiredUserTags)) {
      return false
    }

    if (
      rule.productTagLogic &&
      !['ANY', 'ALL'].includes(rule.productTagLogic)
    ) {
      return false
    }

    if (rule.timeWindowIds && !Array.isArray(rule.timeWindowIds)) {
      return false
    }

    if (
      rule.defaultAllowUnlessTagged &&
      typeof rule.defaultAllowUnlessTagged !== 'boolean'
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}
