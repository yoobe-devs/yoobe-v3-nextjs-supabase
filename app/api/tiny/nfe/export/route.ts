import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { TinyExportDTO } from '@/lib/validation'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()
    const dto = TinyExportDTO.parse(await req.json())
    // stub export
    const response = { ok: true, protocol: 'MOCK-' + dto.sessionId.slice(0, 8) }
    await service.from('nfe_exports').insert({
      session_id: dto.sessionId,
      user_id: userId,
      request_payload: { series: dto.series, model: dto.model },
      response_payload: response,
      status: 'exported'
    })
    return NextResponse.json({ status: 'exported' })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}


