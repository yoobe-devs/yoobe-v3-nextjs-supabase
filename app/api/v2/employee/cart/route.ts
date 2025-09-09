import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const Query = z.object({ store_id: z.string().uuid().optional() })

export async function GET(req: Request) {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const { searchParams } = new URL(req.url)
  const parsed = Query.safeParse({ store_id: searchParams.get('store_id') || undefined })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const tenantId = me?.company_id
  if (!tenantId || !parsed.data.store_id) return NextResponse.json({ data: { id: null, items: [], totals: { points: 0 } } })

  // Ensure open cart
  let { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', session.user.id)
    .eq('store_id', parsed.data.store_id)
    .eq('status', 'open')
    .single()
  if (!cart) {
    const { data: created } = await supabase
      .from('carts')
      .insert({ tenant_id: tenantId, user_id: session.user.id, store_id: parsed.data.store_id, status: 'open' })
      .select('id')
      .single()
    cart = created || null
  }
  if (!cart) return NextResponse.json({ data: { id: null, items: [], totals: { points: 0 } } })
  const { data: items } = await supabase
    .from('cart_items')
    .select('id,store_product_id,name,image,points_price_at_add,qty')
    .eq('cart_id', cart.id)

  const totals = (items || []).reduce((s: number, it: any) => s + (it.points_price_at_add || 0) * (it.qty || 0), 0)
  return NextResponse.json({ data: { id: cart.id, items: items || [], totals: { points: totals } } })
}
