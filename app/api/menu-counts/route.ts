import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache, createCacheKey } from '@/lib/cache'

type Counts = {
  employees: number
  products: number
  quotations: number
  orders: number
  updatedAt: string
}

function etagFor(obj: any) {
  try {
    const s = JSON.stringify(obj)
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return `W/"${s.length.toString(16)}-${h.toString(16)}"`
  } catch {
    return 'W/"0-0"'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const headerTenant = request.headers.get('x-tenant-id') || undefined
    const qsTenant = searchParams.get('tenant_id') || undefined

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Resolve tenant/company
    let tenantId = headerTenant || qsTenant || undefined
    if (!tenantId) {
      const { data: me } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single()
      tenantId = (me as any)?.company_id || undefined
    }
    if (!tenantId)
      return NextResponse.json({ error: 'Tenant not found' }, { status: 400 })

    const cacheKey = createCacheKey('menu-counts', tenantId)
    const cached = cache.get<Counts>(cacheKey)
    if (cached) {
      const tag = etagFor(cached)
      const ifNoneMatch = request.headers.get('if-none-match')
      if (ifNoneMatch && ifNoneMatch === tag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: tag,
            'Cache-Control': 'private, max-age=60',
          },
        })
      }
      return NextResponse.json(cached, {
        headers: {
          ETag: tag,
          'Cache-Control': 'private, max-age=60',
        },
      })
    }

    // Parallel counts with best-effort fallbacks
    const [employeesCnt, productsCnt, quotationsCnt, ordersCnt] =
      await Promise.all([
        // Employees: use users table with role funcionario/employee
        (async () => {
          try {
            const { count } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', tenantId)
              .in('role', ['funcionario', 'employee'])
            return count || 0
          } catch {
            return 0
          }
        })(),

        // Products active: prefer client_products status=active; fallback to company_products is_active=true
        (async () => {
          try {
            const { count, error } = await supabase
              .from('client_products')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', tenantId)
              .eq('status', 'active')
            if (!error) return count || 0
          } catch {}
          try {
            const { count } = await supabase
              .from('company_products')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', tenantId)
              .eq('is_active', true)
            return count || 0
          } catch {
            return 0
          }
        })(),

        // Quotations open: budgets pending (include draft if exists)
        (async () => {
          try {
            const { count } = await supabase
              .from('budgets')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', tenantId)
              .in('status', ['pending'])
            return count || 0
          } catch {
            return 0
          }
        })(),

        // Orders in progress: prefer status not in delivered/canceled
        (async () => {
          try {
            const { count } = await supabase
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', tenantId)
              .not('status', 'in', '("canceled","delivered")')
            return count || 0
          } catch {
            try {
              const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', tenantId)
                .in('status', ['pending', 'processing', 'shipped'])
              return count || 0
            } catch {
              return 0
            }
          }
        })(),
      ])

    const result: Counts = {
      employees: employeesCnt,
      products: productsCnt,
      quotations: quotationsCnt,
      orders: ordersCnt,
      updatedAt: new Date().toISOString(),
    }

    cache.set(cacheKey, result, 90 * 1000)
    return NextResponse.json(result, {
      headers: {
        ETag: etagFor(result),
        'Cache-Control': 'private, max-age=60',
      },
    })
  } catch (e) {
    console.error('menu-counts error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
