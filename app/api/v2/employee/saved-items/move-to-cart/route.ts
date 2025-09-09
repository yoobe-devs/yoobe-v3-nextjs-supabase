import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const Body = z.object({ store_id: z.string().uuid(), store_product_id: z.string().uuid() })

export async function POST(req: Request) {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  const tenantId = me?.company_id
  const { store_id, store_product_id } = parsed.data

  // remove from saved (best-effort)
  if (tenantId) {
    await supabase
      .from('saved_items')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('user_id', session.user.id)
      .eq('store_id', store_id)
      .eq('store_product_id', store_product_id)
  }

  // Ensure open cart
  let { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', session.user.id)
    .eq('store_id', store_id)
    .eq('status', 'open')
    .single()
  if (!cart) {
    const { data: created } = await supabase
      .from('carts')
      .insert({ tenant_id: tenantId, user_id: session.user.id, store_id, status: 'open' })
      .select('id')
      .single()
    cart = created || null
  }
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  // Load snapshot for product
  const { data: p } = await supabase
    .from('client_products')
    .select('id,name,image_url,points_cost,base_products(name,base_points_cost)')
    .eq('id', store_product_id)
    .single()
  if (!p) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const snapshotName = p.name || p.base_products?.name || 'Produto'
  const pointsPrice = p.points_cost || p.base_products?.base_points_cost || 0

  // Merge quantity (default 1)
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id,qty')
    .eq('cart_id', cart.id)
    .eq('store_product_id', store_product_id)
    .single()
  if (existing) {
    await supabase.from('cart_items').update({ qty: existing.qty + 1 }).eq('id', existing.id)
  } else {
    await supabase.from('cart_items').insert({
      cart_id: cart.id,
      store_product_id,
      store_sku: null,
      name: snapshotName,
      image: p.image_url || null,
      points_price_at_add: pointsPrice,
      policy_snapshot: {},
      qty: 1,
    })
  }

  return NextResponse.json({ data: { moved: true, cart_id: cart.id } })
}
