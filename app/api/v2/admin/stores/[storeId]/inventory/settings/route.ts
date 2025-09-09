import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  const storeId = params.storeId
  const { data } = await service
    .from('store_inventory_settings')
    .select('*')
    .eq('store_id', storeId)
    .maybeSingle()
  return NextResponse.json({
    store_id: storeId,
    default_low_stock_threshold: data?.default_low_stock_threshold ?? 5,
    allow_virtual_stock: data?.allow_virtual_stock ?? true,
    realtime_stream_enabled: data?.realtime_stream_enabled ?? true,
  })
}

