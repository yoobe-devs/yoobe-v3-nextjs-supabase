import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Função para verificar autenticação
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        const {
          data: { user: tokenUser },
          error: tokenError,
        } = await supabaseService.auth.getUser(token)

        if (!tokenError && tokenUser) {
          user = tokenUser
          authError = null
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }
  }

  return { user, error: authError }
}

// POST - Aprovar orçamento e ativar produtos
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Para desenvolvimento, usar admin fixo
    const adminUserId = '550e8400-e29b-41d4-a716-446655440000' // Admin Global YOOBE

    const budgetId = params.id

    // Buscar orçamento com itens
    const { data: budget, error: budgetError } = await supabaseService
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
        )
      `
      )
      .eq('id', budgetId)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (budget.status !== 'pending') {
      return NextResponse.json(
        { error: 'Apenas orçamentos pendentes podem ser aprovados' },
        { status: 400 }
      )
    }

    // Atualizar status do orçamento para aprovado
    const { error: updateError } = await supabaseService
      .from('budgets')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminUserId,
      })
      .eq('id', budgetId)

    if (updateError) {
      console.error('Erro ao aprovar orçamento:', updateError)
      return NextResponse.json(
        { error: 'Erro ao aprovar orçamento' },
        { status: 500 }
      )
    }

    // Replicar produtos do orçamento para a loja
    const replicatedProducts = []

    for (const item of budget.budget_items) {
      if (item.base_products) {
        // Criar produto replicado na loja
        const { data: replicatedProduct, error: replicateError } =
          await supabaseService
            .from('store_products')
            .insert({
              store_id: budget.store_id || budget.company_id,
              base_product_id: item.base_product_id,
              name: item.base_products.name,
              price: item.custom_price || item.base_products.base_price,
              points_cost:
                item.custom_points_cost || item.base_products.base_points_cost,
              quantity_available: item.quantity,
              is_active: false, // Produtos ficam inativos para serem ativados pelo gestor
              source: 'budget_approved',
              budget_id: budgetId,
              created_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (replicateError) {
          console.error('Erro ao replicar produto:', replicateError)
          // Continuar com outros produtos mesmo se um falhar
        } else {
          replicatedProducts.push(replicatedProduct)
        }
      }
    }

    // Log da aprovação
    await supabaseService.from('audit_logs').insert({
      user_id: adminUserId,
      action: 'budget_approved',
      resource_type: 'budget',
      resource_id: budgetId,
      details: {
        budget_title: budget.title,
        products_replicated: replicatedProducts.length,
        total_amount: budget.total_amount,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Orçamento aprovado! ${replicatedProducts.length} produtos criados na loja (aguardando ativação pelo gestor)`,
      data: {
        budget_id: budgetId,
        products_replicated: replicatedProducts.length,
        replicated_products: replicatedProducts,
        note: 'Produtos foram criados com status inativo e precisam ser ativados pelo gestor da loja',
      },
    })
  } catch (error) {
    console.error('Erro na API de aprovação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
