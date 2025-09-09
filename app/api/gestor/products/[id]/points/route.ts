import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-missing'
)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = (user.user_metadata as any)?.role
    if (!['manager','gestor','admin','admin_global','superadmin'].includes(role)) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const redeemable_points = Boolean(body?.redeemable_points)
    const points_value = body?.points_value != null ? parseInt(body.points_value) : null

    const { data, error: updErr } = await supabaseService
      .from('client_products')
      .update({ redeemable_points, points_value, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*')
      .single()
    if (updErr) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
    return NextResponse.json({ product: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

