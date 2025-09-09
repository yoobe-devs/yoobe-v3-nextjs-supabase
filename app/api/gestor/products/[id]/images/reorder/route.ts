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
    const items = Array.isArray(body) ? body : body?.items
    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'Lista inválida' }, { status: 400 })

    for (const it of items) {
      if (!it?.imageId) continue
      await supabaseService
        .from('client_product_images')
        .update({ sort_order: it.sort_order ?? 0 })
        .eq('id', it.imageId)
        .eq('client_product_id', params.id)
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

