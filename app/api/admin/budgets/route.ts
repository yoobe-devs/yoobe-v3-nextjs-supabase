import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Tipos
interface BudgetItem {
  product_id: string
  qty: number
  unit_price: number
  unit_points: number
  notes?: string
}

interface CreateBudgetPayload {
  customer_tenant_id: string
  items: BudgetItem[]
  shipping_policy?: string
  taxes_hint?: string
  notes?: string
  expires_at?: string
}

interface Budget {
  id: string
  status: string
  tenant_id: string
  customer_tenant_id: string
  created_by: string
  total_cash: number
  total_points: number
  shipping_policy?: string
  taxes_hint?: string
  notes?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

// Validação de payload
function validateCreateBudgetPayload(payload: any): payload is CreateBudgetPayload {
  if (!payload.customer_tenant_id || typeof payload.customer_tenant_id !== 'string') {
    throw new Error('ID do tenant do cliente é obrigatório')
  }
  
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('Lista de itens é obrigatória e não pode estar vazia')
  }
  
  for (const item of payload.items) {
    if (!item.product_id || typeof item.product_id !== 'string') {
      throw new Error('ID do produto é obrigatório para cada item')
    }
    
    if (typeof item.qty !== 'number' || item.qty < 1) {
      throw new Error('Quantidade deve ser um número maior que zero')
    }
    
    if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
      throw new Error('Preço unitário deve ser um número maior ou igual a zero')
    }
    
    if (typeof item.unit_points !== 'number' || item.unit_points < 0) {
      throw new Error('Pontos unitários devem ser um número maior ou igual a zero')
    }
  }
  
  return true
}

// Autenticação e autorização
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Verificar token de autorização
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorização é obrigatório')
  }

  const token = authHeader.substring(7)
  
  // Verificar sessão
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    throw new Error('Token inválido ou expirado')
  }

  // Verificar se o usuário tem role de admin_global
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    throw new Error('Usuário não encontrado')
  }

  if (userData.role !== 'admin_global') {
    throw new Error('Acesso negado. Apenas administradores globais podem criar orçamentos.')
  }

  return { user, userData }
}

