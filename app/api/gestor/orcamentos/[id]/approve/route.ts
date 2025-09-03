import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Estados do orçamento
const BUDGET_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
} as const

type BudgetStatus = typeof BUDGET_STATUSES[keyof typeof BUDGET_STATUSES]

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}

// Função para verificar autenticação via header ou cookies
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Primeiro, tentar autenticação via cookies (padrão)
  let { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Se não funcionar, tentar via header Authorization (conforme especificação v3)
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        const { data: { user: tokenUser }, error: tokenError } = await supabaseService.auth.getUser(token)
        
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

// Função para validar payload de aprovação
function validateApprovalPayload(body: any) {
  const errors: string[] = []
  
  if (!body.action || !['approve', 'reject'].includes(body.action)) {
    errors.push('Ação deve ser "approve" ou "reject"')
  }
  
  if (body.action === 'reject' && (!body.rejection_reason || typeof body.rejection_reason !== 'string')) {
    errors.push('Motivo da rejeição é obrigatório')
  }
  
  if (body.action === 'approve' && body.notes && typeof body.notes !== 'string') {
    errors.push('Notas devem ser uma string')
  }
  
  return errors
}

// Função para replicar produtos após aprovação
async function replicateProductsAfterApproval(budgetId: string, companyId: string) {
  try {
    // Buscar itens do orçamento aprovado
    const { data: budgetItems, error: itemsError } = await supabaseService
      .from('budget_items')
      .select(`
        *,
        base_products (
          id,
          name,
          description,
          base_price,
          base_points_cost,
          product_categories (
            id,
            name,
            icon,
            color
          )
        )
      `)
      .eq('budget_id', budgetId)

    if (itemsError || !budgetItems) {
      throw new Error('Erro ao buscar itens do orçamento')
    }

    // Criar produtos replicados para a loja do gestor
    const replicatedProducts = budgetItems.map((item: any) => ({
      tenant_id: companyId,
      company_id: companyId,
      base_product_id: item.base_product_id,
      name: item.base_products.name,
      description: item.base_products.description,
      price: item.custom_price || item.base_products.base_price,
      points_cost: item.custom_points_cost || item.base_products.base_points_cost,
      category_id: item.base_products.product_categories?.id,
      status: 'active',
      is_replicated: true,
      source_budget_id: budgetId,
      created_by: 'system',
      updated_by: 'system'
    }))

    const { data: createdProducts, error: createError } = await supabaseService
      .from('product_store')
      .insert(replicatedProducts)
      .select()

    if (createError) {
      throw new Error(`Erro ao criar produtos replicados: ${createError.message}`)
    }

    console.log(`✅ ${createdProducts.length} produtos replicados com sucesso`)
    return createdProducts

  } catch (error) {
    console.error('Erro na replicação de produtos:', error)
    throw error
  }
}

// POST - Aprovar ou rejeitar orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = params.id
    
    if (!isValidUuid(budgetId)) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'ID do orçamento inválido',
          details: 'O ID deve ser um UUID válido'
        }
      }, { status: 400 })
    }

    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
          details: 'Token inválido ou expirado'
        }
      }, { status: 401 })
    }

    // Verificar role do usuário (apenas gestor)
    const userRole = user.user_metadata?.role
    if (userRole !== 'manager') {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Acesso negado',
          details: 'Apenas gestores podem aprovar/rejeitar orçamentos'
        }
      }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Company ID não encontrado',
          details: 'Usuário deve estar associado a uma empresa'
        }
      }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : '00000000-0000-0000-0000-000000000001'

    const body = await request.json()
    
    // Validação do payload
    const validationErrors = validateApprovalPayload(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: validationErrors.join('; ')
        }
      }, { status: 422 })
    }

    const { action, rejection_reason, notes } = body

    // Verificar se o orçamento existe e pertence à empresa do gestor
    const { data: existingBudget, error: fetchError } = await supabaseService
      .from('budgets')
      .select('id, status, company_id, title, total_amount, total_points')
      .eq('id', budgetId)
      .eq('company_id', companyId)
      .single()

    if (fetchError || !existingBudget) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'NOT_FOUND',
          message: 'Orçamento não encontrado',
          details: 'O orçamento especificado não existe ou não pertence à sua empresa'
        }
      }, { status: 404 })
    }

    // Verificar se o status permite aprovação/rejeição
    if (existingBudget.status !== BUDGET_STATUSES.REVIEWED) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'CONFLICT',
          message: 'Status inválido para aprovação/rejeição',
          details: `Orçamento deve estar em status 'reviewed', atual: ${existingBudget.status}`
        }
      }, { status: 409 })
    }

    // Preparar dados de atualização
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (action === 'approve') {
      updateData.status = BUDGET_STATUSES.APPROVED
      updateData.approved_at = new Date().toISOString()
      if (notes) {
        updateData.manager_notes = notes
      }
    } else if (action === 'reject') {
      updateData.status = BUDGET_STATUSES.REJECTED
      updateData.rejected_at = new Date().toISOString()
      updateData.rejection_reason = rejection_reason
    }

    // Atualizar orçamento
    const { data: updatedBudget, error: updateError } = await supabaseService
      .from('budgets')
      .update(updateData)
      .eq('id', budgetId)
      .select(`
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
            description,
            base_price,
            base_points_cost,
            product_categories (
              id,
              name,
              icon,
              color
            )
          )
        ),
        budget_addresses (
          id,
          type,
          is_default,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zip_code,
          country
        ),
        budget_payment_methods (
          id,
          type,
          points_amount,
          cash_amount
        )
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar orçamento:', updateError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Erro ao atualizar orçamento',
          details: 'Falha na atualização no banco de dados'
        }
      }, { status: 500 })
    }

    // Se aprovado, replicar produtos
    let replicatedProducts = null
    if (action === 'approve') {
      try {
        replicatedProducts = await replicateProductsAfterApproval(budgetId, companyId)
      } catch (replicationError) {
        console.error('Erro na replicação de produtos:', replicationError)
        // Rollback: reverter status para reviewed
        await supabaseService
          .from('budgets')
          .update({
            status: BUDGET_STATUSES.REVIEWED,
            approved_at: null,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', budgetId)

        return NextResponse.json({ 
          success: false,
          error: { 
            code: 'REPLICATION_ERROR',
            message: 'Erro na replicação de produtos',
            details: 'Orçamento foi revertido para status reviewed devido a falha na replicação'
          }
        }, { status: 500 })
      }
    }

    // Registrar na auditoria
    try {
      await supabaseService
        .from('audit_log')
        .insert({
          event_type: `budget_${action}d`,
          actor_id: user.id,
          role: userRole,
          tenant_id: companyId,
          target: 'budgets',
          target_id: budgetId,
          payload: {
            action,
            previous_status: BUDGET_STATUSES.REVIEWED,
            new_status: action === 'approve' ? BUDGET_STATUSES.APPROVED : BUDGET_STATUSES.REJECTED,
            rejection_reason: action === 'reject' ? rejection_reason : null,
            notes: action === 'approve' ? notes : null,
            replicated_products_count: action === 'approve' ? (replicatedProducts?.length || 0) : 0
          },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          ua: request.headers.get('user-agent') || 'unknown'
        })
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria (não crítico):', auditError)
    }

    // Enviar webhook de mudança de estado
    try {
      await fetch(process.env.WEBHOOK_BUDGET_STATE_CHANGED || 'http://localhost:3001/api/webhooks/budgets/state-changed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'webhook-secret'}`
        },
        body: JSON.stringify({
          budget_id: budgetId,
          previous_status: BUDGET_STATUSES.REVIEWED,
          new_status: action === 'approve' ? BUDGET_STATUSES.APPROVED : BUDGET_STATUSES.REJECTED,
          company_id: companyId,
          manager_id: user.id,
          action,
          timestamp: new Date().toISOString(),
          replicated_products: action === 'approve' ? replicatedProducts : null
        })
      })
    } catch (webhookError) {
      console.warn('Erro ao enviar webhook (não crítico):', webhookError)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Orçamento ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`,
        budget: updatedBudget,
        action,
        replicated_products: action === 'approve' ? replicatedProducts : null
      },
      meta: {
        previous_status: BUDGET_STATUSES.REVIEWED,
        new_status: action === 'approve' ? BUDGET_STATUSES.APPROVED : BUDGET_STATUSES.REJECTED,
        action_performed_by: user.id,
        action_performed_at: new Date().toISOString()
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Erro na API de aprovação/rejeição de orçamentos:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        details: 'Falha inesperada no processamento da requisição'
      }
    }, { status: 500 })
  }
}
