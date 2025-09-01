import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { 
  getClientProducts, 
  createClientProduct,
  type ClientProductCreateInput 
} from '@/lib/queries/client-products'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
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

    const products = await getClientProducts(params.clientId)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching client products:', error)
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
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

    const body = await request.json()
    const payload: ClientProductCreateInput = {
      ...body,
      client_id: params.clientId,
    }
    if (!payload.base_product_id) {
      return NextResponse.json({ error: 'base_product_id é obrigatório' }, { status: 400 })
    }

    const created = await createClientProduct(payload)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating client product:', error)
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}


