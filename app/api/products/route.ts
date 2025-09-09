import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { validateUserData } from '@/lib/validation/mock-data'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      store_id,
      name,
      description,
      price,
      points_cost,
      stock_quantity,
      category_id,
      image_url,
      status,
    } = body

    // Validar dados mockados
    const mockValidation = validateUserData({
      name: name,
      id: body.id,
    })

    if (!mockValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Dados mockados detectados',
          details: mockValidation.errors,
        },
        { status: 400 }
      )
    }

    if (!store_id || !name || price === undefined) {
      return NextResponse.json(
        { error: 'store_id, name e price são obrigatórios' },
        { status: 400 }
      )
    }

    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('company_id')
      .eq('id', store_id)
      .single()
    if (storeErr || !store)
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )

    const insertData: any = {
      client_id: store.company_id,
      base_product_id: null,
      name,
      description: description || null,
      price: parseFloat(price),
      points_cost: points_cost ? parseInt(points_cost) : 0,
      category_id: category_id || null,
      image_url: image_url || null,
      is_active: status ? status === 'active' : true,
      status: status || 'active',
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
      updated_at: new Date().toISOString(),
    }

    const { data: product, error: insErr } = await supabase
      .from('client_products')
      .insert(insertData)
      .select('*')
      .single()
    if (insErr) {
      return NextResponse.json(
        { error: 'Erro ao criar produto', details: insErr.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (e) {
    console.error('Erro ao criar produto:', e)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
