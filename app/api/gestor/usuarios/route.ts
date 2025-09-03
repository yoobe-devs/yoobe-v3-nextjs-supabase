import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @api {get} /api/gestor/usuarios Listar usuários
 * @apiName ListUsers
 * @apiGroup Gestor
 * @apiDescription Lista todos os usuários da empresa (gestores e funcionários)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    // Verificar se é gestor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado. Apenas gestores podem acessar.' } },
        { status: 403 }
      )
    }

    // Parâmetros de busca e filtros
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construir query base
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        company_id,
        department,
        phone,
        address,
        created_at,
        last_login,
        metadata
      `)
      .eq('company_id', user.company_id)

    // Aplicar filtros
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`)
    }
    if (role) {
      query = query.eq('role', role)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Contar total de registros
    const { count, error: countError } = await query.count()
    if (countError) {
      console.error('Erro ao contar usuários:', countError)
    }

    // Buscar dados paginados
    const { data: users, error: usersError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar usuários' } },
        { status: 500 }
      )
    }

    // Buscar estatísticas dos usuários
    const statsPromises = users?.map(async (user) => {
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: redemptionsCount } = await supabase
        .from('redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { data: walletData } = await supabase
        .from('wallet_entries')
        .select('amount, type')
        .eq('user_id', user.id)

      const totalPoints = walletData?.reduce((sum, entry) => {
        return sum + (entry.type === 'credit' ? entry.amount : -entry.amount)
      }, 0) || 0

      return {
        ...user,
        stats: {
          totalOrders: ordersCount || 0,
          totalRedemptions: redemptionsCount || 0,
          totalPoints: Math.max(0, totalPoints)
        }
      }
    }) || []

    const usersWithStats = await Promise.all(statsPromises)

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        company_id: user.company_id
      }
    })

  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
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
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    // Verificar se é gestor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado. Apenas gestores podem acessar.' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      email, 
      full_name, 
      role, 
      department, 
      phone, 
      address, 
      password,
      metadata = {}
    } = body

    // Validação dos campos obrigatórios
    if (!email || !full_name || !role || !department) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios não preenchidos' } },
        { status: 400 }
      )
    }

    // Validar role
    if (!['manager', 'employee', 'viewer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Role inválido' } },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Email já cadastrado' } },
        { status: 409 }
      )
    }

    // Criar usuário no Supabase Auth
    const { data: authUser, error: authCreateError } = await supabase.auth.admin.createUser({
      email,
      password: password || 'temp123456',
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        company_id: user.company_id,
        department,
        phone,
        address,
        ...metadata
      }
    })

    if (authCreateError) {
      console.error('Erro ao criar usuário no Auth:', authCreateError)
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: 'Erro ao criar usuário no sistema de autenticação' } },
        { status: 500 }
      )
    }

    // Criar registro na tabela users
    const { data: dbUser, error: dbCreateError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        role,
        status: 'active',
        company_id: user.company_id,
        department,
        phone,
        address,
        metadata,
        created_by: session.user.id,
        updated_by: session.user.id
      })
      .select()
      .single()

    if (dbCreateError) {
      console.error('Erro ao criar usuário no banco:', dbCreateError)
      // Rollback: deletar usuário do Auth
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao criar usuário no banco de dados' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabase
      .from('audit_log')
      .insert({
        event_type: 'user_created',
        actor_id: session.user.id,
        role: user.role,
        tenant_id: user.company_id,
        target: 'users',
        payload: { 
          user_id: dbUser.id, 
          action: 'create',
          user_role: role,
          user_email: email
        }
      })

    // Enviar email de boas-vindas se configurado
    if (process.env.EMAIL_SERVICE_URL) {
      try {
        await fetch(process.env.EMAIL_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            template: 'welcome_user',
            data: {
              full_name,
              company_name: 'Join Tecnologia',
              login_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`
            }
          })
        })
      } catch (emailError) {
        console.warn('Erro ao enviar email de boas-vindas:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      data: dbUser,
      message: 'Usuário criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
