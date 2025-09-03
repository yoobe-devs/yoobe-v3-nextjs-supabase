import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Listar gestores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        status,
        company_id,
        created_at,
        updated_at,
        companies!inner(
          id,
          name,
          logo_url
        )
      `, { count: 'exact' })
      .eq('role', 'manager')
      .not('company_id', 'is', null)

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar gestores:', error)
      return NextResponse.json({ error: 'Erro ao buscar gestores' }, { status: 500 })
    }

    // Transformar dados para o formato esperado
    const gestores = (data || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: '',
      company_id: user.company_id,
      company_name: user.companies?.[0]?.name || 'Empresa não encontrada',
      company_logo: user.companies?.[0]?.logo_url || '',
      status: user.status,
      created_at: user.created_at,
      last_login: user.updated_at
    }))

    return NextResponse.json({
      gestores,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de gestores:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar gestor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company_id, password } = body

    if (!name || !email || !company_id || !password) {
      return NextResponse.json({
        error: 'Nome, email, company_id e senha são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({
        error: 'Este email já está em uso'
      }, { status: 400 })
    }

    // Verificar se a empresa existe
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', company_id)
      .single()

    if (!company) {
      return NextResponse.json({
        error: 'Empresa não encontrada'
      }, { status: 400 })
    }

    // Criar usuário no auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: 'manager',
        company_id
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário no auth:', authError)
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    // Criar gestor no banco
    const { data: gestor, error } = await supabase
      .from('users')
      .insert([{
        id: authUser.user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        company_id,
        role: 'manager',
        status: 'active'
      }])
      .select(`
        id,
        name,
        email,
        phone,
        company_id,
        status,
        created_at,
        companies!inner(
          id,
          name,
          logo_url
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao criar gestor:', error)
      // Tentar deletar o usuário do auth se falhar na tabela
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: 'Erro ao criar gestor' }, { status: 500 })
    }

    // Transformar resposta
    const gestorResponse = {
      id: gestor.id,
      name: gestor.name,
      email: gestor.email,
      phone: gestor.phone || '',
      company_id: gestor.company_id,
      company_name: gestor.companies?.[0]?.name || 'Empresa não encontrada',
      company_logo: gestor.companies?.[0]?.logo_url || '',
      status: gestor.status,
      created_at: gestor.created_at,
      last_login: gestor.created_at
    }

    return NextResponse.json({
      gestor: gestorResponse,
      message: 'Gestor criado com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de gestores:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
