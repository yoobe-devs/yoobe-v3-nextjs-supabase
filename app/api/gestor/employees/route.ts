import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar funcionários da empresa do gestor
export async function GET(request: NextRequest) {
  try {
    // Verificar se há token Bearer no header
    const authHeader = request.headers.get('authorization')
    let user = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const {
        data: { user: tokenUser },
        error: tokenError,
      } = await supabaseService.auth.getUser(token)
      if (tokenError || !tokenUser) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
      user = tokenUser
    } else {
      // Fallback para cookies
      const supabase = createRouteHandlerClient({ cookies })
      const {
        data: { user: cookieUser },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !cookieUser) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }
      user = cookieUser
    }

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: 'Erro ao buscar funcionários' },
        { status: 500 }
      )
    }

    return NextResponse.json(employees || [])
  } catch (error) {
    console.error('Erro na API de funcionários do gestor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo funcionário
export async function POST(request: NextRequest) {
  try {
    // Verificar se há token Bearer no header
    const authHeader = request.headers.get('authorization')
    let user = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const {
        data: { user: tokenUser },
        error: tokenError,
      } = await supabaseService.auth.getUser(token)
      if (tokenError || !tokenUser) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
      user = tokenUser
    } else {
      // Fallback para cookies
      const supabase = createRouteHandlerClient({ cookies })
      const {
        data: { user: cookieUser },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !cookieUser) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }
      user = cookieUser
    }

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, phone, department, position, role, cpf } = body

    // Limpar e validar CPF se fornecido
    let cleanedCpf = null
    if (cpf && cpf.trim() !== '') {
      // Remover caracteres não numéricos
      cleanedCpf = cpf.replace(/\D/g, '')
      // Se tem 11 dígitos, usar; senão, usar null
      if (cleanedCpf.length !== 11) {
        cleanedCpf = null
      }
    }

    // Criar usuário no auth usando service role
    const { data: authUser, error: authCreateError } =
      await supabaseService.auth.admin.createUser({
        email,
        password: 'temp123456', // Senha temporária
        email_confirm: true,
        user_metadata: {
          full_name,
          department,
          position,
          role,
        },
      })

    if (authCreateError) {
      console.error('Erro ao criar usuário no auth:', authCreateError)
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar registro na tabela users usando service role
    const insertData: any = {
      id: authUser.user.id,
      email,
      full_name,
      role: role || 'user',
      company_id: userData.company_id,
      store_id: userData.store_id,
      points_balance: 0,
      status: 'active',
    }

    // Adicionar campos opcionais se existirem
    if (phone) insertData.phone = phone
    if (department) insertData.department = department
    if (position) insertData.position = position
    if (cleanedCpf) insertData.cpf = cleanedCpf
    
    // Adicionar campos de endereço se fornecidos
    if (body.address) insertData.address = body.address
    if (body.city) insertData.city = body.city
    if (body.state) insertData.state = body.state
    if (body.zip_code) insertData.zip_code = body.zip_code
    if (body.birth_date) insertData.birth_date = body.birth_date
    
    // Adicionar campos de configuração se fornecidos
    if (body.preferences) insertData.preferences = body.preferences
    if (body.timezone) insertData.timezone = body.timezone
    if (body.language) insertData.language = body.language
    
    // Adicionar campos de notificação se fornecidos
    if (body.email_notifications !== undefined) insertData.email_notifications = body.email_notifications
    if (body.push_notifications !== undefined) insertData.push_notifications = body.push_notifications
    if (body.sms_notifications !== undefined) insertData.sms_notifications = body.sms_notifications
    
    // Adicionar campos de perfil se fornecidos
    if (body.bio) insertData.bio = body.bio
    if (body.website) insertData.website = body.website
    if (body.linkedin_url) insertData.linkedin_url = body.linkedin_url
    if (body.twitter_handle) insertData.twitter_handle = body.twitter_handle
    
    // Adicionar campos de empresa se fornecidos
    if (body.employee_id) insertData.employee_id = body.employee_id
    if (body.hire_date) insertData.hire_date = body.hire_date
    if (body.salary) insertData.salary = body.salary
    if (body.manager_id) insertData.manager_id = body.manager_id
    
    // Adicionar campos de sistema se fornecidos
    if (body.is_active !== undefined) insertData.is_active = body.is_active
    if (body.is_verified !== undefined) insertData.is_verified = body.is_verified
    
    // Adicionar metadados se fornecidos
    if (body.metadata) insertData.metadata = body.metadata

    const { data: newEmployee, error: createError } = await supabaseService
      .from('users')
      .insert(insertData)
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar funcionário:', createError)
      console.error('Dados que causaram o erro:', insertData)

      // Rollback: deletar usuário do Auth se a criação no banco falhou
      try {
        await supabaseService.auth.admin.deleteUser(authUser.user.id)
      } catch (rollbackError) {
        console.error('Erro ao fazer rollback do usuário:', rollbackError)
      }

      return NextResponse.json(
        {
          error: 'Erro ao criar funcionário',
          details: createError.message,
          code: createError.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Funcionário criado com sucesso',
      employee: newEmployee,
    })
  } catch (error) {
    console.error('Erro na API de funcionários do gestor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
