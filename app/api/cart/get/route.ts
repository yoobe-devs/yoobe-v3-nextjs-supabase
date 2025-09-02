import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { getCart } from '@/lib/cart'

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await requireUser()
    const cart = await getCart(userId)
    return NextResponse.json({ items: cart.items, total: cart.total, points: cart.points })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}



