import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// DELETE - Excluir orçamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = params.id

    if (!budgetId) {
      return NextResponse.json(
        { error: 'ID do orçamento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o orçamento existe e se pode ser excluído
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, status, title')
      .eq('id', budgetId)
      .single()

    if (budgetError) {
      console.error('Erro ao buscar orçamento:', budgetError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Só permite excluir orçamentos em draft ou pending
    if (budget.status === 'approved' || budget.status === 'rejected') {
      return NextResponse.json(
        { error: 'Não é possível excluir orçamentos aprovados ou rejeitados' },
        { status: 400 }
      )
    }

    // Excluir itens do orçamento primeiro
    const { error: itemsError } = await supabaseService
      .from('budget_items')
      .delete()
      .eq('budget_id', budgetId)

    if (itemsError) {
      console.error('Erro ao excluir itens do orçamento:', itemsError)
      return NextResponse.json(
        { error: 'Erro ao excluir itens do orçamento' },
        { status: 500 }
      )
    }

    // Excluir o orçamento
    const { error: deleteError } = await supabaseService
      .from('budgets')
      .delete()
      .eq('id', budgetId)

    if (deleteError) {
      console.error('Erro ao excluir orçamento:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir orçamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Orçamento "${budget.title}" excluído com sucesso`,
    })
  } catch (error) {
    console.error('Erro na API de exclusão de orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar orçamento (edição completa)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = params.id
    const body = await request.json()
    const {
      status,
      title,
      description,
      total_amount,
      rejection_reason,
      items,
      ...otherUpdates
    } = body

    if (!budgetId) {
      return NextResponse.json(
        { error: 'ID do orçamento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o orçamento existe
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, status, title')
      .eq('id', budgetId)
      .single()

    if (budgetError) {
      console.error('Erro ao buscar orçamento:', budgetError)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização do orçamento
    const updateData: any = {
      updated_at: new Date().toISOString(),
      ...otherUpdates,
    }

    // Adicionar campos básicos se fornecidos
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (total_amount !== undefined) updateData.total_amount = total_amount
    if (rejection_reason !== undefined)
      updateData.rejection_reason = rejection_reason

    // Se mudando status para submitted, validar produtos
    if (status === 'submitted') {
      // Buscar itens do orçamento para validação
      const { data: items, error: itemsError } = await supabaseService
        .from('budget_items')
        .select(
          `
          id,
          base_product_id,
          quantity,
          custom_price,
          base_products (
            id,
            name,
            base_price
          )
        `
        )
        .eq('budget_id', budgetId)

      if (itemsError) {
        console.error('Erro ao buscar itens do orçamento:', itemsError)
        return NextResponse.json(
          { error: 'Erro ao validar itens do orçamento' },
          { status: 500 }
        )
      }

      // Validar se todos os produtos existem
      const invalidProducts = items.filter(item => !item.base_products)
      if (invalidProducts.length > 0) {
        return NextResponse.json(
          {
            error: `Produtos inválidos encontrados: ${invalidProducts.length} itens não possuem produtos base válidos`,
            invalidItems: invalidProducts.map(item => ({
              id: item.id,
              base_product_id: item.base_product_id,
            })),
          },
          { status: 400 }
        )
      }

      // Validar quantidades e preços
      const invalidItems = items.filter(
        item =>
          !item.quantity ||
          item.quantity <= 0 ||
          !item.custom_price ||
          item.custom_price <= 0
      )

      if (invalidItems.length > 0) {
        return NextResponse.json(
          {
            error: `Itens inválidos encontrados: ${invalidItems.length} itens com quantidade ou preço inválido`,
            invalidItems: invalidItems.map(item => ({
              id: item.id,
              product_name: item.base_products?.name,
              quantity: item.quantity,
              price: item.custom_price,
            })),
          },
          { status: 400 }
        )
      }

      updateData.status = 'pending'
      updateData.submitted_at = new Date().toISOString()
    } else if (status) {
      updateData.status = status
    }

    // Atualizar orçamento
    const { data: updatedBudget, error: updateError } = await supabaseService
      .from('budgets')
      .update(updateData)
      .eq('id', budgetId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar orçamento:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar orçamento: ' + updateError.message },
        { status: 500 }
      )
    }

    // Se items foram fornecidos, atualizar os itens do orçamento
    if (items && Array.isArray(items)) {
      // Remover itens existentes
      const { error: deleteItemsError } = await supabaseService
        .from('budget_items')
        .delete()
        .eq('budget_id', budgetId)

      if (deleteItemsError) {
        console.error('Erro ao remover itens antigos:', deleteItemsError)
        return NextResponse.json(
          { error: 'Erro ao atualizar itens do orçamento' },
          { status: 500 }
        )
      }

      // Inserir novos itens
      if (items.length > 0) {
        const budgetItems = items.map((item: any) => ({
          budget_id: budgetId,
          base_product_id: item.base_product_id,
          quantity: item.quantity,
          custom_price: item.custom_price,
          custom_points_cost: item.custom_points_cost || 0,
          notes: item.notes || '',
        }))

        const { error: insertItemsError } = await supabaseService
          .from('budget_items')
          .insert(budgetItems)

        if (insertItemsError) {
          console.error('Erro ao inserir novos itens:', insertItemsError)
          return NextResponse.json(
            { error: 'Erro ao salvar itens do orçamento' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Orçamento "${budget.title}" atualizado com sucesso`,
      data: updatedBudget,
    })
  } catch (error) {
    console.error('Erro na API de atualização de orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
