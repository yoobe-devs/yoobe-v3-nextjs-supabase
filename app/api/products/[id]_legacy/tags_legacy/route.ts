import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = user.user_metadata?.role
    if (!['admin','admin_global','superadmin','gestor'].includes(role)) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    const body = await request.json().catch(() => ({}))
    const add: string[] = Array.isArray(body?.add) ? body.add : []
    const remove: string[] = Array.isArray(body?.remove) ? body.remove : []
    if (add.length) await supabase.from('product_tags').insert(add.map(t => ({ product_id: params.id, tag_id: t })))
    if (remove.length) await supabase.from('product_tags').delete().in('tag_id', remove).eq('product_id', params.id)
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }) }
}

