import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize, isValidUuid } from '@/lib/user-utils'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)
const DEV_TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

// GET - Listar produtos base disponíveis para o gestor
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id || DEV_TEST_COMPANY_ID

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Query base para produtos base
    let query = supabaseService
      .from('base_products')
      .select(
        `
        id,
        name,
        description,
        description_long,
        base_price,
        base_points_cost,
        images,
        specifications,
        features,
        available_colors,
        available_sizes,
        customization_options,
        lead_time_days,
        min_quantity,
        max_quantity,
        is_featured,
        tags,
        status,
        category_id,
        created_at,
        updated_at,
        product_categories (
          id,
          name,
          description,
          icon,
          color
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'active')

    // Aplicar filtros
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,description_long.ilike.%${search}%`
      )
    }
    if (category) {
      if (isValidUuid(category)) {
        query = query.eq('category_id', category)
      } else {
        try {
          const { data: cat } = await supabaseService
            .from('product_categories')
            .select('id')
            .ilike('name', category)
            .limit(1)
            .single()
          if (cat?.id) query = query.eq('category_id', cat.id)
        } catch {}
      }
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const {
      data: baseProducts,
      error: baseError,
      count,
    } = await query.range(from, to).order('created_at', { ascending: false })

    if (baseError) {
      console.error('Erro ao buscar produtos base:', baseError)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos base' },
        { status: 500 }
      )
    }

    // Verificar quais produtos já foram replicados para esta empresa
    const { data: existingProducts, error: existingError } =
      await supabaseService
        .from('company_products')
        .select('base_product_id')
        .eq('company_id', companyId)

    if (existingError) {
      console.error('Erro ao verificar produtos existentes:', existingError)
    }

    const existingBaseProductIds = new Set(
      existingProducts?.map(p => p.base_product_id) || []
    )

    // Adicionar flag de replicação
    const productsWithReplicationStatus =
      baseProducts?.map(product => ({
        ...product,
        is_replicated: existingBaseProductIds.has(product.id),
      })) || []

    return NextResponse.json({
      products: productsWithReplicationStatus,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de produtos base do gestor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Replicar produto base para a empresa do gestor
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e autorização (apenas managers)
    const authResult = await authenticateAndAuthorize(request, ['manager'])
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id || DEV_TEST_COMPANY_ID
    const storeId = user.store_id

    const body = await request.json()
    const {
      base_product_id,
      custom_price,
      custom_points_cost,
      custom_stock_quantity,
    } = body

    if (!base_product_id || !isValidUuid(base_product_id)) {
      return NextResponse.json(
        { error: 'ID do produto base é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar produto base
    const { data: baseProduct, error: baseError } = await supabaseService
      .from('base_products')
      .select(
        `
        *,
        product_categories (
          id,
          name,
          description,
          icon,
          color
        )
      `
      )
      .eq('id', base_product_id)
      .eq('status', 'active')
      .single()

    if (baseError || !baseProduct) {
      return NextResponse.json(
        { error: 'Produto base não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe um produto replicado
    const { data: existingProduct, error: existingError } =
      await supabaseService
        .from('company_products')
        .select('id')
        .eq('base_product_id', base_product_id)
        .eq('company_id', companyId)
        .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Produto já foi replicado para esta empresa' },
        { status: 400 }
      )
    }

    // Verificar se existe um orçamento (aprovado ou pendente) para esta empresa
    const { data: existingBudget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, title, status')
      .eq('company_id', companyId)
      .in('status', ['approved', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Se não há orçamento, criar um orçamento básico automaticamente
    let budgetId = null
    if (budgetError || !existingBudget) {
      console.log('📋 Criando orçamento básico para replicação de produtos...')

      const basicBudget = {
        company_id: companyId,
        manager_id: user.id,
        title: `Orçamento Automático - ${new Date().toLocaleDateString()}`,
        description:
          'Orçamento criado automaticamente para permitir replicação de produtos',
        total_amount: 0,
        status: 'pending',
      }

      const { data: newBudget, error: createBudgetError } =
        await supabaseService
          .from('budgets')
          .insert(basicBudget)
          .select('id')
          .single()

      if (createBudgetError) {
        console.error('Erro ao criar orçamento básico:', createBudgetError)
        return NextResponse.json(
          {
            error: 'Erro ao criar orçamento básico para replicação',
            details: createBudgetError.message,
          },
          { status: 500 }
        )
      }

      budgetId = newBudget.id
      console.log('✅ Orçamento básico criado:', budgetId)
    } else {
      budgetId = existingBudget.id
      console.log(
        '📋 Usando orçamento existente:',
        budgetId,
        'Status:',
        existingBudget.status
      )
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
      budget_id: budgetId,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      is_active: true,
      status: 'active',
    }

    const { data: newProduct, error: createError } = await supabaseService
      .from('company_products')
      .insert(replicatedProduct)
      .select(
        `
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
      `
      )
      .single()

    if (createError) {
      console.error('Erro ao replicar produto:', createError)
      return NextResponse.json(
        { error: 'Erro ao replicar produto' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Produto replicado com sucesso',
        company_product: newProduct,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro na API de replicação de produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
