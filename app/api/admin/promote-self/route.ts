import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseServiceKey as supabaseService } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Indisponível em produção' }, { status: 403 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Atualiza metadata no auth e linha na tabela public.users
    await supabaseService.auth.admin.updateUserById(user.id, {
      user_metadata: { ...(user.user_metadata || {}), role: 'superadmin' },
    })

    await supabaseService
      .from('users')
      .update({ role: 'superadmin', status: 'active' })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 })
  }
}

