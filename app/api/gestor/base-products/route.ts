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

// Função para verificar autenticação via header ou cookies
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Primeiro, tentar autenticação via cookies (padrão)
  let { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Se não funcionar, tentar via header Authorization
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        // Verificar token via service role
        const { data: { user: tokenUser }, error: tokenError } = await supabaseService.auth.getUser(token)
        
        if (!tokenError && tokenUser) {
          user = tokenUser
          authError = null
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }
  }
  
  return { user, error: authError }
}

// GET - Listar produtos base disponíveis para o gestor
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado - Apenas gestores podem acessar' }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ error: 'Company ID não encontrado' }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Query base para produtos base
    let query = supabaseService
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
      `, { count: 'exact' })
      .eq('status', 'active')

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (category) {
      query = query.eq('category_id', category)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: baseProducts, error: baseError, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (baseError) {
      console.error('Erro ao buscar produtos base:', baseError)
      return NextResponse.json({ error: 'Erro ao buscar produtos base' }, { status: 500 })
    }

    // Verificar quais produtos já foram replicados para esta empresa
    const { data: existingProducts, error: existingError } = await supabaseService
      .from('company_products')
      .select('base_product_id')
      .eq('company_id', companyId)

    if (existingError) {
      console.error('Erro ao verificar produtos existentes:', existingError)
    }

    const existingBaseProductIds = new Set(existingProducts?.map(p => p.base_product_id) || [])

    // Adicionar flag de replicação
    const productsWithReplicationStatus = baseProducts?.map(product => ({
      ...product,
      is_replicated: existingBaseProductIds.has(product.id)
    })) || []

    return NextResponse.json({
      products: productsWithReplicationStatus,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de produtos base do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Replicar produto base para a empresa do gestor
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado - Apenas gestores podem replicar produtos' }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    const storeId = user.user_metadata?.store_id

    if (!companyIdRaw) {
      return NextResponse.json({ error: 'Company ID não encontrado' }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    const body = await request.json()
    const { base_product_id, custom_price, custom_points_cost, custom_stock_quantity } = body

    if (!base_product_id || !isValidUuid(base_product_id)) {
      return NextResponse.json({ error: 'ID do produto base é obrigatório' }, { status: 400 })
    }

    // Buscar produto base
    const { data: baseProduct, error: baseError } = await supabaseService
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
      .eq('id', base_product_id)
      .eq('status', 'active')
      .single()

    if (baseError || !baseProduct) {
      return NextResponse.json({ error: 'Produto base não encontrado' }, { status: 404 })
    }

    // Verificar se já existe um produto replicado
    const { data: existingProduct, error: existingError } = await supabaseService
      .from('company_products')
      .select('id')
      .eq('base_product_id', base_product_id)
      .eq('company_id', companyId)
      .single()

    if (existingProduct) {
      return NextResponse.json({ error: 'Produto já foi replicado para esta empresa' }, { status: 400 })
    }

    // Verificar se existe um orçamento aprovado para esta empresa
    const { data: approvedBudget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, title')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .single()

    if (budgetError || !approvedBudget) {
      return NextResponse.json({ 
        error: 'É necessário ter um orçamento aprovado para replicar produtos. Envie um orçamento primeiro e aguarde a aprovação.' 
      }, { status: 403 })
    }

    // Criar produto replicado
    const replicatedProduct = {
      name: baseProduct.name,
      description: baseProduct.description,
      price: custom_price || baseProduct.base_price,
      points_cost: custom_points_cost || baseProduct.base_points_cost,
      stock_quantity: custom_stock_quantity || 0,
      image_url: baseProduct.image_url,
      category_id: baseProduct.category_id,
      base_product_id: baseProduct.id,
      company_id: companyId,
      store_id: storeId,
      budget_id: approvedBudget.id,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      is_active: true,
      status: 'active'
    }

    const { data: newProduct, error: createError } = await supabaseService
      .from('company_products')
      .insert(replicatedProduct)
      .select(`
        *,
        product_categories (
          id,
          name,
          icon,
          color
        ),
        base_products (
          id,
          name,
          base_price,
          base_points_cost
        )
      `)
      .single()

    if (createError) {
      console.error('Erro ao replicar produto:', createError)
      return NextResponse.json({ error: 'Erro ao replicar produto' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Produto replicado com sucesso',
      company_product: newProduct
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de replicação de produtos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
