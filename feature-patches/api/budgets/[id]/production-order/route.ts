import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// Schema para ordem de produção
const productionOrderSchema = z.object({
  po_number: z.string().optional(),
  est_start_at: z.string().datetime().optional(),
  est_finish_at: z.string().datetime().optional(),
  logistics: z.record(z.any()).optional(),
})

// GET - Buscar ordem de produção do orçamento
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o orçamento existe e o usuário tem acesso
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, company_id')
      .eq('id', params.id)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'gestor') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budget.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Buscar ordem de produção
    const { data: productionOrder, error } = await supabaseService
      .from('production_orders')
      .select(
        `
        id,
        po_number,
        status,
        est_start_at,
        est_finish_at,
        logistics,
        created_at,
        updated_at,
        companies!inner(id, name)
      `
      )
      .eq('budget_id', params.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Erro ao buscar ordem de produção:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        budget_id: params.id,
        production_order: productionOrder || null,
      },
    })
  } catch (error) {
    console.error('Erro na API de ordem de produção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar ordem de produção
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['admin', 'admin_global', 'superadmin'], // Apenas admins podem criar ordens
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productionOrderSchema.parse(body)

    // Verificar se o orçamento existe e está aprovado
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, company_id, status')
      .eq('id', params.id)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    if (budget.status !== 'approved') {
      return NextResponse.json(
        {
          error: 'Orçamento deve estar aprovado para criar ordem de produção',
        },
        { status: 400 }
      )
    }

    // Verificar se já existe ordem de produção
    const { data: existingOrder, error: existingError } = await supabaseService
      .from('production_orders')
      .select('id')
      .eq('budget_id', params.id)
      .single()

    if (existingOrder) {
      return NextResponse.json(
        { error: 'Ordem de produção já existe para este orçamento' },
        { status: 400 }
      )
    }

    // Criar ordem de produção
    const { data: productionOrder, error: createError } = await supabaseService
      .from('production_orders')
      .insert({
        budget_id: params.id,
        company_id: budget.company_id,
        po_number: validatedData.po_number,
        est_start_at: validatedData.est_start_at,
        est_finish_at: validatedData.est_finish_at,
        logistics: validatedData.logistics,
        status: 'planned',
      })
      .select(
        `
        id,
        po_number,
        status,
        est_start_at,
        est_finish_at,
        logistics,
        created_at,
        updated_at,
        companies!inner(id, name)
      `
      )
      .single()

    if (createError) {
      console.error('Erro ao criar ordem de produção:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar ordem de produção' },
        { status: 500 }
      )
    }

    // Criar evento de tracking automático
    await supabaseService.from('budget_tracking_events').insert({
      budget_id: params.id,
      status: 'production',
      title: 'Ordem de Produção Criada',
      description: `Ordem de produção ${
        productionOrder.po_number || productionOrder.id
      } foi criada`,
      actor_id: user.id,
      meta: {
        production_order_id: productionOrder.id,
        po_number: productionOrder.po_number,
      },
    })

    // Log de auditoria
    await supabaseService.from('audit_logs').insert({
      event_type: 'production_order_created',
      actor_id: user.id,
      target_id: params.id,
      target_type: 'budget',
      details: {
        production_order_id: productionOrder.id,
        po_number: productionOrder.po_number,
      },
    })

    return NextResponse.json({
      success: true,
      data: productionOrder,
      message: 'Ordem de produção criada com sucesso',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de criação de ordem de produção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
