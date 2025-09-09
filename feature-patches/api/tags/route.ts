import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    const body = await request.json().catch(() => ({}))
    const name = (body?.name || '').trim()
    if (!name) return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    const { data, error: err } = await supabase.from('tags').insert({ name }).select('*').single()
    if (err) return NextResponse.json({ error: err.message }, { status: 500 })
    return NextResponse.json({ tag: data })
  } catch (e) { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }) }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.from('tags').select('*').order('name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (e) { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }) }
}
