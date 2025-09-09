import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// Schema para atualização de ordem de produção
const updateProductionOrderSchema = z.object({
  status: z
    .enum([
      'planned',
      'in_progress',
      'qc',
      'packed',
      'shipped',
      'delivered',
      'canceled',
    ])
    .optional(),
  po_number: z.string().optional(),
  est_start_at: z.string().datetime().optional(),
  est_finish_at: z.string().datetime().optional(),
  logistics: z.record(z.any()).optional(),
})

// GET - Buscar ordem de produção específica
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

    // Buscar ordem de produção
    const { data: productionOrder, error } = await supabaseService
      .from('production_orders')
      .select(
        `
        id,
        budget_id,
        company_id,
        po_number,
        status,
        est_start_at,
        est_finish_at,
        logistics,
        created_at,
        updated_at,
        budgets!inner(id, title, company_id),
        companies!inner(id, name)
      `
      )
      .eq('id', params.id)
      .single()

    if (error || !productionOrder) {
      return NextResponse.json(
        { error: 'Ordem de produção não encontrada' },
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

      if (userData?.company_id !== productionOrder.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    return NextResponse.json({
      success: true,
      data: productionOrder,
    })
  } catch (error) {
    console.error('Erro na API de ordem de produção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar ordem de produção
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['admin', 'admin_global', 'superadmin'], // Apenas admins podem atualizar
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProductionOrderSchema.parse(body)

    // Buscar ordem de produção existente
    const { data: existingOrder, error: fetchError } = await supabaseService
      .from('production_orders')
      .select('id, budget_id, company_id, status')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingOrder) {
      return NextResponse.json(
        { error: 'Ordem de produção não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar ordem de produção
    const { data: productionOrder, error: updateError } = await supabaseService
      .from('production_orders')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select(
        `
        id,
        budget_id,
        company_id,
        po_number,
        status,
        est_start_at,
        est_finish_at,
        logistics,
        created_at,
        updated_at,
        budgets!inner(id, title, company_id),
        companies!inner(id, name)
      `
      )
      .single()

    if (updateError) {
      console.error('Erro ao atualizar ordem de produção:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar ordem de produção' },
        { status: 500 }
      )
    }

    // Se o status mudou, criar evento de tracking
    if (validatedData.status && validatedData.status !== existingOrder.status) {
      const statusLabels = {
        planned: 'Planejada',
        in_progress: 'Em Produção',
        qc: 'Controle de Qualidade',
        packed: 'Empacotada',
        shipped: 'Enviada',
        delivered: 'Entregue',
        canceled: 'Cancelada',
      }

      await supabaseService.from('budget_tracking_events').insert({
        budget_id: existingOrder.budget_id,
        status:
          validatedData.status === 'shipped'
            ? 'shipped'
            : validatedData.status === 'delivered'
            ? 'delivered'
            : 'production',
        title: `Status da Ordem: ${statusLabels[validatedData.status]}`,
        description: `Ordem de produção ${
          productionOrder.po_number || productionOrder.id
        } atualizada para ${statusLabels[validatedData.status]}`,
        actor_id: user.id,
        meta: {
          production_order_id: productionOrder.id,
          old_status: existingOrder.status,
          new_status: validatedData.status,
        },
      })
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert({
      event_type: 'production_order_updated',
      actor_id: user.id,
      target_id: existingOrder.budget_id,
      target_type: 'budget',
      details: {
        production_order_id: productionOrder.id,
        changes: validatedData,
      },
    })

    return NextResponse.json({
      success: true,
      data: productionOrder,
      message: 'Ordem de produção atualizada com sucesso',
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

    console.error('Erro na API de atualização de ordem de produção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
