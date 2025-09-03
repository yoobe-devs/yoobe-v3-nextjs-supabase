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

// Função para validar payload de revisão
function validateReviewPayload(body: any) {
  const errors: string[] = []
  
  if (!body.admin_final_price && !body.admin_final_points) {
    errors.push('Pelo menos um valor final (preço ou pontos) deve ser fornecido')
  }
  
  if (body.admin_final_price && (typeof body.admin_final_price !== 'number' || body.admin_final_price < 0)) {
    errors.push('Preço final deve ser um número não negativo')
  }
  
  if (body.admin_final_points && (!Number.isInteger(body.admin_final_points) || body.admin_final_points < 0)) {
    errors.push('Pontos finais devem ser um inteiro não negativo')
  }
  
  if (body.sla_days && (!Number.isInteger(body.sla_days) || body.sla_days < 1)) {
    errors.push('SLA deve ser um número inteiro positivo')
  }
  
  if (body.admin_review_notes && typeof body.admin_review_notes !== 'string') {
    errors.push('Notas de revisão devem ser uma string')
  }
  
  return errors
}

// POST - Revisar orçamento (Admin Global)
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

    // Verificar role do usuário (apenas admin_global)
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin_global') {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Acesso negado',
          details: 'Apenas administradores globais podem revisar orçamentos'
        }
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validação do payload
    const validationErrors = validateReviewPayload(body)
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

    const { 
      admin_final_price, 
      admin_final_points, 
      admin_review_notes, 
      sla_days 
    } = body

    // Verificar se o orçamento existe e está em status válido para revisão
    const { data: existingBudget, error: fetchError } = await supabaseService
      .from('budgets')
      .select('id, status, company_id, total_amount, total_points')
      .eq('id', budgetId)
      .single()

    if (fetchError || !existingBudget) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'NOT_FOUND',
          message: 'Orçamento não encontrado',
          details: 'O orçamento especificado não existe'
        }
      }, { status: 404 })
    }

    // Verificar se o status permite revisão
    if (![BUDGET_STATUSES.SUBMITTED, BUDGET_STATUSES.DRAFT].includes(existingBudget.status as BudgetStatus)) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'CONFLICT',
          message: 'Status inválido para revisão',
          details: `Orçamento deve estar em status 'submitted' ou 'draft', atual: ${existingBudget.status}`
        }
      }, { status: 409 })
    }

    // Preparar dados de atualização
    const updateData: any = {
      status: BUDGET_STATUSES.REVIEWED,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (admin_final_price !== undefined) {
      updateData.admin_final_price = admin_final_price
    }
    
    if (admin_final_points !== undefined) {
      updateData.admin_final_points = admin_final_points
    }
    
    if (admin_review_notes !== undefined) {
      updateData.admin_review_notes = admin_review_notes
    }
    
    if (sla_days !== undefined) {
      updateData.sla_days = sla_days
      // Recalcular data de expiração
      updateData.expires_at = new Date(Date.now() + sla_days * 24 * 60 * 60 * 1000).toISOString()
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

    // Registrar na auditoria (se implementado)
    try {
      await supabaseService
        .from('audit_log')
        .insert({
          event_type: 'budget_reviewed',
          actor_id: user.id,
          role: userRole,
          tenant_id: existingBudget.company_id,
          target: 'budgets',
          target_id: budgetId,
          payload: {
            action: 'review',
            previous_status: existingBudget.status,
            new_status: BUDGET_STATUSES.REVIEWED,
            admin_final_price,
            admin_final_points,
            admin_review_notes,
            sla_days
          },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          ua: request.headers.get('user-agent') || 'unknown'
        })
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria (não crítico):', auditError)
    }

    // Enviar webhook de mudança de estado (se implementado)
    try {
      await fetch(process.env.WEBHOOK_BUDGET_STATE_CHANGED || 'http://localhost:3001/api/webhooks/budgets/state-changed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'webhook-secret'}`
        },
        body: JSON.stringify({
          budget_id: budgetId,
          previous_status: existingBudget.status,
          new_status: BUDGET_STATUSES.REVIEWED,
          company_id: existingBudget.company_id,
          admin_id: user.id,
          timestamp: new Date().toISOString()
        })
      })
    } catch (webhookError) {
      console.warn('Erro ao enviar webhook (não crítico):', webhookError)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Orçamento revisado com sucesso',
        budget: updatedBudget
      },
      meta: {
        previous_status: existingBudget.status,
        new_status: BUDGET_STATUSES.REVIEWED,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Erro na API de revisão de orçamentos:', error)
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
