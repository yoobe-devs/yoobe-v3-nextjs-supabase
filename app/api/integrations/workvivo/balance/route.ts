import { NextResponse } from 'next/server'
import { z } from 'zod'
import { WorkvivoApi } from '@/lib/workvivo/api'

const Query = z.object({
  identifier: z.string().min(1),
  type: z.enum(['email', 'sub', 'employeeId']).default('email'),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = Query.safeParse({
      identifier: searchParams.get('identifier'),
      type: (searchParams.get('type') || 'email') as any,
    })
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    const { identifier, type } = parsed.data

    const api = new WorkvivoApi()
    const data = await api.getBalance(identifier, type)
    return NextResponse.json({ data })
  } catch (e) {
    console.error('Workvivo balance error:', e)
    return NextResponse.json({ error: 'Falha ao consultar saldo na Workvivo' }, { status: 500 })
  }
}

