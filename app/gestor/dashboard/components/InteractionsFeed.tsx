'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Activity,
  Package,
  ShoppingCart,
  CheckCircle,
  User,
  Eye,
} from 'lucide-react'

interface InteractionsFeedProps {
  storeId: string
}

interface FeedEvent {
  id: string
  type: string
  message: string
  userName: string
  productName?: string
  productImage?: string
  createdAt: string
  timestamp: number
}

export function InteractionsFeed({ storeId }: InteractionsFeedProps) {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadEvents, 30000)
    return () => clearInterval(interval)
  }, [storeId])

  const loadEvents = async () => {
    if (!storeId) return

    try {
      const params = new URLSearchParams({
        store_id: storeId,
        limit: '10',
      })

      const response = await fetch(`/api/v2/gestor/events/feed?${params}`)
      const result = await response.json()

      if (result.success) {
        setEvents(result.data.events || [])
      }
    } catch (error) {
      console.error('Erro ao carregar feed de eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <User className="h-4 w-4 text-blue-500" />
      case 'product_view':
        return <Eye className="h-4 w-4 text-green-500" />
      case 'add_to_cart':
        return <ShoppingCart className="h-4 w-4 text-orange-500" />
      case 'redeem_complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'checkout_start':
        return <Package className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-blue-100 text-blue-800'
      case 'product_view':
        return 'bg-green-100 text-green-800'
      case 'add_to_cart':
        return 'bg-orange-100 text-orange-800'
      case 'redeem_complete':
        return 'bg-green-100 text-green-800'
      case 'checkout_start':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma interação recente</p>
        </div>
      ) : (
        events.map(event => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.userName}`}
                />
                <AvatarFallback>{event.userName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getEventIcon(event.type)}
                <Badge
                  variant="secondary"
                  className={`text-xs ${getEventColor(event.type)}`}
                >
                  {event.type.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatTime(event.createdAt)}
                </span>
              </div>

              <p className="text-sm text-gray-700">{event.message}</p>

              {event.productName && (
                <div className="flex items-center gap-2 mt-2">
                  {event.productImage && (
                    <img
                      src={event.productImage}
                      alt={event.productName}
                      className="w-6 h-6 object-cover rounded"
                    />
                  )}
                  <span className="text-xs text-gray-600 font-medium">
                    {event.productName}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
