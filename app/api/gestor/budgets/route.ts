import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// GET - Listar orçamentos do gestor
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // Obter company_id do usuário
    const { data: userData } = await supabaseService
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json(
        { error: 'Usuário não associado a empresa' },
        { status: 400 }
      )
    }

    // Construir query
    let query = supabaseService
      .from('budgets')
      .select(
        `
        id,
        title,
        description,
        client_name,
        client_email,
        client_phone,
        total_amount,
        status,
        created_at,
        updated_at,
        reviewed_at,
        reviewed_by,
        admin_notes,
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
            base_points_cost
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('company_id', userData.company_id)

    // Aplicar filtros
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,client_name.ilike.%${search}%,client_email.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar paginação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: budgets, error, count } = await query

    if (error) {
      console.error('Erro ao buscar orçamentos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar orçamentos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: budgets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de orçamentos do gestor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar orçamento (Gestor)
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      client_name,
      client_email,
      client_phone,
      items = [],
    } = body

    // Validar dados obrigatórios
    if (!title || !client_name || !client_email || !items.length) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios: title, client_name, client_email, items',
        },
        { status: 400 }
      )
    }

    // Obter company_id do usuário
    const { data: userData } = await supabaseService
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json(
        { error: 'Usuário não associado a empresa' },
        { status: 400 }
      )
    }

    // Calcular total do orçamento
    let totalAmount = 0
    for (const item of items) {
      const itemTotal =
        (item.custom_price || item.unit_price || 0) * (item.quantity || 0)
      totalAmount += itemTotal
    }

    // Criar orçamento
    const budgetData = {
      company_id: userData.company_id,
      manager_id: user.id,
      title,
      description,
      client_name,
      client_email,
      client_phone,
      total_amount: totalAmount,
      status: 'pending',
      created_by: user.id,
      updated_by: user.id,
    }

    const { data: newBudget, error: budgetError } = await supabaseService
      .from('budgets')
      .insert(budgetData)
      .select('id')
      .single()

    if (budgetError) {
      console.error('Erro ao criar orçamento:', budgetError)
      return NextResponse.json(
        { error: 'Erro ao criar orçamento' },
        { status: 500 }
      )
    }

    // Criar itens do orçamento
    const budgetItems = items.map((item: any) => ({
      budget_id: newBudget.id,
      base_product_id: item.base_product_id,
      quantity: item.quantity,
      custom_price: item.custom_price || item.unit_price,
      custom_points_cost: item.custom_points_cost,
      notes: item.notes || null,
    }))

    const { data: newItems, error: itemsError } = await supabaseService
      .from('budget_items')
      .insert(budgetItems).select(`
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
          base_points_cost
        )
      `)

    if (itemsError) {
      console.error('Erro ao criar itens do orçamento:', itemsError)
      // Rollback do orçamento
      await supabaseService.from('budgets').delete().eq('id', newBudget.id)
      return NextResponse.json(
        { error: 'Erro ao criar itens do orçamento' },
        { status: 500 }
      )
    }

    // Buscar orçamento completo
    const { data: completeBudget, error: fetchError } = await supabaseService
      .from('budgets')
      .select(
        `
        id,
        title,
        description,
        client_name,
        client_email,
        client_phone,
        total_amount,
        status,
        created_at,
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
            base_points_cost
          )
        )
      `
      )
      .eq('id', newBudget.id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar orçamento completo:', fetchError)
      return NextResponse.json(
        { error: 'Erro ao buscar orçamento' },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabaseService.from('audit_logs').insert({
        action: 'budget_created',
        user_id: user.id,
        company_id: userData.company_id,
        resource_type: 'budget',
        resource_id: newBudget.id,
        details: {
          title,
          client_name,
          client_email,
          total_amount,
          items_count: items.length,
        },
      })
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: completeBudget,
      message: 'Orçamento criado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de criação de orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
