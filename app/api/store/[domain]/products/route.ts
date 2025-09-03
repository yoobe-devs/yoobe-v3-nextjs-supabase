import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar produtos da loja pública
export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Primeiro buscar a loja pelo domínio
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('domain', params.domain)
      .eq('status', 'active')
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Buscar produtos da loja
    const { data: products, error: productsError } = await supabase
      .from('company_products')
      .select(`
        *,
        product_categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('store_id', store.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error('Erro na API de produtos da loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
