import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateClientProductPrice } from '@/lib/queries/client-products'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string, id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    const userCompanyId = user.user_metadata?.company_id
    if (userRole === 'manager' && userCompanyId !== params.clientId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const qtyParam = searchParams.get('qty')
    const qty = Math.max(1, Number(qtyParam || 1))

    const result = await calculateClientProductPrice(params.id, qty)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating client product price:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


