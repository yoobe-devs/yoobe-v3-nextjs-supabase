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
  const metric = searchParams.get('metric') || 'all'

  if (!storeId)
    return NextResponse.json({ error: 'store_id required' }, { status: 400 })

  try {
    const { data: analytics, error } = await service
      .from('analytics_daily_company')
      .select('*')
      .eq('store_id', storeId)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true })

    if (error) throw error

    // Formatar dados para gráfico
    const timeseriesData =
      analytics?.map(day => ({
        date: day.date,
        activeUsers: day.active_users || 0,
        productViews: day.product_views || 0,
        addToCart: day.add_to_cart || 0,
        checkoutStart: day.checkout_start || 0,
        redeemComplete: day.redeem_complete || 0,
        saveForLater: day.save_for_later || 0,
      })) || []

    // Calcular métricas agregadas por período
    const weeklyData = []
    const monthlyData = []

    if (timeseriesData.length > 0) {
      // Agrupar por semana
      const weeks = new Map()
      timeseriesData.forEach(day => {
        const weekStart = new Date(day.date)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]

        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, {
            week: weekKey,
            activeUsers: 0,
            productViews: 0,
            addToCart: 0,
            checkoutStart: 0,
            redeemComplete: 0,
            saveForLater: 0,
          })
        }

        const week = weeks.get(weekKey)
        week.activeUsers += day.activeUsers
        week.productViews += day.productViews
        week.addToCart += day.addToCart
        week.checkoutStart += day.checkoutStart
        week.redeemComplete += day.redeemComplete
        week.saveForLater += day.saveForLater
      })

      weeklyData.push(...Array.from(weeks.values()))
    }

    return NextResponse.json({
      success: true,
      data: {
        daily: timeseriesData,
        weekly: weeklyData,
        monthly: monthlyData,
        period: { from, to },
        metric,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
