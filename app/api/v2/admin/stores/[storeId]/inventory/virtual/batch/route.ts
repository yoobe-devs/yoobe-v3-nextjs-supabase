import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emitInventoryUpdate } from '@/app/lib/inventory-events'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const storeId = params.storeId
    const body = await req.json().catch(()=>({}))
    const ids: string[] = Array.isArray(body?.product_ids) ? body.product_ids : []
    if (!storeId || ids.length === 0) return NextResponse.json({ error: 'storeId and product_ids required' }, { status: 400 })
    const hasSet = typeof body?.set === 'number'
    const hasInc = typeof body?.increment === 'number'
    if (!hasSet && !hasInc) return NextResponse.json({ error: 'set or increment required' }, { status: 400 })
    const reason = body?.reason || null

    let updated = 0
    for (const pid of ids) {
      const { data: cur } = await service.from('store_inventory').select('virtual_qty').eq('product_id', pid).maybeSingle()
      const now = new Date().toISOString()
      const current = cur?.virtual_qty ?? 0
      const delta = hasSet ? (body.set - current) : body.increment
      const newQty = current + delta
      const { error: upErr } = await service.from('store_inventory').upsert({ product_id: pid, virtual_qty: newQty, updated_virtual_at: now }, { onConflict: 'product_id' })
      if (upErr) continue
      updated++
      await service.from('inventory_events').insert({ product_id: pid, event_type: 'adjust_virtual', delta, meta: { reason } })
      const { data: inv } = await service.from('store_inventory').select('*').eq('product_id', pid).maybeSingle()
      const available = Math.max((inv?.physical_qty||0)+(inv?.virtual_qty||0)-(inv?.reserved_qty||0), 0)
      const { data: prod } = await service.from('client_products').select('client_id').eq('id', pid).maybeSingle()
      emitInventoryUpdate({ type:'INVENTORY_UPDATED', store_id: prod?.client_id, product_id: pid, physical_qty: inv?.physical_qty||0, virtual_qty: inv?.virtual_qty||0, reserved_qty: inv?.reserved_qty||0, available_qty: available, synced_at: inv?.updated_physical_at||null })
    }
    return NextResponse.json({ ok: true, updated })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

