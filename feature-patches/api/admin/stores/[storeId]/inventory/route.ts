import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emitInventoryUpdate } from '@/app/lib/inventory-events'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

function isAdmin(user: any) { return ['admin_global','superadmin'].includes(user?.user_metadata?.role) }

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  const storeId = params.storeId
  const { data: list, error } = await service
    .from('client_products')
    .select('id, name, price, status, store_inventory:store_inventory(*)')
    .eq('client_id', storeId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const items = (list||[]).map((p:any)=>{
    const inv = p.store_inventory?.[0] || p.store_inventory || {}
    const physical = inv.physical_qty||0, virtual = inv.virtual_qty||0, reserved = inv.reserved_qty||0
    const available = Math.max(physical+virtual-reserved, 0)
    const threshold = inv.low_stock_threshold ?? 5
    const badge = available === 0 ? 'sem_estoque' : (available < threshold ? 'baixo' : 'ok')
    return { product_id: p.id, name: p.name, status: p.status, price: p.price, physical_qty: physical, virtual_qty: virtual, reserved_qty: reserved, available_qty: available, badge_status: badge, updated_physical_at: inv.updated_physical_at }
  })
  return NextResponse.json({ items })
}

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
  // update settings
  const storeId = params.storeId
  const body = await req.json().catch(()=>({}))
  const { default_low_stock_threshold, allow_virtual_stock, realtime_stream_enabled } = body || {}
  const { error } = await service.from('store_inventory_settings').upsert({
    store_id: storeId,
    default_low_stock_threshold: default_low_stock_threshold ?? 5,
    allow_virtual_stock: allow_virtual_stock ?? true,
    realtime_stream_enabled: realtime_stream_enabled ?? true,
  }, { onConflict: 'store_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

