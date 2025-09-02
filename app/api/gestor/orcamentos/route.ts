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

// Fallback UUID para dev quando o company_id não for UUID (ex.: 'test-company-id')
const DEV_TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

// Garante que as tabelas de orçamentos existam (usa service role)
async function ensureBudgetsSchema() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS budgets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      company_id UUID NOT NULL,
      manager_id UUID NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      total_amount NUMERIC(12,2) DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
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
    
    CREATE INDEX IF NOT EXISTS idx_budgets_company ON budgets(company_id);
    CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);
  `
  try {
    // Tenta executar via função RPC exec_sql se existir
    // Ignora erro se a função não existir; nesse caso presume que já foi criada via migração
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

// GET - Listar orçamentos do gestor
export async function GET(request: NextRequest) {
  try {
    await ensureBudgetsSchema()
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado - Apenas gestores podem acessar orçamentos' }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ error: 'Company ID não encontrado' }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Query base para orçamentos
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
        )
      `, { count: 'exact' })
      .eq('company_id', companyId)

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: budgets, error: budgetsError, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (budgetsError) {
      console.error('Erro ao buscar orçamentos:', budgetsError)
      return NextResponse.json({ error: 'Erro ao buscar orçamentos' }, { status: 500 })
    }

    return NextResponse.json({
      budgets: budgets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de orçamentos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo orçamento
export async function POST(request: NextRequest) {
  try {
    await ensureBudgetsSchema()
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado - Apenas gestores podem criar orçamentos' }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ error: 'Company ID não encontrado' }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : DEV_TEST_COMPANY_ID

    const body = await request.json()
    const { title, description, items } = body

    if (!title || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Título e itens são obrigatórios' }, { status: 400 })
    }

    // Calcular valor total
    let totalAmount = 0
    for (const item of items) {
      if (!isValidUuid(item.base_product_id)) {
        return NextResponse.json({ error: 'ID de produto base inválido' }, { status: 400 })
      }
      const { data: baseProduct } = await supabaseService
        .from('base_products')
        .select('base_price')
        .eq('id', item.base_product_id)
        .single()

      if (baseProduct) {
        const price = item.custom_price || baseProduct.base_price
        totalAmount += price * (item.quantity || 1)
      }
    }

    // Criar orçamento
    const budgetData = {
      company_id: companyId,
      manager_id: user.id,
      title,
      description,
      total_amount: totalAmount,
      status: 'pending'
    }

    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .insert(budgetData)
      .select()
      .single()

    if (budgetError) {
      console.error('Erro ao criar orçamento:', budgetError)
      return NextResponse.json({ error: 'Erro ao criar orçamento' }, { status: 500 })
    }

    // Criar itens do orçamento
    const budgetItems = items.map((item: any) => ({
      budget_id: budget.id,
      base_product_id: item.base_product_id,
      quantity: item.quantity || 1,
      custom_price: item.custom_price,
      custom_points_cost: item.custom_points_cost,
      notes: item.notes
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
      return NextResponse.json({ error: 'Erro ao criar itens do orçamento' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Orçamento criado com sucesso',
      budget: {
        ...budget,
        items: createdItems
      }
    })

  } catch (error) {
    console.error('Erro na API de criação de orçamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
