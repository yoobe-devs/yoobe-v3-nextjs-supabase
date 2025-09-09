import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Visualizar orçamento específico
export async function GET(
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

    const budgetId = params.id

    // Verificar se o usuário é um contato de cliente
    const { data: contact } = await service
      .from('client_contacts')
      .select(
        `
        id,
        client_company_id,
        client_companies!inner(tenant_id)
      `
      )
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acesso negado - usuário não é contato de cliente',
        },
        { status: 403 }
      )
    }

    // Buscar orçamento
    const { data: budget, error: budgetError } = await service
      .from('budgets')
      .select(
        `
        *,
        client_companies!inner(name, billing_email, phone, address),
        client_contacts!inner(name, email, phone)
      `
      )
      .eq('id', budgetId)
      .eq('audience', 'external_b2b')
      .eq('client_company_id', contact.client_company_id)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Buscar proposta mais recente
    const { data: proposal, error: proposalError } = await service
      .from('proposals')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('visible_to_client', true)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Registrar visualização
    await service.from('client_quote_events').insert({
      budget_id: budgetId,
      actor: 'client',
      event: 'view',
      meta: {
        contact_id: contact.id,
        proposal_id: proposal.id,
      },
    })

    await audit('client_budget_viewed', 'budgets', userId, budgetId, {
      clientCompanyId: contact.client_company_id,
      contactId: contact.id,
      proposalId: proposal.id,
    })

    return NextResponse.json({
      success: true,
      data: {
        budget,
        proposal,
        canApprove: budget.status === 'sent_to_client',
        canReject: budget.status === 'sent_to_client',
        canRequestChanges: budget.status === 'sent_to_client',
        isValid: budget.valid_until
          ? new Date(budget.valid_until) > new Date()
          : true,
      },
    })
  } catch (error: any) {
    console.error('Error viewing client budget:', error)
    await audit('client_budget_view_error', 'budgets', 'system', undefined, {
      error: error.message,
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
