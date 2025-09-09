import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emitInventoryUpdate } from '@/app/lib/inventory-events'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string, storeProductId: string } }) {
  const storeId = params.storeId
  const productId = params.storeProductId
  const body = await req.json().catch(()=>({}))
  const reason = body?.reason || null
  const { data: settings } = await service.from('store_inventory_settings').select('allow_virtual_stock').eq('store_id', storeId).maybeSingle()
  if (settings && settings.allow_virtual_stock === false) return NextResponse.json({ error: 'Virtual stock disabled' }, { status: 403 })

  const { data: current } = await service.from('store_inventory').select('virtual_qty').eq('product_id', productId).maybeSingle()
  const now = new Date().toISOString()
  let newQty = current?.virtual_qty ?? 0
  let delta = 0
  if (typeof body?.set === 'number') { delta = body.set - newQty; newQty = body.set }
  else if (typeof body?.increment === 'number') { delta = body.increment; newQty = newQty + body.increment }
  else return NextResponse.json({ error: 'set or increment required' }, { status: 400 })

  const { error: upErr } = await service.from('store_inventory').upsert({ product_id: productId, virtual_qty: newQty, updated_virtual_at: now }, { onConflict: 'product_id' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  await service.from('inventory_events').insert({ product_id: productId, event_type: 'adjust_virtual', delta, meta: { reason } })

  const { data: prod } = await service.from('client_products').select('client_id').eq('id', productId).maybeSingle()
  const { data: inv } = await service.from('store_inventory').select('*').eq('product_id', productId).maybeSingle()
  const available = Math.max((inv?.physical_qty||0)+(inv?.virtual_qty||0)-(inv?.reserved_qty||0), 0)
  emitInventoryUpdate({ type:'INVENTORY_UPDATED', store_id: prod?.client_id, product_id: productId, physical_qty: inv?.physical_qty||0, virtual_qty: inv?.virtual_qty||0, reserved_qty: inv?.reserved_qty||0, available_qty: available, synced_at: inv?.updated_physical_at||null })
  return NextResponse.json({ ok: true, virtual_qty: newQty })
}

