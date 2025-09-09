import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('store_id') || ''

  if (!storeId) {
    return new Response('store_id required', { status: 400 })
  }

  // Configurar Server-Sent Events
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Enviar dados iniciais
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Enviar heartbeat a cada 30 segundos
      const heartbeat = setInterval(() => {
        sendData({ type: 'heartbeat', timestamp: Date.now() })
      }, 30000)

      // Função para buscar dados em tempo real
      const fetchRealtimeData = async () => {
        try {
          // Buscar eventos recentes (últimos 5 minutos)
          const fiveMinutesAgo = new Date(
            Date.now() - 5 * 60 * 1000
          ).toISOString()

          const { data: recentEvents, error } = await service
            .from('employee_events')
            .select(
              `
              id,
              type,
              created_at,
              users!inner(email, user_metadata),
              base_products(name)
            `
            )
            .eq('store_id', storeId)
            .gte('created_at', fiveMinutesAgo)
            .order('created_at', { ascending: false })
            .limit(10)

          if (error) throw error

          // Buscar KPIs atuais
          const { data: currentAnalytics } = await service
            .from('analytics_daily_company')
            .select('*')
            .eq('store_id', storeId)
            .eq('date', new Date().toISOString().split('T')[0])

          // Buscar aprovações pendentes
          const { data: pendingApprovals } = await service
            .from('approvals')
            .select('count')
            .eq('status', 'pending')

          // Enviar dados atualizados
          sendData({
            type: 'analytics_update',
            data: {
              recentEvents:
                recentEvents?.map(event => ({
                  id: event.id,
                  type: event.type,
                  userName:
                    event.users?.user_metadata?.name ||
                    event.users?.email ||
                    'Usuário',
                  productName: event.base_products?.name,
                  createdAt: event.created_at,
                })) || [],
              currentKPIs: {
                activeUsers: currentAnalytics?.[0]?.active_users || 0,
                productViews: currentAnalytics?.[0]?.product_views || 0,
                redeemComplete: currentAnalytics?.[0]?.redeem_complete || 0,
                pendingApprovals: pendingApprovals?.[0]?.count || 0,
              },
              timestamp: Date.now(),
            },
          })
        } catch (error) {
          console.error('Erro ao buscar dados em tempo real:', error)
          sendData({
            type: 'error',
            message: 'Erro ao buscar dados atualizados',
          })
        }
      }

      // Buscar dados iniciais
      fetchRealtimeData()

      // Buscar dados atualizados a cada 10 segundos
      const interval = setInterval(fetchRealtimeData, 10000)

      // Cleanup
      return () => {
        clearInterval(heartbeat)
        clearInterval(interval)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}
