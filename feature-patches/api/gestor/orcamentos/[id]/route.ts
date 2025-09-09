import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar detalhes do orçamento
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id

    const { data: orcamento, error } = await supabaseService
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
          accepted_at,
          rejected_at,
          rejection_reason
        ),
        faturas (
          id,
          number,
          status,
          total_amount,
          due_date,
          payment_method,
          payment_payload,
          created_at,
          paid_at
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

    if (error) {
      console.error('Erro ao buscar orçamento:', error)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: orcamento,
    })
  } catch (error) {
    console.error('Erro na API de detalhes do orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar orçamento (apenas se for draft)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id
    const body = await request.json()

    // Verificar se o orçamento existe e está em draft
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status, version')
      .eq('id', orcamentoId)
      .single()

    if (orcamentoError) {
      console.error('Erro ao buscar orçamento:', orcamentoError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (!['draft', 'under_review'].includes(orcamento.status as any)) {
      return NextResponse.json(
        {
          error:
            'Apenas orçamentos em rascunho ou em revisão podem ser editados',
        },
        { status: 400 }
      )
    }

    // Atualizar campos básicos do orçamento
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.title) updateData.title = body.title
    if (body.description !== undefined)
      updateData.description = body.description

    // Se houver itens, atualizar
    if (body.items && Array.isArray(body.items)) {
      // Deletar itens existentes
      await supabaseService
        .from('budget_items')
        .delete()
        .eq('orcamento_id', orcamentoId)

      // Inserir novos itens
      const newItems = body.items.map((item: any) => ({
        orcamento_id: orcamentoId,
        base_product_id: item.base_product_id,
        quantity: item.quantity,
        custom_price: item.custom_price,
        custom_points_cost: item.custom_points_cost || 0,
        notes: item.notes || '',
      }))

      const { error: itemsError } = await supabaseService
        .from('budget_items')
        .insert(newItems)

      if (itemsError) {
        console.error('Erro ao atualizar itens:', itemsError)
        return NextResponse.json(
          { error: 'Erro ao atualizar itens do orçamento' },
          { status: 500 }
        )
      }

      // Recalcular totais
      const totalItemsAmount = body.items.reduce((sum: number, item: any) => {
        return sum + item.quantity * item.custom_price
      }, 0)

      updateData.total_items_amount = totalItemsAmount
      updateData.grand_total =
        totalItemsAmount +
        (orcamento.total_costs_amount || 0) +
        (orcamento.total_taxes_amount || 0) -
        (orcamento.total_discount_amount || 0)
    }

    // Atualizar orçamento
    const { error: updateError } = await supabaseService
      .from('budgets')
      .update(updateData)
      .eq('id', orcamentoId)

    if (updateError) {
      console.error('Erro ao atualizar orçamento:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar orçamento' },
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
      message: 'Orçamento atualizado com sucesso',
      data: updatedOrcamento,
    })
  } catch (error) {
    console.error('Erro na API de atualização do orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar orçamento (apenas se for draft)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orcamentoId = params.id

    // Verificar se o orçamento existe e está em draft
    const { data: orcamento, error: orcamentoError } = await supabaseService
      .from('budgets')
      .select('id, status')
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
        { error: 'Apenas orçamentos em rascunho podem ser deletados' },
        { status: 400 }
      )
    }

    // Deletar orçamento (cascade vai deletar itens e custos)
    const { error: deleteError } = await supabaseService
      .from('budgets')
      .delete()
      .eq('id', orcamentoId)

    if (deleteError) {
      console.error('Erro ao deletar orçamento:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar orçamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Orçamento deletado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de exclusão do orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
