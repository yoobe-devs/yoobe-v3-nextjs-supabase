import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: baseProduct, error } = await supabase
      .from('base_products')
      .select(`
        *,
        product_categories (
          id,
          name,
          description,
          icon,
          color
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Erro ao buscar produto-base:', error)
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(baseProduct)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { name, description, category_id, base_price, base_points_cost, image_url, specifications, status } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('base_products')
      .update({
        name,
        description,
        category_id,
        base_price: base_price || 0,
        base_points_cost: base_points_cost || 0,
        image_url,
        specifications: specifications || {},
        status: status || 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar produto-base:', error)
      return NextResponse.json({ error: 'Erro ao atualizar produto-base' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { error } = await supabase
      .from('base_products')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar produto-base:', error)
      return NextResponse.json({ error: 'Erro ao deletar produto-base' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Produto deletado com sucesso' })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
