import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { approveOrcamento, convertToPurchaseOrder } from '@/lib/queries/orcamentos'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas administradores' }, { status: 403 })
    }

    const approved = await approveOrcamento(params.id, user.id)
    const po = await convertToPurchaseOrder(params.id, user.id)
    return NextResponse.json({ approved, purchase_order: po })
  } catch (error) {
    console.error('Error approving budget:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


