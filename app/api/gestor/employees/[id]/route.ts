import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// PUT - Atualizar funcionário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, email, department, position, status } = body

    // Verificar se o funcionário pertence à loja do gestor
    const { data: employee, error: employeeError } = await supabaseService
      .from('users')
      .select('id, store_id')
      .eq('id', params.id)
      .eq('store_id', userData.store_id)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
    }

    // Atualizar funcionário
    const { data: updatedEmployee, error: updateError } = await supabaseService
      .from('users')
      .update({
        full_name: name,
        name: name,
        email,
        department,
        position,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar funcionário:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar funcionário' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Funcionário atualizado com sucesso',
      employee: updatedEmployee
    })
  } catch (error) {
    console.error('Erro na API de funcionários do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir funcionário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se o funcionário pertence à loja do gestor
    const { data: employee, error: employeeError } = await supabaseService
      .from('users')
      .select('id, store_id, role')
      .eq('id', params.id)
      .eq('store_id', userData.store_id)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
    }

    // Não permitir excluir o próprio gestor
    if (employee.role === 'manager') {
      return NextResponse.json({ error: 'Não é possível excluir um gestor' }, { status: 400 })
    }

    // Excluir funcionário
    const { error: deleteError } = await supabaseService
      .from('users')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Erro ao excluir funcionário:', deleteError)
      return NextResponse.json({ error: 'Erro ao excluir funcionário' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Funcionário excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de funcionários do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
