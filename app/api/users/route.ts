import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { UserSchema } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Verificar se usuário tem permissão para criar usuários
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }
    const canCreate = await requireRole(userId, companyId, 'gestor')
    if (!canCreate) {
      await audit('user_creation_denied', 'users', userId, undefined, { companyId, reason: 'insufficient_permissions' })
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente para criar usuários' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const userData = UserSchema.parse(body)

    // Verificar se email já existe
    const { data: existingUser, error: checkError } = await service
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      await audit('user_creation_failed', 'users', userId, undefined, { companyId, reason: 'email_already_exists', email: userData.email })
      return NextResponse.json(
        { success: false, error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    // Criar usuário
    const { data: user, error } = await service
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        phone: userData.phone,
        tax_id: userData.tax_id,
        fiscal_regime: userData.fiscal_regime,
        role: userData.role || 'funcionario',
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      await audit('user_creation_failed', 'users', userId, undefined, { companyId, error: error.message })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar role na empresa
    const { error: roleError } = await service
      .from('user_company_roles')
      .insert({
        user_id: user.id,
        company_id: companyId,
        role: userData.role || 'funcionario'
      })

    if (roleError) {
      // Rollback: deletar usuário criado
      await service.from('users').delete().eq('id', user.id)
      await audit('user_creation_failed', 'users', userId, undefined, { companyId, error: 'role_creation_failed' })
      return NextResponse.json(
        { success: false, error: 'Erro ao associar usuário à empresa' },
        { status: 500 }
      )
    }

    await audit('user_created', 'users', userId, user.id, { companyId, userRole: userData.role })
    
    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    await audit('user_creation_error', 'users', 'system', undefined, { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Verificar se usuário tem permissão para listar usuários
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }
    const canRead = await requireRole(userId, companyId, 'gestor')
    if (!canRead) {
      await audit('users_list_denied', 'users', userId, undefined, { companyId, reason: 'insufficient_permissions' })
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente para listar usuários' },
        { status: 400 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = service
      .from('users')
      .select(`
        *,
        user_company_roles!inner(role, company_id)
      `)
      .eq('user_company_roles.company_id', companyId)

    if (role) {
      query = query.eq('user_company_roles.role', role)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,surname.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error } = await query.order('created_at', { ascending: false })

    if (error) {
      await audit('users_list_error', 'users', userId, undefined, { companyId, error: error.message })
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar usuários' },
        { status: 500 }
      )
    }

    await audit('users_listed', 'users', userId, undefined, { companyId, count: users?.length || 0 })
    
    return NextResponse.json({ success: true, data: users || [] })
  } catch (error: any) {
    console.error('Error listing users:', error)
    await audit('users_list_error', 'users', 'system', undefined, { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
