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

  if (!storeId)
    return NextResponse.json({ error: 'store_id required' }, { status: 400 })

  try {
    const { data: analytics, error } = await service
      .from('analytics_daily_company')
      .select('*')
      .eq('store_id', storeId)
      .gte('date', from)
      .lte('date', to)

    if (error) throw error

    // Calcular funil de conversão
    const totalViews =
      analytics?.reduce((sum, day) => sum + (day.product_views || 0), 0) || 0
    const totalAddToCart =
      analytics?.reduce((sum, day) => sum + (day.add_to_cart || 0), 0) || 0
    const totalCheckout =
      analytics?.reduce((sum, day) => sum + (day.checkout_start || 0), 0) || 0
    const totalRedeem =
      analytics?.reduce((sum, day) => sum + (day.redeem_complete || 0), 0) || 0

    // Calcular taxas de conversão
    const addToCartRate =
      totalViews > 0 ? Math.round((totalAddToCart / totalViews) * 100) : 0
    const checkoutRate =
      totalAddToCart > 0
        ? Math.round((totalCheckout / totalAddToCart) * 100)
        : 0
    const redeemRate =
      totalCheckout > 0 ? Math.round((totalRedeem / totalCheckout) * 100) : 0

    const funnelData = [
      {
        name: 'Visualizações',
        value: totalViews,
        percentage: 100,
        color: '#8884d8',
      },
      {
        name: 'Adicionar ao Carrinho',
        value: totalAddToCart,
        percentage: addToCartRate,
        color: '#82ca9d',
      },
      {
        name: 'Iniciar Checkout',
        value: totalCheckout,
        percentage: checkoutRate,
        color: '#ffc658',
      },
      {
        name: 'Resgate Completo',
        value: totalRedeem,
        percentage: redeemRate,
        color: '#ff7300',
      },
    ]

    // Análise de abandono
    const abandonmentAnalysis = {
      cartAbandonment:
        totalAddToCart > 0
          ? Math.round(
              ((totalAddToCart - totalCheckout) / totalAddToCart) * 100
            )
          : 0,
      checkoutAbandonment:
        totalCheckout > 0
          ? Math.round(((totalCheckout - totalRedeem) / totalCheckout) * 100)
          : 0,
      overallConversion:
        totalViews > 0 ? Math.round((totalRedeem / totalViews) * 100) : 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        funnel: funnelData,
        abandonment: abandonmentAnalysis,
        period: { from, to },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
