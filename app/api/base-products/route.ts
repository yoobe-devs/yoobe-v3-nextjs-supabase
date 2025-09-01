import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: baseProducts, error } = await supabase
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
      .order('name')

    if (error) {
      console.error('Erro ao buscar produtos-base:', error)
      return NextResponse.json({ error: 'Erro ao buscar produtos-base' }, { status: 500 })
    }

    return NextResponse.json(baseProducts)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { name, description, category_id, base_price, base_points_cost, image_url, specifications } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('base_products')
      .insert({
        name,
        description,
        category_id,
        base_price: base_price || 0,
        base_points_cost: base_points_cost || 0,
        image_url,
        specifications: specifications || {},
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar produto-base:', error)
      return NextResponse.json({ error: 'Erro ao criar produto-base' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
