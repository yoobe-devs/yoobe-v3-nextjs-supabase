import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(_req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: me } = await supabase.from('users').select('company_id, role').eq('id', session.user.id).single()
    if (!me) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // Find stores for this company
    const { data: stores } = await supabase.from('stores').select('id').eq('company_id', me.company_id)
    const ids = (stores || []).map(s => s.id)
    if (!ids.length) return NextResponse.json({ data: { any_enabled: false, stores: [] } })
    const { data: flags } = await supabase
      .from('store_feature_flags')
      .select('store_id,enabled')
      .in('store_id', ids)
      .eq('key', 'resgate_v2_enabled')
    const any = (flags || []).some(f => f.enabled)
    return NextResponse.json({ data: { any_enabled: any, stores: flags || [] } })
  } catch (e) {
    console.error('gestor store flags error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

