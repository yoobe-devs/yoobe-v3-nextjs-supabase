import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar categoria específica
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
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
      }
      console.error('Erro ao buscar categoria:', error)
      return NextResponse.json({ error: 'Erro ao buscar categoria' }, { status: 500 })
    }

    return NextResponse.json({ category: data })

  } catch (error) {
    console.error('Erro na API de categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar categoria
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
    const { name, description, company_id, color, icon, status } = body

    // Validações
    if (!name || !company_id) {
      return NextResponse.json({ error: 'Nome e empresa são obrigatórios' }, { status: 400 })
    }

    // Verificar se categoria já existe para esta empresa (exceto para a categoria atual)
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name)
      .eq('company_id', company_id)
      .neq('id', params.id)
      .single()

    if (existingCategory) {
      return NextResponse.json({ error: 'Categoria já existe para esta empresa' }, { status: 409 })
    }

    // Atualizar categoria
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        description,
        company_id,
        color,
        icon,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar categoria:', error)
      return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
    }

    return NextResponse.json({ category: data, message: 'Categoria atualizada com sucesso' })

  } catch (error) {
    console.error('Erro na API de categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir categoria
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

    // Verificar se a categoria existe
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar se há produtos associados
    const { data: products } = await supabase
      .from('company_products')
      .select('id')
      .eq('category_id', params.id)
      .limit(1)

    if (products && products.length > 0) {
      return NextResponse.json({ 
        error: 'Não é possível excluir uma categoria que possui produtos cadastrados' 
      }, { status: 400 })
    }

    // Excluir categoria
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir categoria:', error)
      return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Categoria excluída com sucesso' })

  } catch (error) {
    console.error('Erro na API de categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
