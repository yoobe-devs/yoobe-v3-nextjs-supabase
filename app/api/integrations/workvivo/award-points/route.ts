import { NextResponse } from 'next/server'
import { z } from 'zod'
import { WorkvivoApi } from '@/lib/workvivo/api'
import { createClient } from '@supabase/supabase-js'

const Body = z.object({
  identifier: z.string().min(1),
  identifierType: z.enum(['email', 'sub', 'employeeId']).default('email'),
  amount: z.number().positive(),
  reason: z.string().optional(),
  idempotencyKey: z.string().min(6),
  metadata: z.record(z.any()).optional(),
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

    // Upsert idempotent operation record
    const { data: existing } = await supabase
      .from('workvivo_point_ops')
      .select('*')
      .eq('idempotency_key', parsed.data.idempotencyKey)
      .single()

    if (existing) {
      return NextResponse.json({ data: existing.response_payload || existing, message: 'Idempotent: existing operation' })
    }

    const { data: inserted, error: insertError } = await supabase
      .from('workvivo_point_ops')
      .insert({
        op_type: 'award',
        idempotency_key: parsed.data.idempotencyKey,
        status: 'pending',
        request_payload: parsed.data,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to register workvivo_point_ops:', insertError)
    }

    try {
      const result = await api.awardPoints(parsed.data)
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
    console.error('Workvivo award error:', e)
    return NextResponse.json({ error: 'Falha ao creditar pontos na Workvivo' }, { status: 500 })
  }
}
