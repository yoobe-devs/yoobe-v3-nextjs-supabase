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

// POST - Rejeitar orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Para desenvolvimento, usar admin fixo
    const adminUserId = '550e8400-e29b-41d4-a716-446655440000' // Admin Global YOOBE

    const budgetId = params.id
    const body = await request.json()
    const { reason } = body

    // Buscar orçamento
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('*')
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
        { error: 'Apenas orçamentos pendentes podem ser rejeitados' },
        { status: 400 }
      )
    }

    // Atualizar status do orçamento para rejeitado
    const { error: updateError } = await supabaseService
      .from('budgets')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: adminUserId,
        rejection_reason: reason || 'Rejeitado pelo administrador',
      })
      .eq('id', budgetId)

    if (updateError) {
      console.error('Erro ao rejeitar orçamento:', updateError)
      return NextResponse.json(
        { error: 'Erro ao rejeitar orçamento' },
        { status: 500 }
      )
    }

    // Log da rejeição
    await supabaseService.from('audit_logs').insert({
      user_id: adminUserId,
      action: 'budget_rejected',
      resource_type: 'budget',
      resource_id: budgetId,
      details: {
        budget_title: budget.title,
        rejection_reason: reason || 'Rejeitado pelo administrador',
        total_amount: budget.total_amount,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Orçamento rejeitado com sucesso',
      data: {
        budget_id: budgetId,
        status: 'rejected',
      },
    })
  } catch (error) {
    console.error('Erro na API de rejeição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
