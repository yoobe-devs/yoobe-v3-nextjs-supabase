import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emitInventoryUpdate } from '@/app/lib/inventory-events'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

function verifySignature(req: NextRequest, rawBody: string) {
  const secret = process.env.CUBBO_WEBHOOK_SECRET || ''
  if (!secret) return false
  const hdr = req.headers.get('x-cubbo-signature') || ''
  // Simple constant-time compare with HMAC-SHA256 of body
  try {
    const crypto = require('crypto') as typeof import('crypto')
    const sig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(hdr))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  if (!verifySignature(req, raw)) {
    return new NextResponse('Invalid signature', { status: 401 })
  }
  let body: any = {}
  try { body = JSON.parse(raw) } catch {}

  const eventId = body?.event_id as string
  const externalSku = body?.external_sku as string
  const qty = Number(body?.qty ?? 0)
  const version = body?.version as string | undefined
  const warehouseCode = body?.warehouse_code as string | undefined
  if (!eventId || !externalSku || Number.isNaN(qty)) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  // Map external_sku -> product_id
  const { data: map } = await service
    .from('inventory_integrations')
    .select('product_id')
    .eq('provider', 'cubbo')
    .eq('external_sku', externalSku)
    .eq('is_active', true)
    .maybeSingle()

  if (!map?.product_id) {
    return NextResponse.json({ ok: true, ignored: true })
  }
  const productId = map.product_id

  // Idempotency check and update
  const { data: invRow } = await service
    .from('store_inventory')
    .select('physical_qty,last_cubbo_webhook_id')
    .eq('product_id', productId)
    .maybeSingle()

  if (invRow?.last_cubbo_webhook_id === eventId) {
    return NextResponse.json({ ok: true, idempotent: true })
  }

  const oldPhysical = invRow?.physical_qty ?? 0
  const delta = qty - oldPhysical

  // Upsert inventory
  const { error: upErr } = await service.from('store_inventory').upsert({
    product_id: productId,
    physical_qty: qty,
    updated_physical_at: new Date().toISOString(),
    last_cubbo_webhook_id: eventId,
  }, { onConflict: 'product_id' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // Audit event
  await service.from('inventory_events').insert({
    product_id: productId,
    event_type: 'cubbo_webhook',
    delta,
    meta: { external_sku: externalSku, warehouse_code: warehouseCode, version }
  })

  // Fetch related info for SSE
  const { data: prod } = await service
    .from('client_products')
    .select('id, client_id')
    .eq('id', productId)
    .maybeSingle()

  if (prod?.client_id) {
    // Compute available: physical + virtual - reserved
    const { data: inv } = await service.from('store_inventory').select('*').eq('product_id', productId).maybeSingle()
    const available = Math.max((inv?.physical_qty||0)+(inv?.virtual_qty||0)-(inv?.reserved_qty||0), 0)
    emitInventoryUpdate({
      type: 'INVENTORY_UPDATED',
      store_id: prod.client_id,
      product_id: productId,
      physical_qty: inv?.physical_qty||0,
      virtual_qty: inv?.virtual_qty||0,
      reserved_qty: inv?.reserved_qty||0,
      available_qty: available,
      synced_at: inv?.updated_physical_at || null,
    })
  }

  return NextResponse.json({ ok: true })
}

