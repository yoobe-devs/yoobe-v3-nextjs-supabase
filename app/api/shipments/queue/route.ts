import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { QueueShipmentDTO } from '@/lib/validation'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()
    const { orderId, addressId, priority } = QueueShipmentDTO.parse(await req.json())
    await service.from('shipment_intents').update({ status: 'queued', updated_at: new Date().toISOString() }).eq('order_id', orderId).eq('user_id', userId)
    return NextResponse.json({ queued: true })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}



