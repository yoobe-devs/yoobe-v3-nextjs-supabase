import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// PATCH - Marcar orçamento como em revisão
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id

    // Verificar se o orçamento existe e está submitted_to_admin
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status, title')
      .eq('id', orcamentoId)
      .single()

    if (orcamentoError) {
      console.error('Erro ao buscar orçamento:', orcamentoError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (orcamento.status !== 'submitted_to_admin') {
      return NextResponse.json(
        {
          error:
            'Apenas orçamentos enviados ao admin podem ser marcados como em revisão',
        },
        { status: 400 }
      )
    }

    // ID do admin (hardcoded para desenvolvimento)
    const adminUserId = '550e8400-e29b-41d4-a716-446655440000'

    // Atualizar status para under_review
    const { error: updateError } = await supabaseService
      .from('budgets')
      .update({
        status: 'under_review',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orcamentoId)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
      return NextResponse.json(
        { error: 'Erro ao marcar orçamento como em revisão' },
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
      message: 'Orçamento marcado como em revisão',
      data: updatedOrcamento,
    })
  } catch (error) {
    console.error('Erro na API de revisão de orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
