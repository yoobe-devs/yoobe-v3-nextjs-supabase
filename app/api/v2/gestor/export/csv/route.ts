import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('store_id') || ''
  const type = searchParams.get('type') || 'analytics' // analytics, events, funnel
  const from =
    searchParams.get('from') ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const to = searchParams.get('to') || new Date().toISOString()

  if (!storeId)
    return NextResponse.json({ error: 'store_id required' }, { status: 400 })

  try {
    let csvData = ''
    let filename = ''

    if (type === 'analytics') {
      // Exportar dados de analytics diários
      const { data: analytics, error } = await service
        .from('analytics_daily_company')
        .select('*')
        .eq('store_id', storeId)
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: true })

      if (error) throw error

      // Cabeçalho CSV
      csvData =
        'Data,Usuários Ativos,Visualizações,Adicionar ao Carrinho,Iniciar Checkout,Resgate Completo,Salvar para Depois\n'

      // Dados CSV
      analytics?.forEach(day => {
        csvData += `${day.date},${day.active_users || 0},${day.product_views || 0},${day.add_to_cart || 0},${day.checkout_start || 0},${day.redeem_complete || 0},${day.save_for_later || 0}\n`
      })

      filename = `analytics_${storeId}_${from.split('T')[0]}_${to.split('T')[0]}.csv`
    } else if (type === 'events') {
      // Exportar eventos detalhados
      const { data: events, error } = await service
        .from('employee_events')
        .select(
          `
          type,
          created_at,
          meta,
          users!inner(email, user_metadata),
          base_products(name)
        `
        )
        .eq('store_id', storeId)
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Cabeçalho CSV
      csvData = 'Data/Hora,Tipo de Evento,Usuário,Produto,Meta\n'

      // Dados CSV
      events?.forEach(event => {
        const userName =
          event.users?.user_metadata?.name || event.users?.email || 'Usuário'
        const productName = event.base_products?.name || ''
        const meta = JSON.stringify(event.meta || {})

        csvData += `${event.created_at},${event.type},${userName},${productName},"${meta}"\n`
      })

      filename = `events_${storeId}_${from.split('T')[0]}_${to.split('T')[0]}.csv`
    } else if (type === 'funnel') {
      // Exportar dados do funil
      const { data: analytics, error } = await service
        .from('analytics_daily_company')
        .select('*')
        .eq('store_id', storeId)
        .gte('date', from)
        .lte('date', to)

      if (error) throw error

      const totalViews =
        analytics?.reduce((sum, day) => sum + (day.product_views || 0), 0) || 0
      const totalAddToCart =
        analytics?.reduce((sum, day) => sum + (day.add_to_cart || 0), 0) || 0
      const totalCheckout =
        analytics?.reduce((sum, day) => sum + (day.checkout_start || 0), 0) || 0
      const totalRedeem =
        analytics?.reduce((sum, day) => sum + (day.redeem_complete || 0), 0) ||
        0

      csvData = 'Etapa,Quantidade,Taxa de Conversão\n'
      csvData += `Visualizações,${totalViews},100%\n`
      csvData += `Adicionar ao Carrinho,${totalAddToCart},${totalViews > 0 ? Math.round((totalAddToCart / totalViews) * 100) : 0}%\n`
      csvData += `Iniciar Checkout,${totalCheckout},${totalAddToCart > 0 ? Math.round((totalCheckout / totalAddToCart) * 100) : 0}%\n`
      csvData += `Resgate Completo,${totalRedeem},${totalCheckout > 0 ? Math.round((totalRedeem / totalCheckout) * 100) : 0}%\n`

      filename = `funnel_${storeId}_${from.split('T')[0]}_${to.split('T')[0]}.csv`
    }

    // Retornar CSV como resposta
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
