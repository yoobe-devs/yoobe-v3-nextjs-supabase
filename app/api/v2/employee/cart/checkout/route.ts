import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isResgateV2Enabled, parseIdempotencyKey } from '@/lib/resgate-v2/feature'
import { ensureIdempotency } from '@/lib/resgate-v2/idempotency'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const Body = z.object({ store_id: z.string().uuid() })

export async function POST(req: Request) {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const key = parseIdempotencyKey(req.headers)
  const body = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  if (key) {
    const idem = await ensureIdempotency(`checkout:${parsed.data.store_id}:${key}`)
    if (idem === 'duplicate') return NextResponse.json({ data: { status: 'duplicate' } })
  }
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const tenantId = me?.company_id
  const storeId = parsed.data.store_id
  if (!tenantId) return NextResponse.json({ error: 'Tenant not found' }, { status: 400 })

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', session.user.id)
    .eq('store_id', storeId)
    .eq('status', 'open')
    .single()
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  const { data: items } = await supabase
    .from('cart_items')
    .select('id,store_product_id,name,points_price_at_add,qty')
    .eq('cart_id', cart.id)

  const totalPoints = (items || []).reduce((s: number, it: any) => s + (it.points_price_at_add || 0) * (it.qty || 0), 0)

  // Placeholder: here we would call existing points engine to finalize redemption per item
  // For preview, just mark cart completed
  await supabase.from('carts').update({ status: 'completed' }).eq('id', cart.id)
  return NextResponse.json({ data: { cart_id: cart.id, total_points: totalPoints, status: 'completed' } })
}

