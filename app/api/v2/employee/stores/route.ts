import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isResgateV2Enabled } from '@/lib/resgate-v2/feature'

export async function GET() {
  if (!isResgateV2Enabled()) return NextResponse.json({ error: 'Resgate v2 desabilitado' }, { status: 404 })
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me } = await supabase.from('users').select('company_id').eq('id', session.user.id).single()
  if (!me?.company_id) return NextResponse.json({ data: [] })
  const { data, error } = await supabase.from('stores').select('id,name').eq('company_id', me.company_id).order('name')
  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

