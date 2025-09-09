import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Webhook para receber notificações de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      provider,
      provider_ref,
      fatura_id,
      amount,
      status,
      paid_at,
      raw_data,
    } = body

    // Validar dados obrigatórios
    if (!provider || !provider_ref || !fatura_id || !amount || !status) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se já existe pagamento com este provider_ref (idempotência)
    const { data: existingPayment, error: existingError } =
      await supabaseService
        .from('pagamentos')
        .select('id, status')
        .eq('provider_ref', provider_ref)
        .single()

    if (existingError && !existingError.message.includes('No rows')) {
      console.error('Erro ao verificar pagamento existente:', existingError)
      return NextResponse.json(
        { error: 'Erro ao verificar pagamento existente' },
        { status: 500 }
      )
    }

    if (existingPayment) {
      // Pagamento já processado, retornar sucesso
      return NextResponse.json({
        success: true,
        message: 'Pagamento já processado',
        payment_id: existingPayment.id,
      })
    }

    // Verificar se a fatura existe
    const { data: fatura, error: faturaError } = await supabaseService
      .from('faturas')
      .select('id, status, total_amount, orcamento_id')
      .eq('id', fatura_id)
      .single()

    if (faturaError) {
      console.error('Erro ao buscar fatura:', faturaError)
      return NextResponse.json(
        { error: 'Fatura não encontrada' },
        { status: 404 }
      )
    }

    if (fatura.status !== 'open') {
      return NextResponse.json(
        { error: 'Fatura não está aberta para pagamento' },
        { status: 400 }
      )
    }

    // Verificar se o valor do pagamento confere
    if (parseFloat(amount) !== parseFloat(fatura.total_amount)) {
      console.warn(
        `Valor do pagamento (${amount}) não confere com o valor da fatura (${fatura.total_amount})`
      )
    }

    // Criar registro de pagamento
    const { data: pagamento, error: pagamentoError } = await supabaseService
      .from('pagamentos')
      .insert({
        fatura_id: fatura_id,
        provider: provider,
        provider_ref: provider_ref,
        amount: parseFloat(amount),
        status: status,
        paid_at: paid_at ? new Date(paid_at).toISOString() : null,
        raw: raw_data || null,
      })
      .select()
      .single()

    if (pagamentoError) {
      console.error('Erro ao criar pagamento:', pagamentoError)
      return NextResponse.json(
        { error: 'Erro ao registrar pagamento' },
        { status: 500 }
      )
    }

    // Se o pagamento foi confirmado, atualizar status da fatura
    if (status === 'confirmed') {
      const { error: updateFaturaError } = await supabaseService
        .from('faturas')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', fatura_id)

      if (updateFaturaError) {
        console.error('Erro ao atualizar fatura:', updateFaturaError)
        return NextResponse.json(
          { error: 'Erro ao atualizar status da fatura' },
          { status: 500 }
        )
      }

      // Atualizar status do orçamento para paid
      const { error: updateOrcamentoError } = await supabaseService
        .from('budgets')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', fatura.orcamento_id)

      if (updateOrcamentoError) {
        console.error('Erro ao atualizar orçamento:', updateOrcamentoError)
        // Não falhar o webhook por isso, apenas logar
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processado com sucesso',
      payment_id: pagamento.id,
      fatura_status: status === 'confirmed' ? 'paid' : 'open',
    })
  } catch (error) {
    console.error('Erro no webhook de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
