import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Buscar produto específico com informações da loja
    const { data: product, error } = await supabase
      .from('company_products')
      .select(`
        *,
        stores!inner(
          id,
          name,
          domain,
          description,
          logo_url,
          primary_color,
          secondary_color,
          companies(name)
        ),
        product_categories(
          id,
          name,
          icon,
          color
        )
      `)
      .eq('id', params.id)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar produto:', error)
      return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 })
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('Erro na API de produto da loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
