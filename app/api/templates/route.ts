import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Listar templates
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
      .from('email_templates')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar templates:', error)
      return NextResponse.json({ error: 'Erro ao buscar templates' }, { status: 500 })
    }

    return NextResponse.json({
      templates: data,
      total: count || 0
    })

  } catch (error) {
    console.error('Erro na API de templates:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar template
export async function POST(request: NextRequest) {
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

    // Verificar se template já existe
    const { data: existingTemplate } = await supabase
      .from('email_templates')
      .select('id')
      .eq('name', name.trim())
      .single()

    if (existingTemplate) {
      return NextResponse.json({ error: 'Template já existe' }, { status: 409 })
    }

    // Criar template
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: name.trim(),
        type,
        subject: subject.trim(),
        content: content.trim(),
        variables: variables || [],
        status: status || 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar template:', error)
      return NextResponse.json({ error: 'Erro ao criar template' }, { status: 500 })
    }

    return NextResponse.json({ template: data, message: 'Template criado com sucesso' })

  } catch (error) {
    console.error('Erro na API de templates:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
