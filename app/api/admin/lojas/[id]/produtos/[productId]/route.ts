import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

async function authenticate(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, role: null, companyId: null }
  }
  const role = (user.user_metadata as any)?.role
  const companyId = (user.user_metadata as any)?.company_id
  return { user, role, companyId }
}

async function getStoreCompanyId(storeId: string) {
  const { data, error } = await service
    .from('stores')
    .select('id, company_id')
    .eq('id', storeId)
    .single()
  if (error || !data) return null
  return data.company_id as string
}

function isAllowedRole(role: string | undefined | null) {
  return (
    role === 'manager' ||
    role === 'gestor' ||
    role === 'admin' ||
    role === 'admin_global' ||
    role === 'superadmin'
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { user, role, companyId: userCompanyId } = await authenticate(request)
    if (!user || !isAllowedRole(role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const storeId = params.id
    const productId = params.productId

    const storeCompanyId = await getStoreCompanyId(storeId)
    if (!storeCompanyId) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Managers/gestores only within their own company
    if (
      (role === 'manager' || role === 'gestor') &&
      userCompanyId !== storeCompanyId
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const allowed = [
      'name',
      'description',
      'price',
      'points_cost',
      'stock_quantity',
      'image_url',
      'status',
    ]
    const updates: Record<string, any> = {}
    for (const k of allowed) {
      if (k in body) updates[k] = body[k]
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Nada para atualizar' },
        { status: 400 }
      )
    }
    updates.updated_at = new Date().toISOString()

    // Ensure product belongs to the same company as the store
    const { data: existing, error: exErr } = await service
      .from('client_products')
      .select('id, client_id')
      .eq('id', productId)
      .eq('client_id', storeCompanyId)
      .single()
    if (exErr || !existing) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const { data: updated, error: updErr } = await service
      .from('client_products')
      .update(updates)
      .eq('id', productId)
      .eq('client_id', storeCompanyId)
      .select('*')
      .single()
    if (updErr) {
      console.error('Erro ao atualizar produto:', updErr)
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (e) {
    console.error('PATCH loja produto error:', e)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { user, role, companyId: userCompanyId } = await authenticate(request)
    if (!user || !isAllowedRole(role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const storeId = params.id
    const productId = params.productId

    const storeCompanyId = await getStoreCompanyId(storeId)
    if (!storeCompanyId) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    if (
      (role === 'manager' || role === 'gestor') &&
      userCompanyId !== storeCompanyId
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { data: existing, error: exErr } = await service
      .from('client_products')
      .select('id')
      .eq('id', productId)
      .eq('client_id', storeCompanyId)
      .single()
    if (exErr || !existing) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const { error: delErr } = await service
      .from('client_products')
      .delete()
      .eq('id', productId)
      .eq('client_id', storeCompanyId)
    if (delErr) {
      console.error('Erro ao excluir produto:', delErr)
      return NextResponse.json(
        { error: 'Erro ao excluir produto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE loja produto error:', e)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
