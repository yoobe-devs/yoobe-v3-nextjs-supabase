import { NextRequest } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const companyId = searchParams.get('company_id')

    // Configurar headers para Server-Sent Events
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    })

    const stream = new ReadableStream({
      start(controller) {
        // Enviar evento de conexão estabelecida
        const connectMessage = `data: ${JSON.stringify({
          type: 'connected',
          message: 'Conexão estabelecida',
          timestamp: new Date().toISOString(),
        })}\n\n`
        controller.enqueue(new TextEncoder().encode(connectMessage))

        // Configurar listener para mudanças na tabela de notificações
        const channel = supabaseService
          .channel('notifications_stream')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: buildFilter(authResult.user, userId, companyId),
            },
            async payload => {
              try {
                // Buscar dados completos da notificação
                const { data: notification, error } = await supabaseService
                  .from('notifications')
                  .select(
                    `
                    id,
                    type,
                    title,
                    message,
                    data,
                    priority,
                    read,
                    created_at,
                    user_id,
                    company_id,
                    budget_id,
                    order_id,
                    users (
                      id,
                      name,
                      email
                    ),
                    companies (
                      id,
                      name
                    )
                  `
                  )
                  .eq('id', payload.new.id)
                  .single()

                if (notification && !error) {
                  const message = `data: ${JSON.stringify({
                    type: 'notification',
                    data: notification,
                    timestamp: new Date().toISOString(),
                  })}\n\n`
                  controller.enqueue(new TextEncoder().encode(message))
                }
              } catch (err) {
                console.error(
                  'Erro ao processar notificação em tempo real:',
                  err
                )
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: buildFilter(authResult.user, userId, companyId),
            },
            payload => {
              const message = `data: ${JSON.stringify({
                type: 'notification_updated',
                data: payload.new,
                timestamp: new Date().toISOString(),
              })}\n\n`
              controller.enqueue(new TextEncoder().encode(message))
            }
          )
          .subscribe()

        // Enviar heartbeat a cada 30 segundos
        const heartbeatInterval = setInterval(() => {
          const heartbeatMessage = `data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          })}\n\n`
          controller.enqueue(new TextEncoder().encode(heartbeatMessage))
        }, 30000)

        // Cleanup quando a conexão for fechada
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval)
          supabaseService.removeChannel(channel)
          controller.close()
        })
      },
    })

    return new Response(stream, { headers })
  } catch (error) {
    console.error('Erro no stream de notificações:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

function buildFilter(
  user: any,
  userId?: string | null,
  companyId?: string | null
) {
  let filter = ''

  // Filtros baseados no role do usuário
  if (user.role === 'manager' || user.role === 'gestor') {
    filter = `company_id=eq.${user.company_id}`
  } else if (user.role === 'admin') {
    filter = `company_id=eq.${user.company_id}`
  }

  // Filtros adicionais
  if (userId) {
    const userFilter = `user_id=eq.${userId}`
    filter = filter ? `${filter}&${userFilter}` : userFilter
  }

  if (companyId) {
    const companyFilter = `company_id=eq.${companyId}`
    filter = filter ? `${filter}&${companyFilter}` : companyFilter
  }

  return filter
}

