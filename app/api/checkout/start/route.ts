import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { StartCheckoutDTO } from '@/lib/validation'
import { createCheckoutFromCart, logCheckoutEvent } from '@/lib/checkout'

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    const body = await req.json()
    const dto = StartCheckoutDTO.parse(body)
    const sessionId = await createCheckoutFromCart(
      userId,
      companyId,
      dto.paymentMethod,
      dto.shipping,
      dto.billing,
      dto.meta
    )
    await logCheckoutEvent(sessionId, userId, 'checkout_started', { method: dto.paymentMethod })
    return NextResponse.json({ sessionId, status: 'pending_payment' }, { status: 201 })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}



