import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const Body = z.object({ enabled: z.boolean() })

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: me } = await supabase.from('users').select('role').eq('id', session.user.id).single()
    if (!me || !['admin_global', 'superadmin'].includes(me.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data } = await supabase
      .from('store_feature_flags')
      .select('enabled')
      .eq('store_id', params.id)
      .eq('key', 'resgate_v2_enabled')
      .single()
    return NextResponse.json({ data: { enabled: data?.enabled ?? false } })
  } catch (e) {
    console.error('get resgate-v2 flag:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: me } = await supabase.from('users').select('role').eq('id', session.user.id).single()
    if (!me || !['admin_global', 'superadmin'].includes(me.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json().catch(() => null)
    const parsed = Body.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

    const { data: existing } = await supabase
      .from('store_feature_flags')
      .select('id')
      .eq('store_id', params.id)
      .eq('key', 'resgate_v2_enabled')
      .single()

    if (existing) {
      const { error } = await supabase
        .from('store_feature_flags')
        .update({ enabled: parsed.data.enabled })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('store_feature_flags')
        .insert({ store_id: params.id, key: 'resgate_v2_enabled', enabled: parsed.data.enabled })
      if (error) throw error
    }
    return NextResponse.json({ data: { enabled: parsed.data.enabled } })
  } catch (e) {
    console.error('patch resgate-v2 flag:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

