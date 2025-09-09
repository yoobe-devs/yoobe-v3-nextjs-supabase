import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const Body = z.object({ store_id: z.string().uuid(), store_product_id: z.string().uuid(), qty: z.number().int().positive().max(99) })

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
  const { store_id, store_product_id, qty } = parsed.data
  // Snapshot minimal name/points
  const { data: p } = await supabase
    .from('client_products')
    .select('id,name,points_cost,base_products(name,base_points_cost)')
    .eq('id', store_product_id)
    .single()
  await supabase.from('saved_items').insert({
    tenant_id: tenantId,
    user_id: session.user.id,
    store_id,
    store_product_id,
    name: p?.name || p?.base_products?.name || 'Produto',
    points_price_at_save: p?.points_cost || p?.base_products?.base_points_cost || 0,
    qty,
  })
  return NextResponse.json({ data: { saved: true } })
}
