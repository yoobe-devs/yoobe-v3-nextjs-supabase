import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const Body = z.object({ qty: z.number().int().positive().max(99) })

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Ensure the item belongs to user's cart
  const { data: item } = await supabase
    .from('cart_items')
    .select('id,cart_id')
    .eq('id', params.id)
    .single()
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('id', item.cart_id)
    .eq('user_id', session.user.id)
    .single()
  if (!cart) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await supabase.from('cart_items').update({ qty: parsed.data.qty }).eq('id', params.id)
  return NextResponse.json({ data: { id: params.id, qty: parsed.data.qty } })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: item } = await supabase
    .from('cart_items')
    .select('id,cart_id')
    .eq('id', params.id)
    .single()
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('id', item.cart_id)
    .eq('user_id', session.user.id)
    .single()
  if (!cart) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await supabase.from('cart_items').delete().eq('id', params.id)
  return NextResponse.json({ data: { id: params.id, deleted: true } })
}
