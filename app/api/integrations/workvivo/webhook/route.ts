import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

function computeHmac(secret: string, payload: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function verifySignature(req: Request, bodyText: string) {
  const secret = process.env.WORKVIVO_WEBHOOK_SECRET
  if (!secret) return false
  const header = req.headers.get('x-workvivo-signature') || ''
  // Accept formats: "sha256=hex" or just "hex"
  const expected = computeHmac(secret, bodyText)
  const presented = header.startsWith('sha256=') ? header.slice(7) : header
  return timingSafeEqual(presented, expected)
}

export async function POST(req: Request) {
  const text = await req.text()
  if (!verifySignature(req, text)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  try {
    const event = JSON.parse(text)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const tenantId = (req.headers.get('x-tenant-id') || null) as string | null
    const type = event?.type || 'unknown'
    const data = event?.data || {}

    // Persist raw event for audit/history
    try {
      await supabase.from('workvivo_events').insert({
        tenant_id: tenantId,
        event_type: type,
        identifier_type: data.identifierType || null,
        identifier: data.identifier || null,
        payload: event,
      })
    } catch (e) {
      console.error('Failed to log workvivo event:', e)
    }

    // Update balance cache if payload includes balance info
    if (type.includes('points') || typeof data.newBalance !== 'undefined') {
      const identifierType = (data.identifierType || 'email') as 'email' | 'sub' | 'employeeId'
      const identifier = (data.identifier || data.email || '').toString()
      const balance = Number(data.newBalance ?? data.balance ?? 0)
      if (identifier) {
        // Try to map to local user by email when possible
        let userId: string | null = null
        if (identifierType === 'email') {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', identifier)
            .single()
          userId = user?.id || null
        }
        await supabase
          .from('workvivo_balance_cache')
          .upsert(
            {
              tenant_id: tenantId,
              user_id: userId,
              identifier_type: identifierType,
              identifier,
              balance,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'identifier_type,identifier' }
          )
        console.log(`Workvivo balance cache updated: ${identifier} -> ${balance}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Workvivo webhook error:', e)
    return NextResponse.json({ error: 'Webhook parse error' }, { status: 400 })
  }
}
