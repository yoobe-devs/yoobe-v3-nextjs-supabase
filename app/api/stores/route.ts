import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Listar lojas
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const company_id = searchParams.get('company_id') || ''

    let query = supabase
      .from('stores')
      .select(`
        id,
        name,
        company_id,
        status,
        created_at,
        companies!inner(
          id,
          name,
          logo_url
        )
      `, { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,companies.name.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (company_id) {
      query = query.eq('company_id', company_id)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar lojas:', error)
      return NextResponse.json({ error: 'Erro ao buscar lojas' }, { status: 500 })
    }

    // Calcular campos adicionais
    const stores = await Promise.all((data || []).map(async (store) => {
      // Contar usuários da empresa
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', store.company_id)

      // Contar produtos da empresa
      const { count: productsCount } = await supabase
        .from('company_products')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', store.company_id)

      // Contar pedidos da empresa
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', store.company_id)

      // Calcular receita total
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('company_id', store.company_id)
        .eq('status', 'delivered')

      const revenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      return {
        ...store,
        domain: `${store.name.toLowerCase().replace(/\s+/g, '-')}.yoobe.com`,
        logo_url: store.companies?.[0]?.logo_url || null,
        users_count: usersCount || 0,
        products_count: productsCount || 0,
        orders_count: ordersCount || 0,
        revenue
      }
    }))

    return NextResponse.json({
      stores,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar loja
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company_id, status } = body

    // Validações
    if (!name?.trim() || !company_id) {
      return NextResponse.json({ error: 'Nome e empresa são obrigatórios' }, { status: 400 })
    }

    // Verificar se a empresa existe
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', company_id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 400 })
    }

    // Verificar se já existe uma loja para esta empresa
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('company_id', company_id)
      .single()

    if (existingStore) {
      return NextResponse.json({ error: 'Já existe uma loja para esta empresa' }, { status: 409 })
    }

    // Criar loja
    const { data, error } = await supabase
      .from('stores')
      .insert({
        name: name.trim(),
        company_id,
        status: status || 'active'
      })
      .select(`
        id,
        name,
        company_id,
        status,
        created_at,
        companies!inner(
          id,
          name,
          logo_url
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao criar loja:', error)
      return NextResponse.json({ error: 'Erro ao criar loja' }, { status: 500 })
    }

    return NextResponse.json({ store: data, message: 'Loja criada com sucesso' })

  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
