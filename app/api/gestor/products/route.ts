import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}
const DEV_TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

// GET - Buscar produtos da empresa do gestor
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Pegar dados de role e ids do token (user_metadata)
    const role = user.user_metadata?.role
    const companyIdRaw = user.user_metadata?.company_id
    const storeId = user.user_metadata?.store_id

    if (!['manager','gestor'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const company_id = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    // Filtros e paginação
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim()

    let query = supabaseService
      .from('client_products')
      .select(`
        *,
        base_products (
          id,
          name,
          base_price,
          base_points_cost
        )
      `, { count: 'exact' })
      .eq('client_id', company_id)

    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    if (status) query = query.eq('status', status)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: products, error: productsError, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }

    return NextResponse.json({
      data: products || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasPrev: page > 1,
        hasNext: from + (products?.length || 0) < (count || 0)
      }
    })
  } catch (error) {
    console.error('Erro na API de produtos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = user.user_metadata?.role
    const companyIdRaw = user.user_metadata?.company_id
    const storeId = user.user_metadata?.store_id
    if (!['manager','gestor'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const company_id = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    const body = await request.json()
    const {
      name,
      description,
      price,
      points_cost,
      stock_quantity,
      image_url,
      category_id,
      base_product_id
    } = body

    // Criar novo produto usando service role
    const { data: newProduct, error: createError } = await supabaseService
      .from('client_products')
      .insert({
        name,
        description,
        price,
        stock_quantity,
        image_url,
        base_product_id,
        client_id: company_id,
        store_id: storeId,
        status: 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar produto:', createError)
      return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Produto criado com sucesso',
      product: newProduct
    })
  } catch (error) {
    console.error('Erro na API de produtos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
