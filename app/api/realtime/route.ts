import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Cache de conexões ativas para evitar múltiplas conexões
const activeConnections = new Map<string, any>()

// Função para verificar autenticação otimizada
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        const {
          data: { user: tokenUser },
          error: tokenError,
        } = await supabaseService.auth.getUser(token)

        if (!tokenError && tokenUser) {
          user = tokenUser
          authError = null
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }
  }

  return { user, error: authError }
}

// GET - Iniciar conexão Server-Sent Events otimizada
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (
      !['manager', 'gestor', 'admin', 'admin_global', 'superadmin'].includes(
        userRole
      )
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const userId = user.id
    const connectionId = `${userId}-${Date.now()}`

    // Criar stream de Server-Sent Events otimizada
    const stream = new ReadableStream({
      start(controller) {
        // Enviar evento de conexão estabelecida
        const data = JSON.stringify({
          type: 'connection',
          message: 'Conexão estabelecida',
          timestamp: new Date().toISOString(),
          connectionId,
        })
        controller.enqueue(`data: ${data}\n\n`)

        // Configurar listener otimizado para mudanças no banco
        const channel = supabaseService
          .channel(`realtime-updates-${connectionId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'client_products',
            },
            payload => {
              // Debounce para evitar spam de eventos
              const eventData = JSON.stringify({
                type: 'product_update',
                action: payload.eventType,
                data: payload.new || payload.old,
                timestamp: new Date().toISOString(),
                connectionId,
              })
              controller.enqueue(`data: ${eventData}\n\n`)
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'company_stats',
            },
            payload => {
              const eventData = JSON.stringify({
                type: 'stats_update',
                action: payload.eventType,
                data: payload.new || payload.old,
                timestamp: new Date().toISOString(),
                connectionId,
              })
              controller.enqueue(`data: ${eventData}\n\n`)
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'store_stats',
            },
            payload => {
              const eventData = JSON.stringify({
                type: 'store_stats_update',
                action: payload.eventType,
                data: payload.new || payload.old,
                timestamp: new Date().toISOString(),
                connectionId,
              })
              controller.enqueue(`data: ${eventData}\n\n`)
            }
          )
          .subscribe()

        // Armazenar conexão ativa
        activeConnections.set(connectionId, {
          channel,
          controller,
          userId,
          lastPing: Date.now(),
        })

        // Manter conexão viva com ping otimizado
        const pingInterval = setInterval(() => {
          const connection = activeConnections.get(connectionId)
          if (connection) {
            connection.lastPing = Date.now()
            const pingData = JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString(),
              connectionId,
            })
            controller.enqueue(`data: ${pingData}\n\n`)
          }
        }, 30000) // Ping a cada 30 segundos

        // Cleanup otimizado quando a conexão for fechada
        const cleanup = () => {
          clearInterval(pingInterval)
          channel.unsubscribe()
          activeConnections.delete(connectionId)
          controller.close()
        }

        request.signal.addEventListener('abort', cleanup)

        // Timeout de inatividade (5 minutos)
        const inactivityTimeout = setTimeout(() => {
          cleanup()
        }, 300000)

        // Reset timeout a cada ping
        const resetTimeout = () => {
          clearTimeout(inactivityTimeout)
          setTimeout(() => {
            cleanup()
          }, 300000)
        }

        // Monitorar atividade
        const originalEnqueue = controller.enqueue.bind(controller)
        controller.enqueue = chunk => {
          resetTimeout()
          return originalEnqueue(chunk)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
        'X-Accel-Buffering': 'no', // Desabilitar buffering do nginx
      },
    })
  } catch (error) {
    console.error('Erro na API de tempo real:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Forçar atualização de estatísticas otimizada
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { companyId, action } = body

    if (action === 'recompute_stats') {
      // Executar recálculo de estatísticas com timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 30000)
      })

      const recomputePromise = supabaseService.rpc('recompute_company_stats', {
        target_company_id: companyId,
      })

      const { data, error } = (await Promise.race([
        recomputePromise,
        timeoutPromise,
      ])) as any

      if (error) {
        console.error('Erro ao recalcular estatísticas:', error)
        return NextResponse.json(
          { error: 'Erro ao recalcular estatísticas' },
          { status: 500 }
        )
      }

      // Notificar todas as conexões ativas sobre a atualização
      const updateData = JSON.stringify({
        type: 'manual_stats_update',
        action: 'recompute',
        data: { companyId },
        timestamp: new Date().toISOString(),
      })

      activeConnections.forEach(connection => {
        try {
          connection.controller.enqueue(`data: ${updateData}\n\n`)
        } catch (error) {
          console.error('Erro ao notificar conexão:', error)
          activeConnections.delete(connection.connectionId)
        }
      })

      return NextResponse.json({
        message: 'Estatísticas recalculadas com sucesso',
        data,
        activeConnections: activeConnections.size,
      })
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
  } catch (error) {
    console.error('Erro na API de atualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Limpar conexões inativas
export async function DELETE() {
  try {
    const now = Date.now()
    const inactiveThreshold = 300000 // 5 minutos

    let cleanedCount = 0
    activeConnections.forEach((connection, connectionId) => {
      if (now - connection.lastPing > inactiveThreshold) {
        try {
          connection.channel.unsubscribe()
          connection.controller.close()
          activeConnections.delete(connectionId)
          cleanedCount++
        } catch (error) {
          console.error('Erro ao limpar conexão inativa:', error)
        }
      }
    })

    return NextResponse.json({
      message: `${cleanedCount} conexões inativas removidas`,
      activeConnections: activeConnections.size,
    })
  } catch (error) {
    console.error('Erro ao limpar conexões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
