import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize } from '@/lib/user-utils'

/**
 * @api {get} /api/gestor/produtos Listar produtos replicados
 * @apiName ListProducts
 * @apiGroup Gestor
 * @apiDescription Lista todos os produtos replicados para a loja do gestor
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'admin',
      'admin_global',
      'superadmin',
    ])
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: authResult.error },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id

    // Configurar Supabase service
    const supabaseService = createClient(
      'http://localhost:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'created_at'
    const dir = searchParams.get('dir') || 'desc'

    // Query base para produtos da empresa
    let query = supabaseService
      .from('company_products')
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
      `,
        { count: 'exact' }
      )
      .eq('company_id', companyId)

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar ordenação
    query = query.order(sort, { ascending: dir === 'asc' })

    // Aplicar paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: products, error: productsError, count } = await query

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar produtos',
            details: productsError.message,
          },
        },
        { status: 500 }
      )
    }

    // Calcular estatísticas
    const stats = {
      total: count || 0,
      byStatus: {} as Record<string, number>,
      active: 0,
      inactive: 0,
    }

    products?.forEach(product => {
      // Contar por status
      stats.byStatus[product.status] = (stats.byStatus[product.status] || 0) + 1

      // Contar ativos/inativos
      if (product.is_active) {
        stats.active++
      } else {
        stats.inactive++
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats,
      },
    })
  } catch (error) {
    console.error('Erro na API de produtos do gestor:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
      },
      { status: 500 }
    )
  }
}

/**
 * @api {post} /api/gestor/produtos Criar produto
 * @apiName CreateProduct
 * @apiGroup Gestor
 * @apiDescription Cria um novo produto para a empresa
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'admin',
      'admin_global',
      'superadmin',
    ])
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: authResult.error },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id

    const body = await request.json()
    const {
      name,
      description,
      price,
      points_cost,
      category_id,
      base_product_id,
      stock_quantity,
    } = body

    // Validações básicas
    if (!name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nome e preço são obrigatórios',
          },
        },
        { status: 400 }
      )
    }

    // Configurar Supabase service
    const supabaseService = createClient(
      'http://localhost:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    // Criar produto
    const productData = {
      name,
      description: description || null,
      price: parseFloat(price),
      points_cost: points_cost ? parseInt(points_cost) : 0,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
      company_id: companyId,
      category_id: category_id || null,
      base_product_id: base_product_id || null,
      status: 'active',
      is_active: true,
      status_fluxo: 'disponivel',
    }

    const { data: newProduct, error: createError } = await supabaseService
      .from('company_products')
      .insert(productData)
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
      console.error('Erro ao criar produto:', createError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Erro ao criar produto',
            details: createError.message,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        product: newProduct,
        message: 'Produto criado com sucesso',
      },
    })
  } catch (error) {
    console.error('Erro na API de criação de produtos:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
      },
      { status: 500 }
    )
  }
}
