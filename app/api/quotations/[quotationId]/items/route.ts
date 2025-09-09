import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, serviceKey)

function isUuid(v: any) { return typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v) }

// POST /api/quotations/:quotationId/items
export async function POST(request: NextRequest, { params }: { params: { quotationId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params.quotationId
    if (!isUuid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await request.json().catch(() => null)
    const baseProductId = body?.baseProductId
    const qty = Math.max(1, parseInt(String(body?.qty || '1')))
    const unitPrice = body?.unitPrice
    const unitPoints = body?.unitPoints
    const notes = typeof body?.notes === 'string' ? body.notes : null

    if (!isUuid(baseProductId)) return NextResponse.json({ error: 'Invalid baseProductId' }, { status: 400 })

    // Check budget exists and belongs to same company as user (if provided)
    const { data: budget } = await service.from('budgets').select('id, company_id, status').eq('id', id).single()
    if (!budget) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    if (!['draft','rejected'].includes(budget.status)) return NextResponse.json({ error: 'Cannot edit in current status' }, { status: 409 })

    // Snapshot from base_products if unitPrice/Points not provided
    let price = unitPrice
    let points = unitPoints
    if (price == null || points == null) {
      const { data: bp } = await service.from('base_products').select('base_price, base_points_cost').eq('id', baseProductId).single()
      if (price == null) price = bp?.base_price ?? 0
      if (points == null) points = bp?.base_points_cost ?? 0
    }

    const { data: item, error: insErr } = await service
      .from('budget_items')
      .insert({ budget_id: id, base_product_id: baseProductId, quantity: qty, custom_price: price, custom_points_cost: points, notes })
      .select('*')
      .single()
    if (insErr) return NextResponse.json({ error: 'Insert error' }, { status: 500 })

    // Recompute totals
    const { data: items } = await service.from('budget_items').select('quantity, custom_price, custom_points_cost, base_products(base_price, base_points_cost)').eq('budget_id', id)
    const totals = (items || []).reduce((acc: any, it: any) => {
      const p = it.custom_price ?? it.base_products?.base_price ?? 0
      const pt = it.custom_points_cost ?? it.base_products?.base_points_cost ?? 0
      acc.amount += p * (it.quantity || 1)
      acc.points += pt * (it.quantity || 1)
      return acc
    }, { amount: 0, points: 0 })
    await service.from('budgets').update({ total_amount: totals.amount, total_points: totals.points }).eq('id', id)

    return NextResponse.json({ success: true, item })
  } catch (e) {
    console.error('add quotation item error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

