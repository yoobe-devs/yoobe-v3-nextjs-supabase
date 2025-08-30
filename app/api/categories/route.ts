import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Listar categorias
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
    const company_id = searchParams.get('company_id') || ''

    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (company_id) {
      query = query.eq('company_id', company_id)
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    return NextResponse.json({
      categories: data,
      total: count || 0
    })

  } catch (error) {
    console.error('Erro na API de categorias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar categoria
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, company_id, color, icon } = body

    // Validações
    if (!name || !company_id) {
      return NextResponse.json({ error: 'Nome e empresa são obrigatórios' }, { status: 400 })
    }

    // Verificar se categoria já existe para esta empresa
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name)
      .eq('company_id', company_id)
      .single()

    if (existingCategory) {
      return NextResponse.json({ error: 'Categoria já existe para esta empresa' }, { status: 409 })
    }

    // Criar categoria
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        description,
        company_id,
        color,
        icon,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria:', error)
      return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
    }

    return NextResponse.json({ category: data, message: 'Categoria criada com sucesso' })

  } catch (error) {
    console.error('Erro na API de categorias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
