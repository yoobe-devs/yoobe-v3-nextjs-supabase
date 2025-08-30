import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Cache simples em memória (em produção usar Redis)
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// GET - Listar produtos (otimizado)
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
    const category = searchParams.get('category') || ''
    const company_id = searchParams.get('company_id') || ''

    // Gerar chave de cache
    const cacheKey = `products:${page}:${limit}:${search}:${category}:${company_id}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Query otimizada com apenas os campos necessários
    let query = supabase
      .from('company_products')
      .select(`
        id,
        name,
        description,
        price,
        points_cost,
        stock_quantity,
        image_url,
        status,
        created_at,
        companies!inner(name),
        categories(name)
      `, { count: 'exact' })

    // Aplicar filtros de forma otimizada
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (category) {
      query = query.eq('category_id', category)
    }
    if (company_id) {
      query = query.eq('company_id', company_id)
    }

    // Paginação otimizada
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }

    const result = {
      products: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }

    // Armazenar no cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar produto (otimizado)
export async function POST(request: NextRequest) {
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

    // Validações otimizadas
    if (!name?.trim() || !description?.trim() || !company_id) {
      return NextResponse.json({ error: 'Nome, descrição e empresa são obrigatórios' }, { status: 400 })
    }

    if (price < 0 || points_cost < 0 || stock_quantity < 0) {
      return NextResponse.json({ error: 'Preço, pontos e estoque devem ser valores positivos' }, { status: 400 })
    }

    // Criar produto com query otimizada
    const { data, error } = await supabase
      .from('company_products')
      .insert({
        name: name.trim(),
        description: description.trim(),
        price: price || 0,
        points_cost: points_cost || 0,
        stock_quantity: stock_quantity || 0,
        category_id: category_id || null,
        company_id,
        image_url: image_url || null,
        status: status || 'active'
      })
      .select(`
        id,
        name,
        description,
        price,
        points_cost,
        stock_quantity,
        image_url,
        status,
        companies(name),
        categories(name)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar produto:', error)
      return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
    }

    // Limpar cache relacionado
    cache.clear()

    return NextResponse.json({ product: data, message: 'Produto criado com sucesso' })

  } catch (error) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
