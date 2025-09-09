import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { clearCart, getOrCreateCart } from '@/lib/cart'
import { audit } from '@/lib/audit'

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await requireUser()
    const cartId = await getOrCreateCart(userId)
    await clearCart(userId)
    await audit('cart_cleared', 'cart', userId, cartId)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}















