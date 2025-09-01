import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Buscar gestor específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: gestor, error } = await supabase
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
        companies!users_company_id_fkey (
          id,
          name,
          logo_url
        )
      `)
      .eq('id', params.id)
      .eq('role', 'manager')
      .single()

    if (error) {
      console.error('Erro ao buscar gestor:', error)
      return NextResponse.json({ error: 'Gestor não encontrado' }, { status: 404 })
    }

    const gestorResponse = {
      id: gestor.id,
      name: gestor.name,
      email: gestor.email,
      role: gestor.role,
      status: gestor.status,
      company_id: gestor.company_id,
      company_name: (Array.isArray(gestor.companies) ? (gestor.companies[0]?.name) : (gestor as any).companies?.name) || 'Empresa não encontrada',
      company_logo: (Array.isArray(gestor.companies) ? (gestor.companies[0]?.logo_url) : (gestor as any).companies?.logo_url) || '',
      created_at: gestor.created_at,
      updated_at: gestor.updated_at
    }

    return NextResponse.json({ gestor: gestorResponse })

  } catch (error) {
    console.error('Erro na API de gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar gestor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, status, role, password } = body

    // Verificar se email já existe (se foi alterado)
    if (email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', params.id)
        .single()

      if (existingUser) {
        return NextResponse.json({
          error: 'Este email já está em uso'
        }, { status: 400 })
      }
    }

    // Atualizar dados básicos
    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (email) updateData.email = email.trim().toLowerCase()
    if (status) updateData.status = status
    if (role) updateData.role = role

    const { data: gestor, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .eq('role', 'manager')
      .select(`
        id,
        name,
        email,
        role,
        status,
        company_id,
        created_at,
        updated_at,
        companies!users_company_id_fkey (
          id,
          name,
          logo_url
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar gestor:', error)
      return NextResponse.json({ error: 'Erro ao atualizar gestor' }, { status: 500 })
    }

    // Se uma nova senha foi fornecida, atualizar no auth
    if (password) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        params.id,
        { password: password }
      )

      if (authError) {
        console.error('Erro ao atualizar senha:', authError)
        return NextResponse.json({ error: 'Erro ao atualizar senha' }, { status: 500 })
      }
    }

    const gestorResponse = {
      id: gestor.id,
      name: gestor.name,
      email: gestor.email,
      role: gestor.role,
      status: gestor.status,
      company_id: gestor.company_id,
      company_name: (Array.isArray(gestor.companies) ? (gestor.companies[0]?.name) : (gestor as any).companies?.name) || 'Empresa não encontrada',
      company_logo: (Array.isArray(gestor.companies) ? (gestor.companies[0]?.logo_url) : (gestor as any).companies?.logo_url) || '',
      created_at: gestor.created_at,
      updated_at: gestor.updated_at
    }

    return NextResponse.json({
      gestor: gestorResponse,
      message: 'Gestor atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar gestor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Deletar do auth primeiro
    const { error: authError } = await supabase.auth.admin.deleteUser(params.id)

    if (authError) {
      console.error('Erro ao deletar usuário do auth:', authError)
      return NextResponse.json({ error: 'Erro ao deletar gestor' }, { status: 500 })
    }

    // Deletar da tabela users
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id)
      .eq('role', 'manager')

    if (error) {
      console.error('Erro ao deletar gestor:', error)
      return NextResponse.json({ error: 'Erro ao deletar gestor' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Gestor deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
