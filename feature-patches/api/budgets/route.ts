import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Schema de validação para criação de orçamento
const CreateBudgetSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  tenant_id: z.string().uuid('ID da empresa inválido'),
  customer_tenant_id: z.string().uuid('ID do cliente inválido').optional(),
  contact_email: z.string().email('Email de contato inválido').optional(),
  due_at: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid('ID do produto inválido'),
        product_type: z
          .enum(['company_product', 'base_product'])
          .default('company_product'),
        qty: z.number().int().positive('Quantidade deve ser positiva'),
        unit_price: z
          .number()
          .nonnegative('Preço unitário deve ser não negativo')
          .default(0),
        unit_points: z
          .number()
          .int()
          .nonnegative('Pontos unitários devem ser não negativos')
          .default(0),
        notes: z.string().optional(),
      })
    )
    .min(1, 'Pelo menos um item é obrigatório'),
})

// POST - Criar novo orçamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados de entrada
    const validation = CreateBudgetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      tenant_id,
      customer_tenant_id,
      contact_email,
      due_at,
      notes,
      items,
    } = validation.data

    // Get user from request headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userCompanyId = request.headers.get('x-user-company-id')

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Informações de usuário não fornecidas' },
        { status: 400 }
      )
    }

    // Verificar se a empresa existe
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, status')
      .eq('id', tenant_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    if (company.status !== 'active') {
      return NextResponse.json(
        { error: 'Empresa não está ativa' },
        { status: 400 }
      )
    }

    // Verificar se o cliente existe (se fornecido)
    if (customer_tenant_id) {
      const { data: customerCompany, error: customerError } = await supabase
        .from('companies')
        .select('id, name, status')
        .eq('id', customer_tenant_id)
        .single()

      if (customerError || !customerCompany) {
        return NextResponse.json(
          { error: 'Empresa cliente não encontrada' },
          { status: 404 }
        )
      }

      if (customerCompany.status !== 'active') {
        return NextResponse.json(
          { error: 'Empresa cliente não está ativa' },
          { status: 400 }
        )
      }
    }

    // Verificar permissões baseadas no papel
    if (userRole === 'gestor' && userCompanyId !== tenant_id) {
      return NextResponse.json(
        { error: 'Você só pode criar orçamentos para sua própria empresa' },
        { status: 403 }
      )
    }

    // Criar orçamento
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        title,
        description,
        status: 'draft',
        tenant_id,
        customer_tenant_id,
        contact_email,
        due_at: due_at ? new Date(due_at).toISOString() : null,
        notes,
        total_cash: 0,
        total_points: 0,
        meta: {},
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single()

    if (budgetError) {
      console.error('Erro ao criar orçamento:', budgetError)
      return NextResponse.json(
        { error: 'Erro ao criar orçamento' },
        { status: 500 }
      )
    }

    // Criar itens do orçamento
    const budgetItems = items.map(item => ({
      budget_id: budget.id,
      product_id: item.product_id,
      product_type: item.product_type,
      qty: item.qty,
      unit_price: item.unit_price,
      unit_points: item.unit_points,
      notes: item.notes,
    }))

    const { data: createdItems, error: itemsError } = await supabase
      .from('budget_items')
      .insert(budgetItems)
      .select()

    if (itemsError) {
      console.error('Erro ao criar itens do orçamento:', itemsError)
      // Rollback: deletar o orçamento criado
      await supabase.from('budgets').delete().eq('id', budget.id)
      return NextResponse.json(
        { error: 'Erro ao criar itens do orçamento' },
        { status: 500 }
      )
    }

    // Buscar orçamento completo com itens
    const { data: completeBudget, error: fetchError } = await supabase
      .from('budgets')
      .select(
        `
        *,
        budget_items (
          id,
          product_id,
          product_type,
          qty,
          unit_price,
          unit_points,
          subtotal_cash,
          subtotal_points,
          notes
        )
      `
      )
      .eq('id', budget.id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar orçamento completo:', fetchError)
    }

    return NextResponse.json({
      budget: completeBudget || budget,
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

// GET - Listar orçamentos (para debug)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const offset = (page - 1) * limit

    let query = supabase.from('budgets').select(
      `
        *,
        budget_items (
          id,
          product_id,
          product_type,
          qty,
          unit_price,
          unit_points,
          subtotal_cash,
          subtotal_points
        )
      `,
      { count: 'exact' }
    )

    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar orçamentos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar orçamentos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de listagem de orçamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
