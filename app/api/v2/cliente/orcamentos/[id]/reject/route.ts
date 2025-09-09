import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Rejeitar orçamento
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

    const budgetId = params.id
    const body = await req.json()
    const { reason } = body

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
      .select('*')
      .eq('id', budgetId)
      .eq('audience', 'external_b2b')
      .eq('client_company_id', contact.client_company_id)
      .eq('status', 'sent_to_client')
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        {
          success: false,
          error: 'Orçamento não encontrado ou não pode ser rejeitado',
        },
        { status: 404 }
      )
    }

    // Atualizar status para rejeitado
    const { error: updateError } = await service
      .from('budgets')
      .update({
        status: 'client_rejected',
        updated_by: userId,
      })
      .eq('id', budgetId)

    if (updateError) {
      await audit('client_budget_reject_failed', 'budgets', userId, budgetId, {
        clientCompanyId: contact.client_company_id,
        error: updateError.message,
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao rejeitar orçamento' },
        { status: 500 }
      )
    }

    // Registrar evento de rejeição
    await service.from('client_quote_events').insert({
      budget_id: budgetId,
      actor: 'client',
      event: 'reject',
      meta: {
        contact_id: contact.id,
        reason: reason || 'Sem motivo especificado',
        rejected_at: new Date().toISOString(),
      },
    })

    // TODO: Enviar notificação para gestor/admin

    await audit('client_budget_rejected', 'budgets', userId, budgetId, {
      clientCompanyId: contact.client_company_id,
      contactId: contact.id,
      reason,
    })

    return NextResponse.json({
      success: true,
      message: 'Orçamento rejeitado',
      data: { budgetId, status: 'client_rejected' },
    })
  } catch (error: any) {
    console.error('Error rejecting client budget:', error)
    await audit('client_budget_reject_error', 'budgets', 'system', undefined, {
      error: error.message,
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
