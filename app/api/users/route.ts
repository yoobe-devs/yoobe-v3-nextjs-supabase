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
    const { userId, companyId } = await requireUser(req)

    // Verificar se usuário tem permissão para criar usuários
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }
    const canCreate = await requireRole(userId, companyId, 'gestor')
    if (!canCreate) {
      await audit('user_creation_denied', 'users', userId, undefined, {
        companyId,
        reason: 'insufficient_permissions',
      })
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente para criar usuários' },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Validar dados com schema
    const validation = UserSchema.safeParse(body)
    if (!validation.success) {
      await audit('user_creation_denied', 'users', userId, undefined, {
        companyId,
        reason: 'validation_failed',
        errors: validation.error.errors,
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const userData = validation.data

    // Criar usuário no Auth
    const { data: authUser, error: authError } =
      await service.auth.admin.createUser({
        email: userData.email,
        password: userData.password || 'temp123',
        email_confirm: true,
        user_metadata: {
          full_name: userData.name,
          role: userData.role,
        },
      })

    if (authError) {
      await audit('user_creation_failed', 'users', userId, undefined, {
        companyId,
        error: 'auth_creation_failed',
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar registro na tabela users
    const { data: newUser, error: createError } = await service
      .from('users')
      .insert({
        id: authUser.user.id,
        email: userData.email,
        full_name: userData.name,
        role: userData.role || 'user',
        company_id: companyId,
        points_balance: 0,
        status: 'active',
      })
      .select()
      .single()

    if (createError) {
      // Rollback: deletar usuário do Auth se a criação no banco falhou
      try {
        await service.auth.admin.deleteUser(authUser.user.id)
      } catch (rollbackError) {
        console.error('Erro ao fazer rollback do usuário:', rollbackError)
      }

      await audit('user_creation_failed', 'users', userId, undefined, {
        companyId,
        error: 'database_creation_failed',
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar role na empresa
    const { error: roleError } = await service
      .from('user_company_roles')
      .insert({
        user_id: newUser.id,
        company_id: companyId,
        role: userData.role || 'funcionario',
      })

    if (roleError) {
      // Rollback: deletar usuário criado
      await service.from('users').delete().eq('id', newUser.id)
      await audit('user_creation_failed', 'users', userId, undefined, {
        companyId,
        error: 'role_creation_failed',
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao associar usuário à empresa' },
        { status: 500 }
      )
    }

    await audit('user_created', 'users', userId, newUser.id, {
      companyId,
      userRole: userData.role,
    })

    return NextResponse.json({ success: true, data: newUser }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    await audit('user_creation_error', 'users', 'system', undefined, {
      error: error.message,
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser(req)

    // Verificar se usuário tem permissão para listar usuários
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }
    const canRead = await requireRole(userId, companyId, 'gestor')
    if (!canRead) {
      await audit('users_list_denied', 'users', userId, undefined, {
        companyId,
        reason: 'insufficient_permissions',
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Permissão insuficiente para listar usuários',
        },
        { status: 403 }
      )
    }

    // Buscar usuários da empresa
    const { data: users, error: usersError } = await service
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        role,
        status,
        company_id,
        points_balance,
        created_at
      `
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (usersError) {
      await audit('users_list_failed', 'users', userId, undefined, {
        companyId,
        error: usersError.message,
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar usuários' },
        { status: 500 }
      )
    }

    await audit('users_listed', 'users', userId, undefined, {
      companyId,
      count: users?.length || 0,
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    console.error('Error listing users:', error)
    await audit('users_list_error', 'users', 'system', undefined, {
      error: error.message,
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
