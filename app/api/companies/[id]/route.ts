import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para contornar autenticação
const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
      }
      console.error('Erro ao buscar empresa:', error)
      return NextResponse.json({ error: 'Erro ao buscar empresa' }, { status: 500 })
    }

    return NextResponse.json({ company })

  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, phone, address, city, state, zip_code, status } = body

    // Validação
    if (!name || !email) {
      return NextResponse.json({ 
        error: 'Nome e email são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se email já existe em outra empresa
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', email)
      .neq('id', params.id)
      .single()

    if (existingCompany) {
      return NextResponse.json({ 
        error: 'Este email já está em uso' 
      }, { status: 400 })
    }

    // Atualizar empresa
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        status: status || 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar empresa:', error)
      return NextResponse.json({ error: 'Erro ao atualizar empresa' }, { status: 500 })
    }

    return NextResponse.json({
      company,
      message: 'Empresa atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a empresa existe
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingCompany) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Deletar empresa
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar empresa:', error)
      return NextResponse.json({ error: 'Erro ao deletar empresa' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Empresa deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