// POST /api/admin/budgets
export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const { user, userData } = await authenticateUser(request)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Validar payload
    const payload = await request.json()
    validateCreateBudgetPayload(payload)

    // Verificar se todos os produtos existem e estão ativos
    const productIds = payload.items.map((item: any) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products_base')
      .select('id, title, active, price_cash, price_points')
      .in('id', productIds)

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'PRODUCTS_FETCH_ERROR', 
            message: 'Erro ao buscar produtos no banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'PRODUCTS_NOT_FOUND', 
            message: 'Um ou mais produtos não foram encontrados' 
          } 
        },
        { status: 404 }
      )
    }

    // Verificar se todos os produtos estão ativos
    const inactiveProducts = products.filter(p => !p.active)
    if (inactiveProducts.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INACTIVE_PRODUCTS', 
            message: `Produtos inativos encontrados: ${inactiveProducts.map(p => p.title).join(', ')}` 
          } 
        },
        { status: 400 }
      )
    }

    // Calcular totais
    const totalCash = payload.items.reduce((sum: number, item: any) => sum + (item.qty * item.unit_price), 0)
    const totalPoints = payload.items.reduce((sum: number, item: any) => sum + (item.qty * item.unit_points), 0)

    // Definir data de expiração (padrão: 30 dias)
    const expiresAt = payload.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Iniciar transação
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        status: 'draft',
        tenant_id: userData.company_id || 'admin',
        customer_tenant_id: payload.customer_tenant_id,
        created_by: user.id,
        updated_by: user.id,
        total_cash: totalCash,
        total_points: totalPoints,
        shipping_policy: payload.shipping_policy,
        taxes_hint: payload.taxes_hint,
        notes: payload.notes,
        expires_at: expiresAt,
        meta: {
          source: 'admin_products_base_page',
          items_count: payload.items.length,
          created_from: 'products_base_selection'
        }
      })
      .select()
      .single()

    if (budgetError) {
      console.error('Erro ao criar orçamento:', budgetError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'BUDGET_CREATION_ERROR', 
            message: 'Erro ao criar orçamento no banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    // Inserir itens do orçamento
    const budgetItems = payload.items.map((item: any) => ({
      budget_id: budget.id,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price,
      unit_points: item.unit_points,
      notes: item.notes || '',
      subtotal_cash: item.qty * item.unit_price,
      subtotal_points: item.qty * item.unit_points
    }))

    const { error: itemsError } = await supabase
      .from('budget_items')
      .insert(budgetItems)

    if (itemsError) {
      console.error('Erro ao inserir itens do orçamento:', itemsError)
      
      // Rollback: excluir orçamento criado
      await supabase
        .from('budgets')
        .delete()
        .eq('id', budget.id)
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'ITEMS_INSERTION_ERROR', 
            message: 'Erro ao inserir itens do orçamento' 
          } 
        },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabase
        .from('audit_log')
        .insert({
          event_type: 'budget_created',
          actor_id: user.id,
          role: userData.role,
          tenant_id: userData.company_id,
          target: 'budgets',
          target_id: budget.id,
          payload: {
            action: 'create',
            budget_data: {
              customer_tenant_id: payload.customer_tenant_id,
              total_cash: totalCash,
              total_points: totalPoints,
              items_count: payload.items.length
            },
            items: budgetItems
          },
          ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria:', auditError)
    }

    // Webhook para notificar criação do orçamento (simulado)
    try {
      console.log(`Webhook: Orçamento ${budget.id} foi criado por ${user.id} para tenant ${payload.customer_tenant_id}`)
    } catch (webhookError) {
      console.warn('Erro ao enviar webhook:', webhookError)
    }

    // Buscar orçamento completo com itens
    const { data: completeBudget, error: fetchError } = await supabase
      .from('budgets')
      .select(`
        *,
        budget_items (
          *,
          product:products_base (
            id,
            title,
            sku,
            category
          )
        )
      `)
      .eq('id', budget.id)
      .single()

    if (fetchError) {
      console.warn('Erro ao buscar orçamento completo:', fetchError)
    }

    return NextResponse.json({
      success: true,
      data: completeBudget || budget,
      message: 'Orçamento criado com sucesso',
      meta: {
        budget_id: budget.id,
        total_cash: totalCash,
        total_points: totalPoints,
        items_count: payload.items.length,
        expires_at: expiresAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de criação de orçamentos:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('ID do tenant do cliente')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: error.message 
            } 
          },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Lista de itens')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: error.message 
            } 
          },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Token de autorização')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: error.message 
            } 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Acesso negado')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: error.message 
            } 
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Erro interno do servidor' 
        } 
      },
      { status: 500 }
    )
  }
}

// GET /api/admin/budgets
export async function GET(request: NextRequest) {
  try {
    // Autenticação
    const { user, userData } = await authenticateUser(request)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const customer_tenant_id = searchParams.get('customer_tenant_id') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construir query base
    let supabaseQuery = supabase
      .from('budgets')
      .select(`
        *,
        budget_items (
          *,
          product:products_base (
            id,
            title,
            sku,
            category
          )
        )
      `, { count: 'exact' })

    // Aplicar filtros
    if (status) {
      supabaseQuery = supabaseQuery.eq('status', status)
    }
    
    if (customer_tenant_id) {
      supabaseQuery = supabaseQuery.eq('customer_tenant_id', customer_tenant_id)
    }

    // Aplicar paginação
    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Executar query
    const { data: budgets, error, count } = await supabaseQuery

    if (error) {
      console.error('Erro ao buscar orçamentos:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DATABASE_ERROR', 
            message: 'Erro ao buscar orçamentos no banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: budgets || [],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de busca de orçamentos:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Token de autorização')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: error.message 
            } 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Acesso negado')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: error.message 
            } 
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Erro interno do servidor' 
        } 
      },
      { status: 500 }
    )
  }
}
