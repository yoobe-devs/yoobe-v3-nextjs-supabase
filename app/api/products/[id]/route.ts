import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar produto específico
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
      .from('company_products')
      .select(`
        *,
        companies(name),
        categories(name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar produto:', error)
      return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 })
    }

    return NextResponse.json({ product: data })

  } catch (error) {
    console.error('Erro na API de produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar produto
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
    const { 
      name, 
      description, 
      price, 
      points_cost, 
      stock_quantity, 
      category_id, 
      company_id,
      image_url,
      status
    } = body

    // Validações
    if (!name || !description || !company_id) {
      return NextResponse.json({ error: 'Nome, descrição e empresa são obrigatórios' }, { status: 400 })
    }

    if (price < 0 || points_cost < 0 || stock_quantity < 0) {
      return NextResponse.json({ error: 'Preço, pontos e estoque devem ser valores positivos' }, { status: 400 })
    }

    // Atualizar produto
    const { data, error } = await supabase
      .from('company_products')
      .update({
        name,
        description,
        price: price || 0,
        points_cost: points_cost || 0,
        stock_quantity: stock_quantity || 0,
        category_id,
        company_id,
        image_url,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        companies(name),
        categories(name)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar produto:', error)
      return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
    }

    return NextResponse.json({ product: data, message: 'Produto atualizado com sucesso' })

  } catch (error) {
    console.error('Erro na API de produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir produto
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

    // Verificar se o produto existe
    const { data: existingProduct } = await supabase
      .from('company_products')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Excluir produto
    const { error } = await supabase
      .from('company_products')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir produto:', error)
      return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Produto excluído com sucesso' })

  } catch (error) {
    console.error('Erro na API de produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
