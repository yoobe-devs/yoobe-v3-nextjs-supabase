import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    if (
      !me ||
      !['admin', 'admin_global', 'superadmin', 'manager'].includes(me.role)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Query base
    let query = supabase.from('stores').select(
      `
        id, 
        name, 
        domain,
        status,
        logo_url,
        created_at,
        companies!inner(id, name),
        _count:users.count(),
        _count:company_products.count(),
        _count:orders.count()
      `,
      { count: 'exact' }
    )

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar ordenação
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Aplicar paginação
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar lojas:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Processar dados para incluir estatísticas
    const stores = (data || []).map(store => ({
      id: store.id,
      name: store.name,
      domain: store.domain,
      status: store.status,
      logo_url: store.logo_url,
      created_at: store.created_at,
      company_name: store.companies?.name || 'N/A',
      users_count: store._count?.users || 0,
      products_count: store._count?.company_products || 0,
      orders_count: store._count?.orders || 0,
      revenue: 0, // TODO: Calcular receita real
    }))

    return NextResponse.json({
      stores,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (e) {
    console.error('admin stores list error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
