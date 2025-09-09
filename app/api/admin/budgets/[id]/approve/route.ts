import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// POST - Aprovar ou rejeitar orçamento (Admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const budgetId = params.id
    const body = await request.json()
    const { approved, notes } = body

    // Validar dados
    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo "approved" é obrigatório e deve ser boolean' },
        { status: 400 }
      )
    }

    // Verificar se o orçamento existe
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select(
        `
        id,
        company_id,
        status,
        client_name,
        total_amount,
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
      .eq('id', budgetId)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'admin') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budget.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Verificar se o orçamento pode ser aprovado/rejeitado
    if (budget.status !== 'pending') {
      return NextResponse.json(
        { error: 'Orçamento já foi processado' },
        { status: 400 }
      )
    }

    // Preparar dados de atualização
    const updateData = {
      status: approved ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_notes: notes || null,
      updated_at: new Date().toISOString(),
    }

    // Atualizar orçamento
    const { data: updatedBudget, error: updateError } = await supabaseService
      .from('budgets')
      .update(updateData)
      .eq('id', budgetId)
      .select(
        `
        id,
        company_id,
        status,
        client_name,
        total_amount,
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
      `
      )
      .single()

    if (updateError) {
      console.error('Erro ao atualizar orçamento:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar orçamento' },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabaseService.from('audit_logs').insert({
        action: approved ? 'budget_approved' : 'budget_rejected',
        user_id: user.id,
        company_id: budget.company_id,
        resource_type: 'budget',
        resource_id: budgetId,
        details: {
          client_name: budget.client_name,
          total_amount: budget.total_amount,
          items_count: budget.budget_items.length,
          admin_notes: notes,
        },
      })
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: updatedBudget,
      message: approved
        ? 'Orçamento aprovado com sucesso'
        : 'Orçamento rejeitado',
    })
  } catch (error) {
    console.error('Erro na API de aprovação de orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

