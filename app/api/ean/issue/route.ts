import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores' }, { status: 403 })
    }

    const { data, error } = await supabase.rpc('generate_ean13')
    if (error) throw error
    return NextResponse.json({ ean_13: data })
  } catch (error) {
    console.error('Error issuing EAN:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


