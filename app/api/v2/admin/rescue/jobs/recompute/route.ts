import { NextResponse } from 'next/server'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'

export async function POST() {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  return NextResponse.json({ data: { started: true } })
}

