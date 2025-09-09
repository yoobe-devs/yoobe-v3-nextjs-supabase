import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

function isValidId(v: any) {
  return typeof v === 'string' && v.length >= 8
}

function applyMarginAndRounding(
  base: number,
  marginPct?: number,
  rounding?: 'none' | 'ceil-0.50' | 'ceil-1.00'
) {
  const withMargin = base * (1 + (marginPct || 0) / 100)
  if (!rounding || rounding === 'none') return withMargin
  if (rounding === 'ceil-0.50') {
    const cents = Math.ceil(withMargin * 2) / 2 // steps of 0.5
    return cents
  }
  if (rounding === 'ceil-1.00') {
    return Math.ceil(withMargin)
  }
  return withMargin
}

async function authenticate(request: NextRequest) {
  const sb = createRouteHandlerClient({ cookies })
  let {
    data: { user },
    error,
  } = await sb.auth.getUser()
  if (!user) {
    const h = request.headers.get('authorization')
    if (h?.startsWith('Bearer ')) {
      const tok = h.substring(7)
      const info = await service.auth.getUser(tok)
      user = info.data.user || null
      error = info.error || null
    }
  }
  return { user, error }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string; baseProductId: string } }
) {
  try {
    const { user, error } = await authenticate(request)
    if (error || !user)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const clientId = params.clientId
    const baseProductId = params.baseProductId
    if (!isValidId(clientId) || !isValidId(baseProductId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const marginPct = typeof body?.margin_pct === 'number' ? body.margin_pct : 0
    const rounding: 'none' | 'ceil-0.50' | 'ceil-1.00' =
      body?.rounding_rule || 'none'
    const copyImages = !!body?.copy_images

    // Confirm client exists
    const { data: client } = await service
      .from('companies')
      .select('id,name')
      .eq('id', clientId)
      .single()
    if (!client)
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )

    // Load base product
    const { data: base } = await service
      .from('base_products')
      .select(
        'id,name,description,base_price,base_points_cost,category_id,image_url'
      )
      .eq('id', baseProductId)
      .eq('status', 'active')
      .single()
    if (!base)
      return NextResponse.json(
        { error: 'Produto base não encontrado' },
        { status: 404 }
      )

    // Check existing
    const { data: exists } = await service
      .from('client_products')
      .select('id')
      .eq('client_id', clientId)
      .eq('base_product_id', base.id)
      .maybeSingle()
    if (exists)
      return NextResponse.json(
        { error: 'Produto já replicado para este cliente' },
        { status: 409 }
      )

    const price = applyMarginAndRounding(
      base.base_price || 0,
      marginPct,
      rounding
    )
    const points = Math.round(base.base_points_cost || 0)

    const insert: any = {
      client_id: clientId,
      base_product_id: base.id,
      name: base.name,
      description: base.description,
      price,
      status: 'active',
      stock_quantity: 0,
      margin_pct: marginPct,
      final_sku: `${base.id.slice(0, 8)}-${clientId.slice(0, 8)}`,
      ean_13: null,
    }

    // Tentar inserir
    let created: any = null
    let insErr: any = null
    try {
      const resp = await service
        .from('client_products')
        .insert(insert)
        .select('*')
        .single()
      created = resp.data
      insErr = resp.error || null
    } catch (e: any) {
      insErr = e
    }

    if (insErr) {
      console.error('replicate-product insert error', insErr)
      return NextResponse.json(
        { error: `Falha ao replicar produto: ${insErr.message || insErr}` },
        { status: 500 }
      )
    }
    return NextResponse.json({ message: 'Produto replicado', product: created })
  } catch (e) {
    console.error('replicate-product error', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
