import { useEffect, useRef, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface RealtimeEvent {
  type:
    | 'connection'
    | 'product_update'
    | 'stats_update'
    | 'store_stats_update'
    | 'manual_stats_update'
    | 'ping'
  action?: string
  data?: any
  message?: string
  timestamp: string
  connectionId?: string
}

interface UseRealtimeUpdatesOptions {
  enabled?: boolean
  onProductUpdate?: (event: RealtimeEvent) => void
  onStatsUpdate?: (event: RealtimeEvent) => void
  onConnectionChange?: (connected: boolean) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const {
    enabled = true,
    onProductUpdate,
    onStatsUpdate,
    onConnectionChange,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClientComponentClient()

  // Função para limpar conexão
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
    onConnectionChange?.(false)
  }, [onConnectionChange])

  // Função para conectar
  const connect = useCallback(async () => {
    if (!enabled) return

    try {
      // Limpar conexão anterior se existir
      cleanup()

      // Obter token de autenticação
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.warn('Sem token de autenticação para conexão em tempo real')
        return
      }

      // Criar conexão Server-Sent Events com configurações otimizadas
      const eventSource = new EventSource('/api/realtime', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      } as any)

      eventSource.onopen = () => {
        console.log('Conexão em tempo real estabelecida')
        setIsConnected(true)
        setReconnectAttempts(0)
        onConnectionChange?.(true)
      }

      eventSource.onmessage = event => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data)
          setLastEvent(data)

          switch (data.type) {
            case 'product_update':
              console.log('Atualização de produto recebida:', data)
              onProductUpdate?.(data)
              break
            case 'stats_update':
            case 'store_stats_update':
            case 'manual_stats_update':
              console.log('Atualização de estatísticas recebida:', data)
              onStatsUpdate?.(data)
              break
            case 'ping':
              // Manter conexão viva - não fazer nada
              break
            case 'connection':
              console.log('Conexão confirmada:', data.message)
              break
          }
        } catch (error) {
          console.error('Erro ao processar evento em tempo real:', error)
        }
      }

      eventSource.onerror = error => {
        console.error('Erro na conexão em tempo real:', error)
        setIsConnected(false)
        onConnectionChange?.(false)

        // Tentar reconectar com backoff exponencial
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttempts),
            30000
          )
          console.log(
            `Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts + 1}/${maxReconnectAttempts})`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, delay)
        } else {
          console.error('Máximo de tentativas de reconexão atingido')
        }
      }

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('Erro ao conectar em tempo real:', error)
      setIsConnected(false)
      onConnectionChange?.(false)
    }
  }, [
    enabled,
    supabase,
    onProductUpdate,
    onStatsUpdate,
    onConnectionChange,
    reconnectInterval,
    maxReconnectAttempts,
    reconnectAttempts,
    cleanup,
  ])

  // Efeito para gerenciar conexão
  useEffect(() => {
    if (enabled) {
      connect()
    }

    return cleanup
  }, [enabled, connect, cleanup])

  // Função para forçar reconexão
  const forceReconnect = useCallback(() => {
    setReconnectAttempts(0)
    connect()
  }, [connect])

  // Função para forçar recálculo de estatísticas
  const forceRecompute = useCallback(
    async (companyId: string) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          throw new Error('Sem token de autenticação')
        }

        const response = await fetch('/api/realtime', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            companyId,
            action: 'recompute_stats',
          }),
        })

        if (!response.ok) {
          throw new Error('Erro ao forçar recálculo')
        }

        const result = await response.json()
        console.log('Recálculo forçado:', result)
        return result
      } catch (error) {
        console.error('Erro ao forçar recálculo:', error)
        throw error
      }
    },
    [supabase]
  )

  // Função para limpar conexões inativas (admin)
  const cleanupInactiveConnections = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Sem token de autenticação')
      }

      const response = await fetch('/api/realtime', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao limpar conexões')
      }

      const result = await response.json()
      console.log('Conexões inativas removidas:', result)
      return result
    } catch (error) {
      console.error('Erro ao limpar conexões:', error)
      throw error
    }
  }, [supabase])

  return {
    isConnected,
    lastEvent,
    reconnectAttempts,
    maxReconnectAttempts,
    forceReconnect,
    forceRecompute,
    cleanupInactiveConnections,
  }
}
