import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar funcionários da empresa do gestor
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar funcionários da loja usando service role
    const { data: employees, error: employeesError } = await supabaseService
      .from('users')
      .select('*')
      .eq('store_id', userData.store_id)
      .order('created_at', { ascending: false })

    if (employeesError) {
      console.error('Erro ao buscar funcionários:', employeesError)
      return NextResponse.json({ error: 'Erro ao buscar funcionários' }, { status: 500 })
    }

    return NextResponse.json(employees || [])
  } catch (error) {
    console.error('Erro na API de funcionários do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo funcionário
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      email,
      full_name,
      department,
      position,
      role
    } = body

    // Criar usuário no auth usando service role
    const { data: authUser, error: authCreateError } = await supabaseService.auth.admin.createUser({
      email,
      password: 'temp123456', // Senha temporária
      email_confirm: true,
      user_metadata: {
        full_name,
        department,
        position,
        role
      }
    })

    if (authCreateError) {
      console.error('Erro ao criar usuário no auth:', authCreateError)
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    // Criar registro na tabela users usando service role
    const { data: newEmployee, error: createError } = await supabaseService
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        name: full_name,
        role: role || 'user',
        company_id: userData.company_id,
        store_id: userData.store_id,
        department,
        position,
        points_balance: 0,
        status: 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar funcionário:', createError)
      return NextResponse.json({ error: 'Erro ao criar funcionário' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Funcionário criado com sucesso',
      employee: newEmployee
    })
  } catch (error) {
    console.error('Erro na API de funcionários do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
