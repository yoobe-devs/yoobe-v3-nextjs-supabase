import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Iniciar produção do orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id
    const body = await request.json()
    const { production_notes, external_order_number } = body

    // Verificar se o orçamento existe e está aprovado
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status, title, grand_total')
      .eq('id', orcamentoId)
      .single()

    if (orcamentoError) {
      console.error('Erro ao buscar orçamento:', orcamentoError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (orcamento.status !== 'gestor_approved') {
      return NextResponse.json(
        {
          error:
            'Apenas orçamentos aprovados pelo gestor podem ter produção iniciada',
        },
        { status: 400 }
      )
    }

    // ID do admin (hardcoded para desenvolvimento)
    const adminUserId = '550e8400-e29b-41d4-a716-446655440000'

    // Atualizar status para production_in_progress
    const { error: updateError } = await supabaseService
      .from('budgets')
      .update({
        status: 'production_in_progress',
        production_started_at: new Date().toISOString(),
        production_started_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orcamentoId)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
      return NextResponse.json(
        { error: 'Erro ao iniciar produção' },
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
      message: 'Produção iniciada com sucesso',
      data: updatedOrcamento,
    })
  } catch (error) {
    console.error('Erro na API de início de produção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
