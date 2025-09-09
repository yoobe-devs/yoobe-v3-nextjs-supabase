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
  if (rounding === 'ceil-0.50') return Math.ceil(withMargin * 2) / 2
  if (rounding === 'ceil-1.00') return Math.ceil(withMargin)
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
  { params }: { params: { clientId: string } }
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
    if (!isValidId(clientId))
      return NextResponse.json({ error: 'ClientId inválido' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const ids: string[] = Array.isArray(body?.base_product_ids)
      ? body.base_product_ids
      : []
    const marginPct = typeof body?.margin_pct === 'number' ? body.margin_pct : 0
    const rounding: 'none' | 'ceil-0.50' | 'ceil-1.00' =
      body?.rounding_rule || 'none'
    const copyImages = !!body?.copy_images
    if (!ids.length)
      return NextResponse.json(
        { error: 'base_product_ids vazio' },
        { status: 400 }
      )

    // Load base products
    const { data: list } = await service
      .from('base_products')
      .select(
        'id,name,description,base_price,base_points_cost,category_id,image_url'
      )
      .in('id', ids)
    const byId = new Map((list || []).map((p: any) => [p.id, p]))

    let created = 0,
      existed = 0,
      errors: any[] = []
    for (const id of ids) {
      const base = byId.get(id)
      if (!base) {
        errors.push({ id, error: 'not_found' })
        continue
      }
      const { data: exists } = await service
        .from('client_products')
        .select('id')
        .eq('client_id', clientId)
        .eq('base_product_id', id)
        .maybeSingle()
      if (exists) {
        existed++
        continue
      }
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

      let insErr: any = null
      try {
        const r = await service.from('client_products').insert(insert)
        insErr = r.error || null
      } catch (e: any) {
        insErr = e
      }

      if (insErr) {
        errors.push({ id, error: insErr.message || String(insErr) })
        continue
      }
      created++
    }

    return NextResponse.json({
      success: true,
      summary: { created, existed, failed: errors.length },
      errors,
    })
  } catch (e) {
    console.error('replicate-products error', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
