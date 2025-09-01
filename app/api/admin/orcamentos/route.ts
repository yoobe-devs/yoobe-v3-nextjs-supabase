import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { listOrcamentosAdmin } from '@/lib/queries/orcamentos'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores' }, { status: 403 })
    }
    const items = await listOrcamentosAdmin()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error listing budgets (admin):', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


