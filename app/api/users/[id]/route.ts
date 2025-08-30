import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar usuário específico
export async function GET(
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

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar usuário:', error)
      return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
    }

    return NextResponse.json({ user: data })

  } catch (error) {
    console.error('Erro na API de usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar usuário
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

    const body = await request.json()
    const { name, email, role, company_id, department, position, status } = body

    // Validações
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Nome, email e role são obrigatórios' }, { status: 400 })
    }

    // Verificar se email já existe (exceto para o usuário atual)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', params.id)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    // Atualizar usuário
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        role,
        company_id,
        department,
        position,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar usuário:', error)
      return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
    }

    return NextResponse.json({ user: data, message: 'Usuário atualizado com sucesso' })

  } catch (error) {
    console.error('Erro na API de usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir usuário
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

    // Verificar se não está tentando excluir a si mesmo
    if (user.id === params.id) {
      return NextResponse.json({ error: 'Não é possível excluir seu próprio usuário' }, { status: 400 })
    }

    // Excluir usuário
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir usuário:', error)
      return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })

  } catch (error) {
    console.error('Erro na API de usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
