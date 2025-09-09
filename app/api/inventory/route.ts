import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize } from '@/lib/user-utils'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Listar estoque
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const low_stock = searchParams.get('low_stock') === 'true'
    const companyId = user.company_id

    let query = supabaseService
      .from('company_products')
      .select(
        `
        *,
        product_categories(name)
      `,
        { count: 'exact' }
      )
      .eq('company_id', companyId)

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (low_stock) {
      query = query.lte('stock_quantity', 10) // Produtos com estoque baixo (≤ 10)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('stock_quantity', { ascending: true }) // Ordenar por estoque (menor primeiro)

    if (error) {
      console.error('Erro ao buscar estoque:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar estoque',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    // Calcular estatísticas
    const totalProducts = data?.length || 0
    const lowStockProducts =
      data?.filter(p => (p as any).stock_quantity <= 10).length || 0
    const outOfStockProducts =
      data?.filter(p => (p as any).stock_quantity === 0).length || 0
    const totalValue =
      data?.reduce(
        (sum, p) => sum + (p as any).price * ((p as any).stock_quantity || 0),
        0
      ) || 0

    return NextResponse.json({
      success: true,
      data: {
        inventory: data,
        stats: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          totalValue,
        },
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        company_id: companyId,
      },
    })
  } catch (error) {
    console.error('Erro na API de estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Atualizar estoque
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
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

    const body = await request.json()
    const { product_id, quantity, operation, reason } = body
    const companyId = user.company_id

    // Validações
    if (!product_id || quantity === undefined || !operation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID do produto, quantidade e operação são obrigatórios',
          },
        },
        { status: 400 }
      )
    }

    if (quantity < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Quantidade deve ser um valor positivo',
          },
        },
        { status: 400 }
      )
    }

    // Buscar produto atual
    const { data: product, error: productError } = await supabaseService
      .from('company_products')
      .select('stock_quantity')
      .eq('id', product_id)
      .eq('company_id', companyId)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Produto não encontrado',
          },
        },
        { status: 404 }
      )
    }

    let newStock = (product as any).stock_quantity

    // Calcular novo estoque baseado na operação
    switch (operation) {
      case 'add':
        newStock += quantity
        break
      case 'subtract':
        newStock -= quantity
        if (newStock < 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Estoque insuficiente para esta operação',
              },
            },
            { status: 400 }
          )
        }
        break
      case 'set':
        newStock = quantity
        break
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Operação inválida. Use: add, subtract ou set',
            },
          },
          { status: 400 }
        )
    }

    // Atualizar estoque
    const { data, error } = await supabaseService
      .from('company_products')
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar estoque:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao atualizar estoque',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { product: data },
      message: `Estoque atualizado com sucesso. Novo estoque: ${newStock}`,
    })
  } catch (error) {
    console.error('Erro na API de estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
