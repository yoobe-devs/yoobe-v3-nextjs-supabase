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
  const { data } = await supabase
    .from('saved_items')
    .select('id,store_product_id,name,points_price_at_save,qty,created_at')
    .eq('user_id', session.user.id)
    .if(!!parsed.data.store_id, (q) => q.eq('store_id', parsed.data.store_id))
  return NextResponse.json({ data: data || [] })
}
