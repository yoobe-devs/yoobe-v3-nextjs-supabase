import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Q2CCalculator } from '@/lib/services/q2c-calculator'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Adicionar/atualizar custos do orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id
    const body = await request.json()
    const { custos } = body

    // Validar dados
    if (!custos || !Array.isArray(custos)) {
      return NextResponse.json(
        { error: 'Lista de custos é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar se o orçamento existe e está em revisão
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

    if (!['under_review', 'proposal_sent'].includes(orcamento.status)) {
      return NextResponse.json(
        {
          error:
            'Apenas orçamentos em revisão ou com proposta enviada podem ter custos alterados',
        },
        { status: 400 }
      )
    }

    // Deletar custos existentes
    const { error: deleteError } = await supabaseService
      .from('orcamentos_custos')
      .delete()
      .eq('orcamento_id', orcamentoId)

    if (deleteError) {
      console.error('Erro ao deletar custos existentes:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao limpar custos existentes' },
        { status: 500 }
      )
    }

    // Inserir novos custos
    const custosToInsert = custos.map((custo: any) => ({
      orcamento_id: orcamentoId,
      cost_type_id: custo.cost_type_id || null,
      name: custo.name,
      kind: custo.kind || 'service',
      amount: custo.amount || 0,
    }))

    const { error: insertError } = await supabaseService
      .from('orcamentos_custos')
      .insert(custosToInsert)

    if (insertError) {
      console.error('Erro ao inserir custos:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar custos' },
        { status: 500 }
      )
    }

    // Recalcular totais
    const totals = await Q2CCalculator.recalculateTotals(orcamentoId)

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
      message: 'Custos atualizados com sucesso',
      data: updatedOrcamento,
      totals,
    })
  } catch (error) {
    console.error('Erro na API de custos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
