import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize } from '@/lib/user-utils'

/**
 * @api {get} /api/gestor/usuarios Listar usuários
 * @apiName ListUsers
 * @apiGroup Gestor
 * @apiDescription Lista todos os usuários da empresa (gestores e funcionários)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'admin',
      'admin_global',
      'superadmin',
    ])
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: authResult.error,
          },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id

    // Configurar Supabase service
    const supabaseService = createClient(
      'http://localhost:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'created_at'
    const dir = searchParams.get('dir') || 'desc'

    // Query base para usuários
    let query = supabaseService
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        name,
        avatar_url,
        role,
        company_id,
        department,
        position,
        points_balance,
        status,
        created_at,
        updated_at,
        store_id,
        cpf,
        phone,
        address,
        city,
        state,
        zip_code,
        birth_date,
        last_login,
        metadata,
        created_by,
        updated_by,
        preferences,
        timezone,
        language,
        email_notifications,
        push_notifications,
        sms_notifications,
        two_factor_enabled,
        password_changed_at,
        failed_login_attempts,
        locked_until,
        bio,
        website,
        linkedin_url,
        twitter_handle,
        employee_id,
        hire_date,
        salary,
        manager_id,
        is_active,
        is_verified,
        verification_token,
        reset_token,
        reset_token_expires
      `,
        { count: 'exact' }
      )
      .eq('company_id', companyId)

    // Aplicar filtros
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%,name.ilike.%${search}%`
      )
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar ordenação
    query = query.order(sort, { ascending: dir === 'asc' })

    // Aplicar paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: users, error: usersError, count } = await query

    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar usuários',
            details: usersError.message,
          },
        },
        { status: 500 }
      )
    }

    // Calcular estatísticas
    const stats = {
      total: count || 0,
      byRole: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      active: 0,
      inactive: 0,
    }

    users?.forEach(user => {
      // Contar por role
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1

      // Contar por status
      stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1

      // Contar ativos/inativos
      if (user.is_active) {
        stats.active++
      } else {
        stats.inactive++
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats,
      },
    })
  } catch (error) {
    console.error('Erro na API de usuários do gestor:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * @api {post} /api/gestor/usuarios Criar usuário
 * @apiName CreateUser
 * @apiGroup Gestor
 * @apiDescription Cria um novo usuário na empresa
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'admin',
      'admin_global',
      'superadmin',
    ])
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: authResult.error,
          },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id

    const body = await request.json()
    const { email, full_name, role, department, position, phone, cpf } = body

    // Validações básicas
    if (!email || !full_name || !role) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, nome completo e role são obrigatórios',
          },
        },
        { status: 400 }
      )
    }

    // Configurar Supabase service
    const supabaseService = createClient(
      'http://localhost:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    // Criar usuário no Auth
    const { data: authUser, error: authError } =
      await supabaseService.auth.admin.createUser({
        email,
        password: 'temp123', // Senha temporária
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
          company_id: companyId,
        },
      })

    if (authError || !authUser.user) {
      console.error('Erro ao criar usuário no Auth:', authError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Erro ao criar usuário',
            details: authError?.message,
          },
        },
        { status: 500 }
      )
    }

    // Criar registro na tabela users
    const userData = {
      id: authUser.user.id,
      email,
      full_name,
      role,
      company_id: companyId,
      department: department || null,
      position: position || null,
      phone: phone || null,
      cpf: cpf || null,
      points_balance: 0,
      status: 'active',
      is_active: true,
      is_verified: false,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data: newUser, error: createError } = await supabaseService
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar usuário na tabela:', createError)

      // Rollback: deletar usuário do Auth
      try {
        await supabaseService.auth.admin.deleteUser(authUser.user.id)
      } catch (rollbackError) {
        console.error('Erro ao fazer rollback:', rollbackError)
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Erro ao criar usuário',
            details: createError.message,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: newUser,
        message: 'Usuário criado com sucesso',
      },
    })
  } catch (error) {
    console.error('Erro na API de criação de usuários:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      { status: 500 }
    )
  }
}
