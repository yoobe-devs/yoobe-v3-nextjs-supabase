import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: baseProducts, error } = await supabase
      .from('base_products')
      .select(`
        *,
        product_categories (
          id,
          name,
          description,
          icon,
          color
        )
      `)
      .order('name')

    if (error) {
      console.error('Erro ao buscar produtos-base:', error)
      return NextResponse.json({ error: 'Erro ao buscar produtos-base' }, { status: 500 })
    }

    return NextResponse.json(baseProducts)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function ean13FromSku(sku: string): string {
  const digits = (sku || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .split('')
    .map(ch => {
      if (/\d/.test(ch)) return parseInt(ch)
      // Map letters A-Z to 10-35 then mod 10
      return ((ch.charCodeAt(0) - 55) % 10)
    })
  // Build 12 digits
  const base: number[] = []
  for (let i = 0; i < 12; i++) base[i] = digits[i % digits.length] ?? 0
  // Compute check digit
  const sum = base.reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0)
  const check = (10 - (sum % 10)) % 10
  return base.join('') + String(check)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { name, description, category_id, base_price, base_points_cost, image_url, specifications, gallery } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('base_products')
      .insert({
        name,
        description,
        category_id,
        base_price: base_price || 0,
        base_points_cost: base_points_cost || 0,
        image_url,
        specifications: {
          ...(specifications || {}),
          ean13: ean13FromSku(specifications?.sku || '')
        },
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar produto-base:', error)
      return NextResponse.json({ error: 'Erro ao criar produto-base' }, { status: 500 })
    }

    // Inserir galeria de imagens (até 6)
    if (Array.isArray(gallery) && gallery.length) {
      const trimmed = gallery.slice(0, 6)
      const rows = trimmed.map((url: string, idx: number) => ({
        base_product_id: (data as any).id,
        image_url: url,
        is_cover: idx === 0,
        sort_order: idx + 1,
      }))
      await supabase.from('base_product_images').insert(rows)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
