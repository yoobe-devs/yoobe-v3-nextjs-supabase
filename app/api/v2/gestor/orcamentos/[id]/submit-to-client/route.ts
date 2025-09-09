import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { audit } from '@/lib/audit'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Enviar orçamento ao cliente
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, companyId } = await requireUser()

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    const canSubmit = await requireRole(userId, companyId, 'gestor')
    if (!canSubmit) {
      await audit('budget_submit_denied', 'budgets', userId, undefined, {
        companyId,
        reason: 'insufficient_permissions',
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Permissão insuficiente para enviar orçamentos',
        },
        { status: 403 }
      )
    }

    const budgetId = params.id

    // Buscar orçamento
    const { data: budget, error: budgetError } = await service
      .from('budgets')
      .select(
        `
        *,
        client_companies!inner(name, billing_email),
        client_contacts!inner(name, email)
      `
      )
      .eq('id', budgetId)
      .eq('company_id', companyId)
      .eq('audience', 'external_b2b')
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { success: false, error: 'Orçamento B2B não encontrado' },
        { status: 404 }
      )
    }

    if (budget.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: 'Apenas orçamentos em rascunho podem ser enviados',
        },
        { status: 400 }
      )
    }

    // Buscar itens do orçamento
    const { data: items, error: itemsError } = await service
      .from('budget_items')
      .select(
        `
        *,
        base_products(name, description, price, points_cost),
        store_products(name, description, price, points_cost)
      `
      )
      .eq('budget_id', budgetId)

    if (itemsError) {
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar itens do orçamento' },
        { status: 500 }
      )
    }

    // Criar snapshot da proposta
    const proposalSnapshot = {
      budget_id: budgetId,
      client_company: budget.client_companies,
      primary_contact: budget.client_contacts,
      items:
        items?.map(item => ({
          id: item.id,
          product_name: item.base_products?.name || item.store_products?.name,
          product_description:
            item.base_products?.description || item.store_products?.description,
          quantity: item.quantity,
          unit_price:
            item.custom_price ||
            item.base_products?.price ||
            item.store_products?.price,
          unit_points:
            item.custom_points_cost ||
            item.base_products?.points_cost ||
            item.store_products?.points_cost,
          total_price:
            (item.custom_price ||
              item.base_products?.price ||
              item.store_products?.price) * item.quantity,
          total_points:
            (item.custom_points_cost ||
              item.base_products?.points_cost ||
              item.store_products?.points_cost) * item.quantity,
          notes: item.notes,
        })) || [],
      totals: {
        total_items_amount: budget.total_amount,
        total_items_points: budget.total_points,
        total_costs_amount: 0, // embalagem, picking, frete
        total_taxes_amount: 0, // impostos
        total_discount_amount: 0, // descontos
        grand_total: budget.total_amount,
        currency: 'BRL',
      },
      metadata: {
        valid_until: budget.valid_until,
        notes_client: budget.notes_client,
        created_at: budget.created_at,
        version: 1,
      },
    }

    // Criar proposta
    const { data: proposal, error: proposalError } = await service
      .from('proposals')
      .insert({
        budget_id: budgetId,
        version: 1,
        visible_to_client: true,
        snapshot: proposalSnapshot,
        total_items_amount: budget.total_amount,
        total_costs_amount: 0,
        total_taxes_amount: 0,
        total_discount_amount: 0,
        grand_total: budget.total_amount,
        currency: 'BRL',
        created_by: userId,
      })
      .select()
      .single()

    if (proposalError) {
      await audit('budget_submit_failed', 'budgets', userId, budgetId, {
        companyId,
        error: 'proposal_creation_failed',
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar proposta' },
        { status: 500 }
      )
    }

    // Atualizar status do orçamento
    const { error: updateError } = await service
      .from('budgets')
      .update({
        status: 'sent_to_client',
        updated_by: userId,
      })
      .eq('id', budgetId)

    if (updateError) {
      // Rollback: deletar proposta criada
      await service.from('proposals').delete().eq('id', proposal.id)
      await audit('budget_submit_failed', 'budgets', userId, budgetId, {
        companyId,
        error: 'status_update_failed',
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar status do orçamento' },
        { status: 500 }
      )
    }

    // Registrar evento de auditoria
    await service.from('client_quote_events').insert({
      budget_id: budgetId,
      actor: 'gestor',
      event: 'view',
      meta: {
        action: 'submitted_to_client',
        proposal_id: proposal.id,
      },
    })

    // TODO: Enviar notificação por email
    // TODO: Criar magic link se necessário

    await audit('budget_submitted_to_client', 'budgets', userId, budgetId, {
      companyId,
      clientCompanyId: budget.client_company_id,
      contactId: budget.primary_contact_id,
      proposalId: proposal.id,
    })

    return NextResponse.json({
      success: true,
      data: {
        budget: { ...budget, status: 'sent_to_client' },
        proposal,
      },
    })
  } catch (error: any) {
    console.error('Error submitting budget to client:', error)
    await audit('budget_submit_error', 'budgets', 'system', undefined, {
      error: error.message,
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
