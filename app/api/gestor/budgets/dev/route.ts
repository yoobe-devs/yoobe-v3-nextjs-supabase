import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateBudgetPayload, validateUUID } from '@/lib/validations/budget'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Criar novo orçamento (versão desenvolvimento)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar payload com Zod
    const validatedData = validateBudgetPayload(body)
    const { title, description, items } = validatedData

    // Validar que todos os product_ids são UUIDs válidos
    for (const item of items) {
      validateUUID(item.product_id, 'ID do produto')
    }

    // Calcular total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + item.quantity * item.unit_price
    }, 0)

    // IDs reais da empresa YOOBE
    const yoobeCompanyId = '550e8400-e29b-41d4-a716-446655440001'
    const yoobeManagerId = '264b2045-aacf-4283-a19b-1d3cf5ef96c8'

    // Criar orçamento
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .insert({
        company_id: yoobeCompanyId,
        manager_id: yoobeManagerId,
        title,
        description,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single()

    if (budgetError) {
      console.error('Erro ao criar orçamento:', budgetError)
      return NextResponse.json(
        { error: 'Erro ao criar orçamento: ' + budgetError.message },
        { status: 500 }
      )
    }

    // Criar itens do orçamento com UUIDs válidos (sem formatação)
    const budgetItems = items.map((item: any) => ({
      budget_id: budget.id,
      base_product_id: item.product_id, // Usar UUID diretamente
      quantity: item.quantity,
      custom_price: item.unit_price,
      custom_points_cost: 0,
      notes: item.notes || '',
    }))

    const { error: itemsError } = await supabaseService
      .from('budget_items')
      .insert(budgetItems)

    if (itemsError) {
      console.error('Erro ao criar itens do orçamento:', itemsError)
      // Rollback - deletar orçamento criado
      await supabaseService.from('budgets').delete().eq('id', budget.id)
      return NextResponse.json(
        { error: 'Erro ao criar itens do orçamento: ' + itemsError.message },
        { status: 500 }
      )
    }

    // Buscar orçamento completo
    const { data: completeBudget, error: fetchError } = await supabaseService
      .from('budgets')
      .select(
        `
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
            base_price
          )
        )
      `
      )
      .eq('id', budget.id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar orçamento criado:', fetchError)
    }

    return NextResponse.json({
      success: true,
      message: 'Orçamento criado com sucesso',
      data: completeBudget || budget,
    })
  } catch (error) {
    console.error('Erro na API de orçamentos (dev):', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar orçamentos (versão desenvolvimento)
export async function GET(request: NextRequest) {
  try {
    const yoobeCompanyId = '550e8400-e29b-41d4-a716-446655440001'
    const yoobeManagerId = '264b2045-aacf-4283-a19b-1d3cf5ef96c8'

    const { data: budgets, error: budgetsError } = await supabaseService
      .from('budgets')
      .select(
        `
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
            base_price,
            base_points_cost
          )
        ),
        companies (
          id,
          name
        ),
        stores (
          id,
          name,
          slug
        ),
        users (
          id,
          name,
          email
        )
      `
      )
      .eq('company_id', yoobeCompanyId)
      .eq('manager_id', yoobeManagerId)
      .order('created_at', { ascending: false })

    if (budgetsError) {
      console.error('Erro ao buscar orçamentos:', budgetsError)
      return NextResponse.json(
        { error: 'Erro ao buscar orçamentos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: budgets,
    })
  } catch (error) {
    console.error('Erro na API de orçamentos (dev):', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
