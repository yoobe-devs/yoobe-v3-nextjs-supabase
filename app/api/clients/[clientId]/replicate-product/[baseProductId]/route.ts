import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

type RoundingRule = 'none' | 'ceil-0.50' | 'ceil-1.00'

function applyRounding(value: number, rule: RoundingRule): number {
  if (rule === 'none') return Number(value.toFixed(2))
  if (rule === 'ceil-0.50') {
    const cents = Math.ceil(value * 2) / 2
    return Number(cents.toFixed(2))
  }
  if (rule === 'ceil-1.00') {
    const whole = Math.ceil(value)
    return Number(whole.toFixed(2))
  }
  return Number(value.toFixed(2))
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string, baseProductId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas admin pode replicar' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const margin_pct = typeof body?.margin_pct === 'number' ? body.margin_pct : 0
    const rounding_rule: RoundingRule = (body?.rounding_rule as RoundingRule) || 'none'
    const copyImages: boolean = Boolean(body?.copy_images)

    // Buscar produto base
    const { data: base, error: baseErr } = await supabase
      .from('base_products')
      .select('*')
      .eq('id', params.baseProductId)
      .single()
    if (baseErr || !base) return NextResponse.json({ error: 'Produto base não encontrado' }, { status: 404 })

    const computedPrice = applyRounding(base.base_price * (1 + margin_pct / 100), rounding_rule)

    // Criar client_product
    const { data: clientProduct, error: cpErr } = await supabase
      .from('client_products')
      .insert({
        client_id: params.clientId,
        base_product_id: params.baseProductId,
        name: base.name,
        description: base.description,
        price: computedPrice,
        status: 'active',
        stock_quantity: 0,
        margin_pct,
      })
      .select('*')
      .single()
    if (cpErr || !clientProduct) {
      return NextResponse.json({ error: 'Falha ao criar produto do cliente' }, { status: 500 })
    }

    // Replicar faixas de preço
    const { data: tiers } = await supabase
      .from('base_pricing_tiers')
      .select('*')
      .eq('base_product_id', params.baseProductId)
      .order('min_qty', { ascending: true })
    if (tiers && tiers.length) {
      const mapped = tiers.map(t => ({
        client_product_id: clientProduct.id,
        min_qty: t.min_qty,
        unit_price: t.unit_price ? applyRounding(t.unit_price * (1 + margin_pct / 100), rounding_rule) : null,
        discount_pct: t.discount_pct ?? null,
      }))
      await supabase.from('client_pricing_tiers').insert(mapped)
    }

    // Copiar imagens (opcional)
    if (copyImages) {
      const { data: images } = await supabase
        .from('base_product_images')
        .select('*')
        .eq('base_product_id', params.baseProductId)
        .order('sort_order', { ascending: true })
      if (images && images.length) {
        const mappedImgs = images.map(img => ({
          client_product_id: clientProduct.id,
          image_url: img.image_url,
          bucket_key: img.bucket_key,
          is_cover: img.is_cover,
          sort_order: img.sort_order,
        }))
        await supabase.from('client_product_images').insert(mappedImgs)
      }
    }

    return NextResponse.json(clientProduct, { status: 201 })
  } catch (error) {
    console.error('Error replicating product:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


