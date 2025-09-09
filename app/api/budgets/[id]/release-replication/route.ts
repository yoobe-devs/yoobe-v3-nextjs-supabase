import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { authenticateAndAuthorize } from '@/lib/auth'

const BodySchema = z.object({
  mode: z.enum(['all', 'items']),
  item_ids: z.array(z.string().uuid()).optional(),
  note: z.string().max(500).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // Auth via shared handler (permite bypass dev)
  const auth = await authenticateAndAuthorize(request, [
    'admin',
    'admin_global',
    'superadmin',
  ])
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error?.message || 'Não autorizado' },
      { status: auth.status || 401 }
    )
  }

  const budgetId = params.id
  const json = await request.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { mode, item_ids, note } = parsed.data

  if (mode === 'all') {
    const { error: e1 } = await supabase
      .from('budgets')
      .update({
        replication_released: true,
        replication_released_at: new Date().toISOString(),
      })
      .eq('id', budgetId)
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

    const { error: e2 } = await supabase
      .from('budget_items')
      .update({ replication_allowed: true })
      .eq('budget_id', budgetId)
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
  } else {
    if (!item_ids?.length) {
      return NextResponse.json(
        { error: 'item_ids obrigatório quando mode=items' },
        { status: 400 }
      )
    }
    const { error: e3 } = await supabase
      .from('budget_items')
      .update({ replication_allowed: true })
      .in('id', item_ids)
      .eq('budget_id', budgetId)
    if (e3) return NextResponse.json({ error: e3.message }, { status: 500 })

    // Se todos os itens estiverem liberados, marcar budget como liberado
    const { data: check } = await supabase
      .from('budget_items')
      .select('replication_allowed')
      .eq('budget_id', budgetId)
    const allReleased = (check || []).every((r: any) => r.replication_allowed)
    if (allReleased) {
      await supabase
        .from('budgets')
        .update({
          replication_released: true,
          replication_released_at: new Date().toISOString(),
        })
        .eq('id', budgetId)
    }
  }

  // Audit (best-effort)
  try {
    await supabase.from('audit_log').insert({
      event_type: 'release_replication',
      actor_id: auth.user!.id,
      target: 'budgets',
      target_id: budgetId,
      payload: { mode, item_ids, note },
      created_at: new Date().toISOString(),
    })
  } catch {}

  return NextResponse.json({ ok: true })
}
