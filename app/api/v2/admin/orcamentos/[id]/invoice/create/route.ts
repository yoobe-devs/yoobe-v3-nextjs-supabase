import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Q2CCalculator } from '@/lib/services/q2c-calculator'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Criar fatura para o orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id
    const body = await request.json()
    const { payment_method, due_date, payment_payload } = body

    // Validar dados obrigatórios
    if (!payment_method || !due_date) {
      return NextResponse.json(
        { error: 'Método de pagamento e data de vencimento são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o orçamento existe e está em produção
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status, title, grand_total, company_id, store_id')
      .eq('id', orcamentoId)
      .single()

    if (orcamentoError) {
      console.error('Erro ao buscar orçamento:', orcamentoError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (orcamento.status !== 'production_in_progress') {
      return NextResponse.json(
        { error: 'Apenas orçamentos em produção podem ter faturas criadas' },
        { status: 400 }
      )
    }

    // Verificar se já existe fatura para este orçamento
    const { data: existingFatura, error: faturaCheckError } =
      await supabaseService
        .from('faturas')
        .select('id, number, status')
        .eq('orcamento_id', orcamentoId)
        .single()

    if (faturaCheckError && !faturaCheckError.message.includes('No rows')) {
      console.error('Erro ao verificar fatura existente:', faturaCheckError)
      return NextResponse.json(
        { error: 'Erro ao verificar fatura existente' },
        { status: 500 }
      )
    }

    if (existingFatura) {
      return NextResponse.json(
        { error: 'Já existe uma fatura para este orçamento' },
        { status: 400 }
      )
    }

    // Buscar proposta aprovada para usar o total correto
    const { data: proposta, error: propostaError } = await supabaseService
      .from('propostas')
      .select('id, snapshot')
      .eq('orcamento_id', orcamentoId)
      .eq('status', 'accepted')
      .single()

    if (propostaError) {
      console.error('Erro ao buscar proposta aprovada:', propostaError)
      return NextResponse.json(
        { error: 'Proposta aprovada não encontrada' },
        { status: 404 }
      )
    }

    // Usar total da proposta aprovada (snapshot)
    const totalAmount = proposta.snapshot.totals.grand_total

    // Gerar número da fatura
    const faturaNumber = await Q2CCalculator.generateFaturaNumber(
      orcamento.store_id || orcamento.company_id
    )

    // ID do admin (hardcoded para desenvolvimento)
    const adminUserId = '550e8400-e29b-41d4-a716-446655440000'

    // Criar fatura
    const { data: fatura, error: faturaError } = await supabaseService
      .from('faturas')
      .insert({
        orcamento_id: orcamentoId,
        proposta_id: proposta.id,
        store_id: orcamento.store_id || orcamento.company_id,
        number: faturaNumber,
        status: 'open',
        due_date: due_date,
        total_amount: totalAmount,
        currency: 'BRL',
        payment_method: payment_method,
        payment_payload: payment_payload || null,
      })
      .select()
      .single()

    if (faturaError) {
      console.error('Erro ao criar fatura:', faturaError)
      return NextResponse.json(
        { error: 'Erro ao criar fatura' },
        { status: 500 }
      )
    }

    // Atualizar status do orçamento para invoiced
    const { error: updateStatusError } = await supabaseService
      .from('budgets')
      .update({
        status: 'invoiced',
        invoiced_at: new Date().toISOString(),
        invoiced_by: adminUserId,
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
          created_at,
          accepted_at
        ),
        faturas (
          id,
          number,
          status,
          total_amount,
          due_date,
          payment_method,
          payment_payload,
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
      message: 'Fatura criada com sucesso',
      data: updatedOrcamento,
      fatura: fatura,
    })
  } catch (error) {
    console.error('Erro na API de criação de fatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
