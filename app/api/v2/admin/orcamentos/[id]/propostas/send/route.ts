import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Q2CCalculator } from '@/lib/services/q2c-calculator'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Enviar proposta para o gestor
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id

    // Verificar se o orçamento existe e está em revisão
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status, title, version, manager_id')
      .eq('id', orcamentoId)
      .single()

    if (orcamentoError) {
      console.error('Erro ao buscar orçamento:', orcamentoError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (orcamento.status !== 'under_review') {
      return NextResponse.json(
        { error: 'Apenas orçamentos em revisão podem ter propostas enviadas' },
        { status: 400 }
      )
    }

    // ID do admin (hardcoded para desenvolvimento)
    const adminUserId = '550e8400-e29b-41d4-a716-446655440000'

    // Gerar snapshot da proposta
    const snapshot = await Q2CCalculator.generateSnapshot(
      orcamentoId,
      adminUserId
    )

    // Incrementar versão do orçamento
    const newVersion = orcamento.version + 1

    // Atualizar versão do orçamento
    const { error: updateVersionError } = await supabaseService
      .from('budgets')
      .update({
        version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orcamentoId)

    if (updateVersionError) {
      console.error('Erro ao atualizar versão:', updateVersionError)
      return NextResponse.json(
        { error: 'Erro ao atualizar versão do orçamento' },
        { status: 500 }
      )
    }

    // Criar proposta
    const { data: proposta, error: propostaError } = await supabaseService
      .from('propostas')
      .insert({
        orcamento_id: orcamentoId,
        version: newVersion,
        status: 'sent',
        snapshot: snapshot,
        created_by: adminUserId,
      })
      .select()
      .single()

    if (propostaError) {
      console.error('Erro ao criar proposta:', propostaError)
      return NextResponse.json(
        { error: 'Erro ao criar proposta' },
        { status: 500 }
      )
    }

    // Atualizar status do orçamento para proposal_sent
    const { error: updateStatusError } = await supabaseService
      .from('budgets')
      .update({
        status: 'proposal_sent',
        proposal_sent_at: new Date().toISOString(),
        proposal_sent_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orcamentoId)

    if (updateStatusError) {
      console.error('Erro ao atualizar status:', updateStatusError)
      return NextResponse.json(
        { error: 'Erro ao atualizar status do orçamento' },
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
          created_at
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
      message: 'Proposta enviada com sucesso',
      data: updatedOrcamento,
      proposta: proposta,
    })
  } catch (error) {
    console.error('Erro na API de envio de proposta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
