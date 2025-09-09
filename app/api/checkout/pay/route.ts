import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { PayDTO } from '@/lib/validation'
import { logCheckoutEvent } from '@/lib/checkout'
import { createClient } from '@supabase/supabase-js'
import { getActiveConversionRule } from '@/lib/points-utils'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()
    const { sessionId } = PayDTO.parse(await req.json())
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId é obrigatório' }, { status: 400 })
    }
    await logCheckoutEvent(sessionId, userId, 'payment_started', {})
    await service.from('checkout_sessions').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', sessionId)
    await logCheckoutEvent(sessionId, userId, 'payment_paid', {})
    await service.from('nfe_exports').insert({ session_id: sessionId, user_id: userId, status: 'pending', request_payload: {} })

    // Award Workvivo points (feature-flagged)
    if (process.env.WORKVIVO_ENABLED === '1') {
      try {
        const { data: session } = await service
          .from('checkout_sessions')
          .select('id, user_id, tenant_id, amount_total, currency')
          .eq('id', sessionId)
          .single()

        if (session) {
          const rule = await getActiveConversionRule(session.tenant_id)
          if (rule) {
            const amountBRL = Number(session.amount_total || 0)
            const base = amountBRL * rule.points_per_currency
            const points = rule.rounding_mode === 'ceil' ? Math.ceil(base) : rule.rounding_mode === 'floor' ? Math.floor(base) : Math.round(base)

            if (points > 0) {
              const { data: adminUser } = await service.auth.admin.getUserById(session.user_id)
              const email = adminUser?.user?.email
              const internalSecret = process.env.INTERNAL_API_SECRET
              if (email && internalSecret) {
                const payload = {
                  identifier: email,
                  identifierType: 'email',
                  amount: points,
                  reason: `Compra ${session.id}`,
                  idempotencyKey: `checkout:${session.id}:paid`,
                  metadata: { checkout_session_id: session.id, tenant_id: session.tenant_id },
                }
                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
                await fetch(`${baseUrl}/api/integrations/workvivo/award-points`, {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                    'x-internal-secret': internalSecret,
                  },
                  body: JSON.stringify(payload),
                })
              }
            }
          }
        }
      } catch (awardErr) {
        console.error('Falha ao creditar pontos Workvivo:', awardErr)
      }
    }
    return NextResponse.json({ status: 'paid' })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}

