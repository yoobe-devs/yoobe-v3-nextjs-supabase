import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params.id
    const { data, error } = await supabase
      .from('base_products')
      .select('id, name, description, base_price, base_points_cost, image_url, specifications')
      .eq('id', id)
      .single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const detail = {
      id: data.id,
      name: data.name,
      slug: (data.name || '').toLowerCase().replace(/\s+/g, '-'),
      thumbnail: data.image_url || null,
      badges: [],
      priceFrom: data.base_price ?? null,
      pointsFrom: data.base_points_cost ?? null,
      hasVariants: false,
      short: data.description || null,
      tags: [],
      images: data.image_url ? [data.image_url] : [],
      specs: data.specifications ? Object.entries(data.specifications).map(([key, value]) => ({ key, value })) : [],
      variants: [],
      description_long: data.description || null,
    }
    return NextResponse.json({ item: detail })
  } catch (e) {
    console.error('catalog detail error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

