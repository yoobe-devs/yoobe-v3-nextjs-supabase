import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Aprovar proposta do orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id

    // Verificar se o orçamento existe e tem proposta pendente
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status, title, manager_id, version')
      .eq('id', orcamentoId)
      .single()

    if (orcamentoError) {
      console.error('Erro ao buscar orçamento:', orcamentoError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (orcamento.status !== 'proposal_sent') {
      return NextResponse.json(
        { error: 'Apenas orçamentos com proposta enviada podem ser aprovados' },
        { status: 400 }
      )
    }

    // Buscar última proposta
    const { data: proposta, error: propostaError } = await supabaseService
      .from('propostas')
      .select('id, version, status, snapshot')
      .eq('orcamento_id', orcamentoId)
      .eq('version', orcamento.version)
      .single()

    if (propostaError) {
      console.error('Erro ao buscar proposta:', propostaError)
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    if (proposta.status !== 'sent') {
      return NextResponse.json(
        { error: 'Proposta já foi processada' },
        { status: 400 }
      )
    }

    // Atualizar status do orçamento para gestor_approved
    const { error: updateOrcamentoError } = await supabaseService
      .from('budgets')
      .update({
        status: 'gestor_approved',
        approved_at: new Date().toISOString(),
        approved_by: orcamento.manager_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orcamentoId)

    if (updateOrcamentoError) {
      console.error('Erro ao atualizar orçamento:', updateOrcamentoError)
      return NextResponse.json(
        { error: 'Erro ao aprovar orçamento' },
        { status: 500 }
      )
    }

    // Atualizar status da proposta para accepted
    const { error: updatePropostaError } = await supabaseService
      .from('propostas')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: orcamento.manager_id,
      })
      .eq('id', proposta.id)

    if (updatePropostaError) {
      console.error('Erro ao atualizar proposta:', updatePropostaError)
      return NextResponse.json(
        { error: 'Erro ao aprovar proposta' },
        { status: 500 }
      )
    }

    // Buscar orçamento atualizado
    const { data: updatedOrcamento, error: fetchError } = await supabaseService
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
        orcamentos_custos (
          id,
          name,
          kind,
          amount
        ),
        propostas (
          id,
          version,
          status,
          snapshot,
          created_at,
          accepted_at
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
      .eq('id', orcamentoId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar orçamento atualizado:', fetchError)
    }

    return NextResponse.json({
      success: true,
      message: 'Proposta aprovada com sucesso',
      data: updatedOrcamento,
    })
  } catch (error) {
    console.error('Erro na API de aprovação de proposta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
