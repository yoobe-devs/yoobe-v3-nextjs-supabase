import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { WorkvivoApi } from '@/lib/workvivo/api'

function authorized(req: Request) {
  const header = req.headers.get('x-internal-secret')
  return header && process.env.INTERNAL_API_SECRET && header === process.env.INTERNAL_API_SECRET
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const api = new WorkvivoApi()
  try {
    const { data: users } = await supabase.from('users').select('id, email, company_id').eq('status', 'active').limit(500)
    let updated = 0
    if (users) {
      for (const u of users) {
        if (!u.email) continue
        try {
          const bal = await api.getBalance(u.email, 'email')
          await supabase
            .from('workvivo_balance_cache')
            .upsert({
              tenant_id: u.company_id,
              user_id: u.id,
              identifier_type: 'email',
              identifier: u.email,
              balance: Number(bal.balance || 0),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'identifier_type,identifier' })
          updated++
        } catch (e) {
          console.warn('Balance sync failed for', u.email, e)
        }
      }
    }
    return NextResponse.json({ ok: true, updated })
  } catch (e) {
    console.error('Sync balance error:', e)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

