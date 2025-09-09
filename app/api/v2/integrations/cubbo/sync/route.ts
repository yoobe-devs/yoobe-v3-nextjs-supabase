import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emitInventoryUpdate } from '@/app/lib/inventory-events'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

// Placeholder Cubbo client — in real usage, call external API
async function fetchCubboQty(externalSku: string, _warehouse?: string) {
  // Implement provider call here; for now return 0
  return 0
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const storeId = body?.store_id as string
    const productIds: string[] | undefined = body?.product_ids
    if (!storeId) return NextResponse.json({ error: 'store_id required' }, { status: 400 })

    // Find active integrations for store
    const { data: maps, error: mErr } = await service
      .from('inventory_integrations')
      .select('product_id, external_sku, warehouse_code, is_active, client_products!inner(client_id)')
      .eq('client_products.client_id', storeId)
      .eq('is_active', true)

    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

    const filtered = (maps || []).filter(m => !productIds || productIds.includes(m.product_id as any))
    let updated = 0
    for (const m of filtered) {
      const qty = await fetchCubboQty(m.external_sku as any, m.warehouse_code as any)
      const { data: inv } = await service
        .from('store_inventory')
        .select('physical_qty')
        .eq('product_id', m.product_id)
        .maybeSingle()
      const old = inv?.physical_qty ?? 0
      const delta = qty - old
      const { error: upErr } = await service.from('store_inventory').upsert({
        product_id: m.product_id,
        physical_qty: qty,
        updated_physical_at: new Date().toISOString(),
        last_cubbo_sync_version: (body?.version || null)
      }, { onConflict: 'product_id' })
      if (upErr) continue
      updated++
      await service.from('inventory_events').insert({ product_id: m.product_id, event_type: 'cubbo_sync', delta, meta: { external_sku: m.external_sku } })
      const { data: prod } = await service.from('client_products').select('client_id').eq('id', m.product_id).maybeSingle()
      const { data: iv } = await service.from('store_inventory').select('*').eq('product_id', m.product_id).maybeSingle()
      const available = Math.max((iv?.physical_qty||0)+(iv?.virtual_qty||0)-(iv?.reserved_qty||0), 0)
      emitInventoryUpdate({ type:'INVENTORY_UPDATED', store_id: prod?.client_id, product_id: m.product_id, physical_qty: iv?.physical_qty||0, virtual_qty: iv?.virtual_qty||0, reserved_qty: iv?.reserved_qty||0, available_qty: available, synced_at: iv?.updated_physical_at||null })
    }

    return NextResponse.json({ ok: true, updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

