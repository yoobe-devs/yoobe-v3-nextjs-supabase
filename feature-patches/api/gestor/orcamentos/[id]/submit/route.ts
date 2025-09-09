import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Q2CCalculator } from '@/lib/services/q2c-calculator'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Enviar orçamento para o admin
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id

    // Verificar se o orçamento existe e está em draft
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status, title, manager_id')
      .eq('id', orcamentoId)
      .single()

    if (orcamentoError) {
      console.error('Erro ao buscar orçamento:', orcamentoError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (orcamento.status !== 'draft') {
      return NextResponse.json(
        { error: 'Apenas orçamentos em rascunho podem ser enviados' },
        { status: 400 }
      )
    }

    // Validar se o orçamento pode ser enviado
    const validation = await Q2CCalculator.validateForSubmission(orcamentoId)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Orçamento não pode ser enviado',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Recalcular totais antes de enviar
    await Q2CCalculator.recalculateTotals(orcamentoId)

    // Atualizar status para submitted_to_admin
    const { error: updateError } = await supabaseService
      .from('budgets')
      .update({
        status: 'submitted_to_admin',
        submitted_at: new Date().toISOString(),
        submitted_by: orcamento.manager_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orcamentoId)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
      return NextResponse.json(
        { error: 'Erro ao enviar orçamento' },
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
      message: 'Orçamento enviado para o admin com sucesso',
      data: updatedOrcamento,
    })
  } catch (error) {
    console.error('Erro na API de envio de orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
