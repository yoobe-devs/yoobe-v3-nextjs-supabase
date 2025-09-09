import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, serviceKey)

function isUuid(v: any) { return typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v) }

async function ensureAuth() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  return session
}

async function recomputeTotals(budgetId: string) {
  const { data: items } = await service.from('budget_items').select('quantity, custom_price, custom_points_cost, base_products(base_price, base_points_cost)').eq('budget_id', budgetId)
  const totals = (items || []).reduce((acc: any, it: any) => {
    const p = it.custom_price ?? it.base_products?.base_price ?? 0
    const pt = it.custom_points_cost ?? it.base_products?.base_points_cost ?? 0
    acc.amount += p * (it.quantity || 1)
    acc.points += pt * (it.quantity || 1)
    return acc
  }, { amount: 0, points: 0 })
  await service.from('budgets').update({ total_amount: totals.amount, total_points: totals.points }).eq('id', budgetId)
}

export async function PATCH(request: NextRequest, { params }: { params: { quotationId: string, itemId: string } }) {
  try {
    const session = await ensureAuth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { quotationId, itemId } = params
    if (!isUuid(quotationId) || !isUuid(itemId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const { data: budget } = await service.from('budgets').select('id, status').eq('id', quotationId).single()
    if (!budget) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    if (!['draft','rejected'].includes(budget.status)) return NextResponse.json({ error: 'Cannot edit in current status' }, { status: 409 })

    const body = await request.json().catch(() => ({}))
    const payload: any = {}
    if (body.qty != null) payload.quantity = Math.max(1, parseInt(String(body.qty)))
    if (body.unitPrice != null) payload.custom_price = Number(body.unitPrice)
    if (body.unitPoints != null) payload.custom_points_cost = parseInt(String(body.unitPoints))
    if (typeof body.notes === 'string') payload.notes = body.notes

    const { data: updated, error } = await service
      .from('budget_items')
      .update(payload)
      .eq('id', itemId)
      .eq('budget_id', quotationId)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: 'Update error' }, { status: 500 })

    await recomputeTotals(quotationId)
    return NextResponse.json({ success: true, item: updated })
  } catch (e) {
    console.error('edit quotation item error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { quotationId: string, itemId: string } }) {
  try {
    const session = await ensureAuth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { quotationId, itemId } = params
    if (!isUuid(quotationId) || !isUuid(itemId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const { data: budget } = await service.from('budgets').select('id, status').eq('id', quotationId).single()
    if (!budget) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    if (!['draft','rejected'].includes(budget.status)) return NextResponse.json({ error: 'Cannot edit in current status' }, { status: 409 })

    const { error } = await service.from('budget_items').delete().eq('id', itemId).eq('budget_id', quotationId)
    if (error) return NextResponse.json({ error: 'Delete error' }, { status: 500 })
    await recomputeTotals(quotationId)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('delete quotation item error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

