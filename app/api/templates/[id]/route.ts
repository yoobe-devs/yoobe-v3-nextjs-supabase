import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar template específico
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
      .from('email_templates')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar template:', error)
      return NextResponse.json({ error: 'Erro ao buscar template' }, { status: 500 })
    }

    return NextResponse.json({ template: data })

  } catch (error) {
    console.error('Erro na API de template:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar template
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
    const { name, type, subject, content, variables, status } = body

    // Validações
    if (!name?.trim() || !type || !subject?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Nome, tipo, assunto e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Verificar se template já existe (exceto o atual)
    const { data: existingTemplate } = await supabase
      .from('email_templates')
      .select('id')
      .eq('name', name.trim())
      .neq('id', params.id)
      .single()

    if (existingTemplate) {
      return NextResponse.json({ error: 'Template já existe' }, { status: 409 })
    }

    // Atualizar template
    const { data, error } = await supabase
      .from('email_templates')
      .update({
        name: name.trim(),
        type,
        subject: subject.trim(),
        content: content.trim(),
        variables: variables || [],
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar template:', error)
      return NextResponse.json({ error: 'Erro ao atualizar template' }, { status: 500 })
    }

    return NextResponse.json({ template: data, message: 'Template atualizado com sucesso' })

  } catch (error) {
    console.error('Erro na API de template:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir template
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

    // Excluir template
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir template:', error)
      return NextResponse.json({ error: 'Erro ao excluir template' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Template excluído com sucesso' })

  } catch (error) {
    console.error('Erro na API de template:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
