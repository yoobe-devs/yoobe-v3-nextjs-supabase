import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string, storeProductId: string } }) {
  try {
    const productId = params.storeProductId
    const body = await req.json().catch(()=>({}))
    const thr = Number(body?.threshold)
    if (!Number.isFinite(thr) || thr < 0) return NextResponse.json({ error: 'threshold inválido' }, { status: 400 })
    const { error } = await service.from('store_inventory').upsert({ product_id: productId, low_stock_threshold: thr }, { onConflict: 'product_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, low_stock_threshold: thr })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

