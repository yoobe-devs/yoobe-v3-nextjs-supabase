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

    const role = user.user_metadata?.role
    if (!['manager','gestor'].includes(role)) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const updates: any = {}
    if (typeof body.is_active === 'boolean') updates.status = body.is_active ? 'active' : 'inactive'
    if (typeof body.stock_quantity === 'number') updates.stock_quantity = body.stock_quantity
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })

    const { data, error: updErr } = await supabaseService
      .from('client_products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*')
      .single()
    if (updErr) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
    return NextResponse.json({ product: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

