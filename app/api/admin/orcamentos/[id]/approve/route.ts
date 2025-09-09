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

// Função para verificar autenticação via header ou cookies
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Primeiro, tentar autenticação via cookies (padrão)
  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Se não funcionar, tentar via header Authorization
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        // Verificar token via service role
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

// POST - Aprovar ou rejeitar orçamento (Admin Global)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role do usuário
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        {
          error:
            'Acesso negado - Apenas administradores podem aprovar orçamentos',
        },
        { status: 403 }
      )
    }

    const budgetId = params.id
    const body = await request.json()
    const { action, admin_notes } = body

    // Validar ação
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida. Use "approve" ou "reject"' },
        { status: 400 }
      )
    }

    // Verificar se o orçamento existe
    const { data: existingBudget, error: fetchError } = await supabaseService
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single()

    if (fetchError || !existingBudget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o orçamento já foi revisado
    if (existingBudget.status !== 'pending') {
      return NextResponse.json(
        { error: 'Orçamento já foi revisado' },
        { status: 400 }
      )
    }

    // Atualizar status do orçamento
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const updateData = {
      status: newStatus,
      admin_notes: admin_notes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedBudget, error: updateError } = await supabaseService
      .from('budgets')
      .update(updateData)
      .eq('id', budgetId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar orçamento:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar orçamento' },
        { status: 500 }
      )
    }

    // Se aprovado, criar produtos da empresa e notificação
    if (action === 'approve') {
      try {
        // Buscar itens do orçamento
        const { data: budgetItems, error: itemsError } = await supabaseService
          .from('budget_items')
          .select('*')
          .eq('budget_id', budgetId)

        if (itemsError) {
          console.error('Erro ao buscar itens do orçamento:', itemsError)
        } else if (budgetItems && budgetItems.length > 0) {
          // Criar produtos do cliente (empresa) para cada item
          for (const item of budgetItems) {
            // Verificar se o produto já existe
            const { data: existingProduct } = await supabaseService
              .from('company_products')
              .select('id')
              .eq('company_id', existingBudget.company_id)
              .eq('base_product_id', item.base_product_id)
              .single()

            if (!existingProduct) {
              // Criar novo produto da empresa
              await supabaseService.from('company_products').insert({
                company_id: existingBudget.company_id,
                base_product_id: item.base_product_id,
                price: item.custom_price || 0,
                points_cost: item.custom_points_cost || 0,
                is_active: false,
                budget_id: budgetId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'active',
              })
            }
          }
        }

        // Criar notificação para o gestor
        await supabaseService.from('notifications').insert({
          user_id: existingBudget.manager_id,
          company_id: existingBudget.company_id,
          type: 'orcamento',
          title: 'Orçamento Aprovado',
          message: `Seu orçamento "${existingBudget.title}" foi aprovado! Os produtos estão disponíveis para ativação.`,
          data: {
            budget_id: budgetId,
            action: 'approved',
          },
        })
      } catch (error) {
        console.error('Erro ao processar aprovação:', error)
        // Não falhar a operação principal por causa de erro na notificação
      }
    } else {
      // Se rejeitado, criar notificação
      try {
        await supabaseService.from('notifications').insert({
          user_id: existingBudget.manager_id,
          company_id: existingBudget.company_id,
          type: 'orcamento',
          title: 'Orçamento Rejeitado',
          message: `Seu orçamento "${existingBudget.title}" foi rejeitado.${admin_notes ? ` Motivo: ${admin_notes}` : ''}`,
          data: {
            budget_id: budgetId,
            action: 'rejected',
            admin_notes,
          },
        })
      } catch (error) {
        console.error('Erro ao criar notificação de rejeição:', error)
      }
    }

    return NextResponse.json({
      message: `Orçamento ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`,
      budget: updatedBudget,
    })
  } catch (error) {
    console.error('Erro na API de aprovação de orçamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
