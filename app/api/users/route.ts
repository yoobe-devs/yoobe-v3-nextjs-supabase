import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseServiceKey } from '@/lib/supabase-admin'

// GET - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (role) {
      query = query.eq('role', role)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    return NextResponse.json({
      users: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, role, company_id, department, position, password } = body

    // Validações
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Nome, email e role são obrigatórios' }, { status: 400 })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    // Gerar senha aleatória se não fornecida
    const userPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    // Criar usuário no Supabase Auth
    const { data: authUser, error: createAuthError } = await supabaseServiceKey.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        company_id
      }
    })

    if (createAuthError) {
      console.error('Erro ao criar usuário no Auth:', createAuthError)
      return NextResponse.json({ error: 'Erro ao criar usuário no sistema de autenticação' }, { status: 500 })
    }

    // Criar usuário na tabela users
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        name,
        email,
        role,
        company_id,
        department,
        position,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar usuário na tabela:', error)
      // Tentar deletar o usuário do Auth se falhar na tabela
      await supabaseServiceKey.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    return NextResponse.json({ 
      user: data, 
      message: 'Usuário criado com sucesso',
      password: !password ? userPassword : undefined // Retornar senha gerada apenas se não foi fornecida
    })

  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
