import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// PUT - Atualizar funcionário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
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
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const employeeId = params.id
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

    // Verificar se o funcionário existe e pertence à mesma loja
    const { data: existingEmployee, error: employeeError } =
      await supabaseService
        .from('users')
        .select('id, store_id')
        .eq('id', employeeId)
        .eq('store_id', userData.store_id)
        .single()

    if (employeeError || !existingEmployee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar funcionário usando service role
    const { data: updatedEmployee, error: updateError } = await supabaseService
      .from('users')
      .update({
        email,
        full_name,
        name: full_name,
        phone,
        department,
        position,
        role: role || 'user',
        cpf: cleanedCpf,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employeeId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar funcionário:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar funcionário' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Funcionário atualizado com sucesso',
      employee: updatedEmployee,
    })
  } catch (error) {
    console.error('Erro na API de atualização de funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover funcionário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
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
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const employeeId = params.id

    // Verificar se o funcionário existe e pertence à mesma loja
    const { data: existingEmployee, error: employeeError } =
      await supabaseService
        .from('users')
        .select('id, store_id')
        .eq('id', employeeId)
        .eq('store_id', userData.store_id)
        .single()

    if (employeeError || !existingEmployee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir deletar o próprio usuário
    if (employeeId === user.id) {
      return NextResponse.json(
        { error: 'Não é possível remover seu próprio usuário' },
        { status: 400 }
      )
    }

    // Remover funcionário usando service role
    const { error: deleteError } = await supabaseService
      .from('users')
      .delete()
      .eq('id', employeeId)

    if (deleteError) {
      console.error('Erro ao remover funcionário:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao remover funcionário' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Funcionário removido com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de remoção de funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
