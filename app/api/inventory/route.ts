import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Listar estoque
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
    const company_id = searchParams.get('company_id') || ''
    const low_stock = searchParams.get('low_stock') === 'true'

    let query = supabase
      .from('client_products')
      .select(`
        *,
        product_categories(name)
      `, { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (company_id) {
      query = query.eq('client_id', company_id)
    }
    if (low_stock) {
      query = query.lte('stock', 10) // Produtos com estoque baixo (≤ 10)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('stock', { ascending: true }) // Ordenar por estoque (menor primeiro)

    if (error) {
      console.error('Erro ao buscar estoque:', error)
      return NextResponse.json({ error: 'Erro ao buscar estoque' }, { status: 500 })
    }

    // Calcular estatísticas
    const totalProducts = data?.length || 0
    const lowStockProducts = data?.filter(p => (p as any).stock_quantity <= 10).length || 0
    const outOfStockProducts = data?.filter(p => (p as any).stock_quantity === 0).length || 0
    const totalValue = data?.reduce((sum, p) => sum + ((p as any).price * ((p as any).stock_quantity || 0)), 0) || 0

    return NextResponse.json({
      inventory: data,
      stats: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de estoque:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Atualizar estoque
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity, operation, reason } = body

    // Validações
    if (!product_id || quantity === undefined || !operation) {
      return NextResponse.json({ error: 'ID do produto, quantidade e operação são obrigatórios' }, { status: 400 })
    }

    if (quantity < 0) {
      return NextResponse.json({ error: 'Quantidade deve ser um valor positivo' }, { status: 400 })
    }

    // Buscar produto atual
    const { data: product, error: productError } = await supabase
      .from('client_products')
      .select('stock_quantity')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
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
          return NextResponse.json({ error: 'Estoque insuficiente para esta operação' }, { status: 400 })
        }
        break
      case 'set':
        newStock = quantity
        break
      default:
        return NextResponse.json({ error: 'Operação inválida. Use: add, subtract ou set' }, { status: 400 })
    }

    // Atualizar estoque
    const { data, error } = await supabase
      .from('client_products')
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', product_id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar estoque:', error)
      return NextResponse.json({ error: 'Erro ao atualizar estoque' }, { status: 500 })
    }

    // Registrar movimento no ledger (se existir)
    if (operation !== 'set') {
      try {
        await supabase
          .from('inventory_ledger')
          .insert({
            product_id,
            operation: operation === 'add' ? 'in' : 'out',
            quantity,
            reason: reason || `Ajuste manual - ${operation}`,
            user_id: user.id
          })
      } catch (ledgerError) {
        console.warn('Erro ao registrar no ledger:', ledgerError)
        // Não falhar se o ledger não existir
      }
    }

    return NextResponse.json({ 
      product: data, 
      message: `Estoque atualizado com sucesso. Novo estoque: ${newStock}` 
    })

  } catch (error) {
    console.error('Erro na API de estoque:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
