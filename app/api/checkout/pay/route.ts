import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { PayDTO } from '@/lib/validation'
import { logCheckoutEvent } from '@/lib/checkout'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()
    const { sessionId } = PayDTO.parse(await req.json())
    await logCheckoutEvent(sessionId, userId, 'payment_started', {})
    await service.from('checkout_sessions').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', sessionId)
    await logCheckoutEvent(sessionId, userId, 'payment_paid', {})
    await service.from('nfe_exports').insert({ session_id: sessionId, user_id: userId, status: 'pending', request_payload: {} })
    return NextResponse.json({ status: 'paid' })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}


