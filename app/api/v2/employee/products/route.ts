import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getVisibleProducts } from '@/lib/tag-gate'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')
    const category = searchParams.get('category')
    const search = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!storeId) {
      return NextResponse.json(
        { error: 'store_id é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar produtos visíveis baseado nas tags do usuário
    const products = await getVisibleProducts(user.id, storeId, {
      category: category || undefined,
      search: search || undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      products,
      total: products.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
