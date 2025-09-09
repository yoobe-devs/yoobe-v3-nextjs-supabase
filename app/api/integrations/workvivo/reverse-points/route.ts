import { NextResponse } from 'next/server'
import { z } from 'zod'
import { WorkvivoApi } from '@/lib/workvivo/api'
import { createClient } from '@supabase/supabase-js'

const Body = z.object({
  // Either provide transactionId OR identifier+amount
  transactionId: z.string().optional(),
  identifier: z.string().optional(),
  identifierType: z.enum(['email', 'sub', 'employeeId']).optional(),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
  idempotencyKey: z.string().optional(),
}).refine((d) => !!d.transactionId || (!!d.identifier && !!d.amount && !!d.identifierType), {
  message: 'Informe transactionId OU (identifier, identifierType e amount)',
})

function checkInternalSecret(req: Request) {
  const header = req.headers.get('x-internal-secret')
  const expected = process.env.INTERNAL_API_SECRET
  return expected && header && header === expected
}

export async function POST(req: Request) {
  try {
    if (!checkInternalSecret(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const json = await req.json()
    const parsed = Body.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    const api = new WorkvivoApi()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const key = parsed.data.idempotencyKey || parsed.data.transactionId || ''
    if (!key) {
      return NextResponse.json({ error: 'idempotencyKey ou transactionId é obrigatório' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('workvivo_point_ops')
      .select('*')
      .eq('idempotency_key', key)
      .single()

    if (existing) {
      return NextResponse.json({ data: existing.response_payload || existing, message: 'Idempotent: existing operation' })
    }

    const { data: inserted } = await supabase
      .from('workvivo_point_ops')
      .insert({
        op_type: 'reverse',
        idempotency_key: key,
        status: 'pending',
        request_payload: parsed.data,
      })
      .select()
      .single()

    try {
      const result = await api.reversePoints(parsed.data)
      await supabase
        .from('workvivo_point_ops')
        .update({
          status: 'succeeded',
          response_payload: result,
          workvivo_transaction_id: (result as any).transactionId || null,
        })
        .eq('id', inserted?.id)
      return NextResponse.json({ data: result })
    } catch (e: any) {
      await supabase
        .from('workvivo_point_ops')
        .update({ status: 'failed', error_message: e?.message || 'unknown' })
        .eq('id', inserted?.id)
      throw e
    }
  } catch (e) {
    console.error('Workvivo reverse error:', e)
    return NextResponse.json({ error: 'Falha ao reverter/abater pontos na Workvivo' }, { status: 500 })
  }
}
