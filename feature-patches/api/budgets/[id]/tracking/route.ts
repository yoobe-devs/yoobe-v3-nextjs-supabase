import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// Schema para evento de tracking
const trackingEventSchema = z.object({
  status: z.enum([
    'received',
    'design_review',
    'proof_sent',
    'proof_approved',
    'production',
    'qc',
    'shipped',
    'delivered',
    'blocked',
  ]),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  meta: z.record(z.any()).optional(),
})

// GET - Listar eventos de tracking do orçamento
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

    // Buscar eventos de tracking
    const { data: events, error } = await supabaseService
      .from('budget_tracking_events')
      .select(
        `
        id,
        status,
        title,
        description,
        meta,
        created_at,
        users!budget_tracking_events_actor_id_fkey(
          id,
          email,
          user_metadata
        )
      `
      )
      .eq('budget_id', params.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar eventos de tracking:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        budget_id: params.id,
        events: events || [],
      },
    })
  } catch (error) {
    console.error('Erro na API de tracking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar evento de tracking
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['admin', 'admin_global', 'superadmin'], // Apenas admins podem criar eventos
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = trackingEventSchema.parse(body)

    // Verificar se o orçamento existe
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

    // Criar evento de tracking
    const { data: event, error: createError } = await supabaseService
      .from('budget_tracking_events')
      .insert({
        budget_id: params.id,
        status: validatedData.status,
        title: validatedData.title,
        description: validatedData.description,
        meta: validatedData.meta,
        actor_id: user.id,
      })
      .select(
        `
        id,
        status,
        title,
        description,
        meta,
        created_at,
        users!budget_tracking_events_actor_id_fkey(
          id,
          email,
          user_metadata
        )
      `
      )
      .single()

    if (createError) {
      console.error('Erro ao criar evento de tracking:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar evento' },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert({
      event_type: 'budget_tracking_event_created',
      actor_id: user.id,
      target_id: params.id,
      target_type: 'budget',
      details: {
        event_id: event.id,
        status: validatedData.status,
        title: validatedData.title,
      },
    })

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Evento de tracking criado com sucesso',
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

    console.error('Erro na API de criação de evento de tracking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
