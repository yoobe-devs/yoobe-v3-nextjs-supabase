import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Estados do orçamento conforme especificação v3
const BUDGET_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
} as const

type BudgetStatus = typeof BUDGET_STATUSES[keyof typeof BUDGET_STATUSES]

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}

// Fallback UUID para dev quando o company_id não for UUID
const DEV_TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

// Garante que as tabelas de orçamentos existam com estrutura v3
async function ensureBudgetsSchema() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS budgets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      tenant_id UUID NOT NULL,
      company_id UUID NOT NULL,
      manager_id UUID NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      total_amount NUMERIC(12,2) DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      admin_review_notes TEXT,
      admin_final_price NUMERIC(12,2),
      admin_final_points INTEGER,
      sla_days INTEGER DEFAULT 7,
      expires_at TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      rejected_at TIMESTAMPTZ,
      created_by UUID NOT NULL,
      updated_by UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS budget_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
      base_product_id UUID REFERENCES base_products(id),
      quantity INTEGER DEFAULT 1,
      custom_price NUMERIC(12,2),
      custom_points_cost INTEGER,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS budget_addresses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('billing', 'shipping')),
      is_default BOOLEAN DEFAULT false,
      street TEXT NOT NULL,
      number TEXT,
      complement TEXT,
      neighborhood TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      country TEXT DEFAULT 'Brasil',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS budget_payment_methods (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('points_only', 'cash_only', 'mixed')),
      points_amount INTEGER DEFAULT 0,
      cash_amount NUMERIC(12,2) DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_budgets_tenant ON budgets(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_company ON budgets(company_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
    CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);
    CREATE INDEX IF NOT EXISTS idx_budget_addresses_budget ON budget_addresses(budget_id);
    CREATE INDEX IF NOT EXISTS idx_budget_payment_methods_budget ON budget_payment_methods(budget_id);
  `
  try {
    await supabaseService.rpc('exec_sql', { sql: createSql })
  } catch (e: any) {
    console.warn('ensureBudgetsSchema: não foi possível executar exec_sql (pode não existir).', e?.message)
  }
}

// Função para verificar autenticação via header ou cookies
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Primeiro, tentar autenticação via cookies (padrão)
  let { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Se não funcionar, tentar via header Authorization (conforme especificação v3)
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
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

// Função para validar payload de orçamento
function validateBudgetPayload(body: any) {
  const errors: string[] = []
  
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('Título é obrigatório e deve ser uma string válida')
  }
  
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push('Itens são obrigatórios e devem ser um array não vazio')
  }
  
  if (body.items) {
    body.items.forEach((item: any, index: number) => {
      if (!isValidUuid(item.base_product_id)) {
        errors.push(`Item ${index + 1}: ID de produto base inválido`)
      }
      if (item.quantity && (!Number.isInteger(item.quantity) || item.quantity <= 0)) {
        errors.push(`Item ${index + 1}: Quantidade deve ser um inteiro positivo`)
      }
      if (item.custom_price && (typeof item.custom_price !== 'number' || item.custom_price < 0)) {
        errors.push(`Item ${index + 1}: Preço customizado deve ser um número não negativo`)
      }
      if (item.custom_points_cost && (!Number.isInteger(item.custom_points_cost) || item.custom_points_cost < 0)) {
        errors.push(`Item ${index + 1}: Custo em pontos deve ser um inteiro não negativo`)
      }
    })
  }
  
  if (body.payment_methods && Array.isArray(body.payment_methods)) {
    body.payment_methods.forEach((method: any, index: number) => {
      if (!['points_only', 'cash_only', 'mixed'].includes(method.type)) {
        errors.push(`Método de pagamento ${index + 1}: Tipo inválido`)
      }
      if (method.points_amount && (!Number.isInteger(method.points_amount) || method.points_amount < 0)) {
        errors.push(`Método de pagamento ${index + 1}: Quantidade de pontos deve ser um inteiro não negativo`)
      }
      if (method.cash_amount && (typeof method.cash_amount !== 'number' || method.cash_amount < 0)) {
        errors.push(`Método de pagamento ${index + 1}: Valor em dinheiro deve ser um número não negativo`)
      }
    })
  }
  
  return errors
}

// GET - Listar orçamentos do gestor com filtros avançados
export async function GET(request: NextRequest) {
  try {
    await ensureBudgetsSchema()
    
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
          details: 'Token inválido ou expirado'
        }
      }, { status: 401 })
    }

    // Verificar role do usuário (conforme RBAC v3)
    const userRole = user.user_metadata?.role
    if (!['manager', 'admin_global'].includes(userRole)) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Acesso negado',
          details: 'Apenas gestores e admins globais podem acessar orçamentos'
        }
      }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Company ID não encontrado',
          details: 'Usuário deve estar associado a uma empresa'
        }
      }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    // Parâmetros de busca avançados
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''
    const sort = (searchParams.get('sort') || 'created_at') as string
    const dir = (searchParams.get('dir') || 'desc') as 'asc' | 'desc'

    // Query base para orçamentos com relacionamentos completos
    let query = supabaseService
      .from('budgets')
      .select(`
        *,
        budget_items (
          id,
          base_product_id,
          quantity,
          custom_price,
          custom_points_cost,
          notes,
          base_products (
            id,
            name,
            description,
            base_price,
            base_points_cost,
            product_categories (
              id,
              name,
              icon,
              color
            )
          )
        ),
        budget_addresses (
          id,
          type,
          is_default,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zip_code,
          country
        ),
        budget_payment_methods (
          id,
          type,
          points_amount,
          cash_amount
        )
      `, { count: 'exact' })
      .eq('company_id', companyId)

    // Aplicar filtros avançados
    if (status && Object.values(BUDGET_STATUSES).includes(status as BudgetStatus)) {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const validSort = ['created_at', 'total_amount', 'total_points']
    const sortField = validSort.includes(sort) ? sort : 'created_at'
    const ascending = dir === 'asc'

    const { data: budgets, error: budgetsError, count } = await query
      .order(sortField, { ascending })
      .range(from, to)

    if (budgetsError) {
      console.error('Erro ao buscar orçamentos:', budgetsError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar orçamentos',
          details: 'Falha na consulta ao banco de dados'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        budgets: budgets || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      meta: {
        statuses: Object.values(BUDGET_STATUSES),
        totalBudgets: count || 0
      }
    })

  } catch (error) {
    console.error('Erro na API de orçamentos do gestor:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        details: 'Falha inesperada no processamento da requisição'
      }
    }, { status: 500 })
  }
}

// POST - Criar novo orçamento com estrutura v3 completa
export async function POST(request: NextRequest) {
  try {
    await ensureBudgetsSchema()
    
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
          details: 'Token inválido ou expirado'
        }
      }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'manager') {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Acesso negado',
          details: 'Apenas gestores podem criar orçamentos'
        }
      }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Company ID não encontrado',
          details: 'Usuário deve estar associado a uma empresa'
        }
      }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    const body = await request.json()
    
    // Validação completa do payload
    const validationErrors = validateBudgetPayload(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: validationErrors.join('; ')
        }
      }, { status: 422 })
    }

    const { title, description, items, addresses, payment_methods, sla_days } = body

    // Calcular valores totais
    let totalAmount = 0
    let totalPoints = 0
    
    for (const item of items) {
      const { data: baseProduct } = await supabaseService
        .from('base_products')
        .select('base_price, base_points_cost')
        .eq('id', item.base_product_id)
        .single()

      if (baseProduct) {
        const price = item.custom_price || baseProduct.base_price
        const points = item.custom_points_cost || baseProduct.base_points_cost
        const quantity = item.quantity || 1
        
        totalAmount += price * quantity
        totalPoints += points * quantity
      }
    }

    // Criar orçamento com estrutura v3
    const budgetData = {
      tenant_id: companyId, // Multi-tenancy
      company_id: companyId,
      manager_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      total_amount: totalAmount,
      total_points: totalPoints,
      status: BUDGET_STATUSES.DRAFT,
      sla_days: sla_days || 7,
      expires_at: new Date(Date.now() + (sla_days || 7) * 24 * 60 * 60 * 1000).toISOString(),
      created_by: user.id,
      updated_by: user.id
    }

    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .insert(budgetData)
      .select()
      .single()

    if (budgetError) {
      console.error('Erro ao criar orçamento:', budgetError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Erro ao criar orçamento',
          details: 'Falha na inserção no banco de dados'
        }
      }, { status: 500 })
    }

    // Criar itens do orçamento
    const budgetItems = items.map((item: any) => ({
      budget_id: budget.id,
      base_product_id: item.base_product_id,
      quantity: item.quantity || 1,
      custom_price: item.custom_price || null,
      custom_points_cost: item.custom_points_cost || null,
      notes: item.notes?.trim() || null
    }))

    const { data: createdItems, error: itemsError } = await supabaseService
      .from('budget_items')
      .insert(budgetItems)
      .select(`
        *,
        base_products (
          id,
          name,
          description,
          base_price,
          base_points_cost,
          product_categories (
            id,
            name,
            icon,
            color
          )
        )
      `)

    if (itemsError) {
      console.error('Erro ao criar itens do orçamento:', itemsError)
      // Rollback: deletar orçamento criado
      await supabaseService.from('budgets').delete().eq('id', budget.id)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Erro ao criar itens do orçamento',
          details: 'Falha na inserção dos itens'
        }
      }, { status: 500 })
    }

    // Criar endereços se fornecidos
    if (addresses && Array.isArray(addresses)) {
      const budgetAddresses = addresses.map((addr: any) => ({
        budget_id: budget.id,
        type: addr.type || 'shipping',
        is_default: addr.is_default || false,
        street: addr.street,
        number: addr.number,
        complement: addr.complement,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zip_code: addr.zip_code,
        country: addr.country || 'Brasil'
      }))

      const { error: addressesError } = await supabaseService
        .from('budget_addresses')
        .insert(budgetAddresses)

      if (addressesError) {
        console.error('Erro ao criar endereços:', addressesError)
        // Rollback parcial: deletar itens e orçamento
        await supabaseService.from('budget_items').delete().eq('budget_id', budget.id)
        await supabaseService.from('budgets').delete().eq('id', budget.id)
        return NextResponse.json({ 
          success: false,
          error: { 
            code: 'INTERNAL_ERROR',
            message: 'Erro ao criar endereços',
            details: 'Falha na inserção dos endereços'
          }
        }, { status: 500 })
      }
    }

    // Criar métodos de pagamento se fornecidos
    if (payment_methods && Array.isArray(payment_methods)) {
      const budgetPaymentMethods = payment_methods.map((method: any) => ({
        budget_id: budget.id,
        type: method.type,
        points_amount: method.points_amount || 0,
        cash_amount: method.cash_amount || 0
      }))

      const { error: paymentError } = await supabaseService
        .from('budget_payment_methods')
        .insert(budgetPaymentMethods)

      if (paymentError) {
        console.error('Erro ao criar métodos de pagamento:', paymentError)
        // Rollback parcial: deletar endereços, itens e orçamento
        await supabaseService.from('budget_addresses').delete().eq('budget_id', budget.id)
        await supabaseService.from('budget_items').delete().eq('budget_id', budget.id)
        await supabaseService.from('budgets').delete().eq('id', budget.id)
        return NextResponse.json({ 
          success: false,
          error: { 
            code: 'INTERNAL_ERROR',
            message: 'Erro ao criar métodos de pagamento',
            details: 'Falha na inserção dos métodos de pagamento'
          }
        }, { status: 500 })
      }
    }

    // Buscar orçamento completo com todos os relacionamentos
    const { data: completeBudget, error: fetchError } = await supabaseService
      .from('budgets')
      .select(`
        *,
        budget_items (
          id,
          base_product_id,
          quantity,
          custom_price,
          custom_points_cost,
          notes,
          base_products (
            id,
            name,
            description,
            base_price,
            base_points_cost,
            product_categories (
              id,
              name,
              icon,
              color
            )
          )
        ),
        budget_addresses (
          id,
          type,
          is_default,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zip_code,
          country
        ),
        budget_payment_methods (
          id,
          type,
          points_amount,
          cash_amount
        )
      `)
      .eq('id', budget.id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar orçamento completo:', fetchError)
    }

    return NextResponse.json({ 
      success: true,
      data: {
        message: 'Orçamento criado com sucesso',
        budget: completeBudget || budget
      },
      meta: {
        status: BUDGET_STATUSES.DRAFT,
        totalAmount,
        totalPoints,
        itemsCount: items.length
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de criação de orçamentos:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        details: 'Falha inesperada no processamento da requisição'
      }
    }, { status: 500 })
  }
}
