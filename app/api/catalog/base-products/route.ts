import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache, createCacheKey } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const tag = searchParams.get('tag') || ''
    const minPrice = Number(searchParams.get('minPrice') || '0')
    const maxPrice = Number(searchParams.get('maxPrice') || '0')
    const hasPoints =
      searchParams.get('hasPoints') === '1' ||
      searchParams.get('hasPoints') === 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      48,
      Math.max(1, parseInt(searchParams.get('pageSize') || '24'))
    )
    const sort = searchParams.get('sort') || 'relevance'

    const cacheKey = createCacheKey(
      'catalog-base',
      q,
      minPrice,
      maxPrice,
      hasPoints ? '1' : '0',
      page,
      pageSize,
      sort
    )
    const cached = cache.get<any>(cacheKey)
    if (cached)
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'private, max-age=60' },
      })

    // Build query on base_products; only active
    let query = supabase
      .from('base_products')
      .select(
        'id, name, description, base_price, base_points_cost, image_url, status, created_at',
        { count: 'exact' }
      )
      .eq('status', 'active')

    if (q) {
      // try name and sku if it exists
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
    }
    if (minPrice > 0) query = query.gte('base_price', minPrice)
    if (maxPrice > 0) query = query.lte('base_price', maxPrice)
    if (hasPoints) query = query.gt('base_points_cost', 0)

    // Optional filter by category (id or name)
    if (category) {
      const isUuid = /^[0-9a-fA-F-]{36}$/.test(category)
      let categoryId: string | null = null
      if (isUuid) {
        categoryId = category
      } else {
        const { data: cat } = await supabase
          .from('product_categories')
          .select('id')
          .ilike('name', category)
          .single()
        categoryId = (cat as any)?.id || null
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      } else {
        // No category found → return empty page quickly
        const res = { items: [], page, pageSize, total: 0 }
        cache.set(cacheKey, res, 60 * 1000)
        return NextResponse.json(res, {
          headers: { 'Cache-Control': 'private, max-age=60' },
        })
      }
    }

    // Optional filter by tag (best-effort: tags array or fallback to name/description search)
    if (tag) {
      try {
        // If a tags[] column exists
        // @ts-expect-error - tags column may not exist in all schemas
        query = query.contains('tags', [tag])
      } catch {
        // Fallback: widen search to include tag term
        if (q) {
          // already has q filter; nothing extra
        } else {
          query = query.or(`name.ilike.%${tag}%,description.ilike.%${tag}%`)
        }
      }
    }

    switch (sort) {
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'price_asc':
        query = query.order('base_price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('base_price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('name', { ascending: true })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await query.range(from, to)
    if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })

    const items = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: (p.name || '').toLowerCase().replace(/\s+/g, '-'),
      thumbnail: p.image_url || null,
      badges: [],
      priceFrom: p.base_price ?? null,
      pointsFrom: p.base_points_cost ?? null,
      hasVariants: false,
      short: p.description || null,
      tags: [],
    }))

    const res = { items, page, pageSize, total: count || 0 }
    cache.set(cacheKey, res, 60 * 1000)
    return NextResponse.json(res, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    })
  } catch (e) {
    console.error('catalog list error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
