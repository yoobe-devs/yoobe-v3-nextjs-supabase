import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const skus = searchParams.getAll('skus[]').map(s => s.trim().toUpperCase()).filter(Boolean)
    if (!skus.length) return NextResponse.json({ exists: [] })

    const { data, error: err } = await supabase
      .from('base_products')
      .select('specifications')
      .in('specifications->>sku', skus)

    if (err) return NextResponse.json({ error: 'Erro ao consultar' }, { status: 500 })
    const existsSet = new Set<string>()
    for (const row of data || []) {
      const sku = String((row as any)?.specifications?.sku || '').toUpperCase()
      if (sku) existsSet.add(sku)
    }
    const exists = skus.filter(s => existsSet.has(s))
    return NextResponse.json({ exists })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

