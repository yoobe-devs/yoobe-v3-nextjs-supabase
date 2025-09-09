import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'

const Query = z.object({ company_id: z.string().uuid().optional() })

export async function GET(req: Request) {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const { searchParams } = new URL(req.url)
  const parsed = Query.safeParse({ company_id: searchParams.get('company_id') || undefined })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  return NextResponse.json({ data: { open_carts: 0, saved_items: 0, abandoned: 0 } })
}

