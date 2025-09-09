import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Solicitar alterações no orçamento
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
    const { comment, requested_changes } = body

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comentário é obrigatório ao solicitar alterações',
        },
        { status: 400 }
      )
    }

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
          error: 'Orçamento não encontrado ou não pode ser alterado',
        },
        { status: 404 }
      )
    }

    // Atualizar status para alterações solicitadas
    const { error: updateError } = await service
      .from('budgets')
      .update({
        status: 'client_changes_requested',
        updated_by: userId,
      })
      .eq('id', budgetId)

    if (updateError) {
      await audit(
        'client_budget_changes_request_failed',
        'budgets',
        userId,
        budgetId,
        {
          clientCompanyId: contact.client_company_id,
          error: updateError.message,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Erro ao solicitar alterações' },
        { status: 500 }
      )
    }

    // Registrar evento de solicitação de alterações
    await service.from('client_quote_events').insert({
      budget_id: budgetId,
      actor: 'client',
      event: 'request_changes',
      meta: {
        contact_id: contact.id,
        comment,
        requested_changes: requested_changes || [],
        requested_at: new Date().toISOString(),
      },
    })

    // TODO: Enviar notificação para gestor/admin

    await audit(
      'client_budget_changes_requested',
      'budgets',
      userId,
      budgetId,
      {
        clientCompanyId: contact.client_company_id,
        contactId: contact.id,
        comment,
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Solicitação de alterações enviada',
      data: { budgetId, status: 'client_changes_requested' },
    })
  } catch (error: any) {
    console.error('Error requesting budget changes:', error)
    await audit(
      'client_budget_changes_request_error',
      'budgets',
      'system',
      undefined,
      {
        error: error.message,
      }
    )
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
