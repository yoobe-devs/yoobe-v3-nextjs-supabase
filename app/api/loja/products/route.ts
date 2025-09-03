import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const onlyUser = searchParams.get('onlyAllowedForUser') || undefined

    let query = supabase.from('client_products').select('*').eq('status', 'active')

    if (onlyUser) {
      const { data: uTags } = await supabase.from('user_tags').select('tag_id').eq('user_id', onlyUser)
      const tags = new Set((uTags || []).map((t: any) => t.tag_id))
      if (tags.size > 0) {
        const { data: pTags } = await supabase.from('product_tags').select('product_id, tag_id')
        const allowedProducts = new Set((pTags || []).filter((p: any) => tags.has(p.tag_id)).map((p: any) => p.product_id))
        if (allowedProducts.size > 0) query = query.in('id', Array.from(allowedProducts))
        else return NextResponse.json([])
      } else {
        return NextResponse.json([])
      }
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (e) { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }) }
}

