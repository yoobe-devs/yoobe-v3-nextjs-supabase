import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('store_id') || ''
  const from =
    searchParams.get('from') ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const to = searchParams.get('to') || new Date().toISOString()
  const dept = searchParams.get('dept') || ''
  const tag = searchParams.get('tag') || ''

  if (!storeId)
    return NextResponse.json({ error: 'store_id required' }, { status: 400 })

  try {
    // KPIs principais
    const { data: analytics, error } = await service
      .from('analytics_daily_company')
      .select('*')
      .eq('store_id', storeId)
      .gte('date', from)
      .lte('date', to)

    if (error) throw error

    // Calcular métricas agregadas
    const totalActiveUsers =
      analytics?.reduce((sum, day) => sum + (day.active_users || 0), 0) || 0
    const totalRedeems =
      analytics?.reduce((sum, day) => sum + (day.redeem_complete || 0), 0) || 0
    const totalViews =
      analytics?.reduce((sum, day) => sum + (day.product_views || 0), 0) || 0
    const totalAddToCart =
      analytics?.reduce((sum, day) => sum + (day.add_to_cart || 0), 0) || 0
    const totalCheckout =
      analytics?.reduce((sum, day) => sum + (day.checkout_start || 0), 0) || 0

    // Taxa de engajamento
    const engagementRate =
      totalActiveUsers > 0
        ? Math.round((totalRedeems / totalActiveUsers) * 100)
        : 0

    // Aprovações pendentes
    const { data: pendingApprovals } = await service
      .from('approvals')
      .select('count')
      .eq('status', 'pending')

    // Estoque baixo (integração com inventário)
    const { data: lowStock } = await service
      .from('client_products')
      .select('id, store_inventory(*)')
      .eq('client_id', storeId)

    const lowStockCount =
      lowStock?.filter(p => {
        const inv = p.store_inventory?.[0] || {}
        const available = Math.max(
          (inv.physical_qty || 0) +
            (inv.virtual_qty || 0) -
            (inv.reserved_qty || 0),
          0
        )
        return available < (inv.low_stock_threshold || 5)
      }).length || 0

    // Dados para período anterior (comparação)
    const prevFrom = new Date(
      new Date(from).getTime() -
        (new Date(to).getTime() - new Date(from).getTime())
    ).toISOString()
    const prevTo = from

    const { data: prevAnalytics } = await service
      .from('analytics_daily_company')
      .select('*')
      .eq('store_id', storeId)
      .gte('date', prevFrom)
      .lte('date', prevTo)

    const prevTotalActiveUsers =
      prevAnalytics?.reduce((sum, day) => sum + (day.active_users || 0), 0) || 0
    const prevTotalRedeems =
      prevAnalytics?.reduce(
        (sum, day) => sum + (day.redeem_complete || 0),
        0
      ) || 0

    // Calcular deltas
    const activeUsersDelta =
      prevTotalActiveUsers > 0
        ? Math.round(
            ((totalActiveUsers - prevTotalActiveUsers) / prevTotalActiveUsers) *
              100
          )
        : 0
    const redeemsDelta =
      prevTotalRedeems > 0
        ? Math.round(
            ((totalRedeems - prevTotalRedeems) / prevTotalRedeems) * 100
          )
        : 0

    return NextResponse.json({
      success: true,
      data: {
        activeUsers7d: totalActiveUsers,
        activeUsers30d: totalActiveUsers,
        totalRedeems: totalRedeems,
        totalViews: totalViews,
        totalAddToCart: totalAddToCart,
        totalCheckout: totalCheckout,
        engagementRate: engagementRate,
        pendingApprovals: pendingApprovals?.[0]?.count || 0,
        lowStockItems: lowStockCount,
        deltas: {
          activeUsers: activeUsersDelta,
          redeems: redeemsDelta,
          engagement: engagementRate > 0 ? Math.round(engagementRate * 0.1) : 0,
        },
        period: { from, to },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
