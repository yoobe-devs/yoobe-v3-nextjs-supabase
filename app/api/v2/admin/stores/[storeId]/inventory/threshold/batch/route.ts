import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const storeId = params.storeId
    const body = await req.json().catch(()=>({}))
    const ids: string[] = Array.isArray(body?.product_ids) ? body.product_ids : []
    if (!storeId || ids.length === 0) return NextResponse.json({ error: 'storeId and product_ids required' }, { status: 400 })
    const useDefault = !!body?.use_default
    let thr = Number(body?.set)
    if (useDefault) {
      const { data: s } = await service.from('store_inventory_settings').select('default_low_stock_threshold').eq('store_id', storeId).maybeSingle()
      thr = s?.default_low_stock_threshold ?? 5
    }
    if (!useDefault && (!Number.isFinite(thr) || thr < 0)) return NextResponse.json({ error: 'invalid threshold' }, { status: 400 })

    let updated = 0
    for (const pid of ids) {
      const { error } = await service.from('store_inventory').upsert({ product_id: pid, low_stock_threshold: thr }, { onConflict: 'product_id' })
      if (!error) updated++
    }
    return NextResponse.json({ ok: true, updated, threshold: thr })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

