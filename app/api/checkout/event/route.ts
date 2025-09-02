import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { CheckoutEventDTO } from '@/lib/validation'
import { logCheckoutEvent } from '@/lib/checkout'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()
    const dto = CheckoutEventDTO.parse(await req.json())
    await logCheckoutEvent(dto.sessionId, userId, dto.event, dto.payload)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}


