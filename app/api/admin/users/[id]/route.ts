import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseService = createClient(supabaseUrl, serviceKey)

async function authenticateAdmin(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  let { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    const header = request.headers.get('authorization')
    if (header?.startsWith('Bearer ')) {
      const token = header.substring(7)
      const { data: { user: tokenUser } } = await supabaseService.auth.getUser(token)
      user = tokenUser || null
    }
  }
  if (!user || user.user_metadata?.role !== 'admin') {
    return { user: null, error: 'forbidden' }
  }
  return { user, error: null }
}

// DELETE - Remover usuário (admin)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user: admin, error } = await authenticateAdmin(request)
    if (error || !admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const userId = params.id
    if (!userId) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    // Apagar do auth
    const { error: derr } = await supabaseService.auth.admin.deleteUser(userId)
    if (derr) return NextResponse.json({ error: derr.message }, { status: 400 })

    // Apagar do perfil (se existir)
    await supabaseService.from('users').delete().eq('id', userId)

    // Auditoria
    try {
      await supabaseService.rpc('log_user_delete', {
        p_actor: admin.id,
        p_target: userId,
        p_details: { source: 'api_admin' }
      })
    } catch {}

    return NextResponse.json({ message: 'Usuário removido com sucesso' })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}





