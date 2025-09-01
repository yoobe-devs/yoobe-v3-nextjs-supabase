import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { name, description, icon, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('product_categories')
      .insert({
        name,
        description,
        icon,
        color,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria:', error)
      return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
