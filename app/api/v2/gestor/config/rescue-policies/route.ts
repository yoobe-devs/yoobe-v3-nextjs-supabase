import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'

const Query = z.object({ store_id: z.string().uuid().optional() })

export async function GET(req: Request) {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const { searchParams } = new URL(req.url)
  const parsed = Query.safeParse({ store_id: searchParams.get('store_id') || undefined })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  return NextResponse.json({ data: { max_qty_per_item: 5, allow_money: true, allow_points: true, messages: [] } })
}

