import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  BellOff,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  DollarSign,
  Users,
  Clock,
  Settings,
} from 'lucide-react'

interface RealtimeNotificationsProps {
  userId?: string
  companyId?: string
  onNotificationClick?: (notification: Notification) => void
  className?: string
}

interface Notification {
  id: string
  type: 'budget' | 'order' | 'production' | 'system' | 'alert'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

const notificationConfig = {
  budget: {
    icon: DollarSign,
    color: 'bg-blue-500',
    label: 'Orçamento',
  },
  order: {
    icon: Package,
    color: 'bg-green-500',
    label: 'Pedido',
  },
  production: {
    icon: Settings,
    color: 'bg-purple-500',
    label: 'Produção',
  },
  system: {
    icon: Info,
    color: 'bg-gray-500',
    label: 'Sistema',
  },
  alert: {
    icon: AlertCircle,
    color: 'bg-red-500',
    label: 'Alerta',
  },
}

const priorityConfig = {
  low: { color: 'text-gray-500', bg: 'bg-gray-100' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-100' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100' },
  urgent: { color: 'text-red-600', bg: 'bg-red-100' },
}

export function RealtimeNotifications({
  userId,
  companyId,
  onNotificationClick,
  className = '',
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      if (companyId) params.append('company_id', companyId)

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data.notifications || [])
        setUnreadCount(data.data.unread_count || 0)
      } else {
        setError(data.error?.message || 'Erro ao carregar notificações')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
        }
      )

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      })

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notif => notif.id !== notificationId)
        )
        const deletedNotif = notifications.find(
          notif => notif.id === notificationId
        )
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      console.error('Erro ao deletar notificação:', err)
    }
  }

  const setupRealtimeConnection = () => {
    if (!isEnabled || eventSourceRef.current) return

    try {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      if (companyId) params.append('company_id', companyId)

      const eventSource = new EventSource(`/api/notifications/stream?${params}`)
      eventSourceRef.current = eventSource

      eventSource.onmessage = event => {
        try {
          const notification = JSON.parse(event.data)
          setNotifications(prev => [notification, ...prev])
          if (!notification.read) {
            setUnreadCount(prev => prev + 1)
          }
        } catch (err) {
          console.error('Erro ao processar notificação em tempo real:', err)
        }
      }

      eventSource.onerror = error => {
        console.error('Erro na conexão de notificações em tempo real:', error)
        // Tentar reconectar após 5 segundos
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
            setupRealtimeConnection()
          }
        }, 5000)
      }
    } catch (err) {
      console.error('Erro ao configurar conexão em tempo real:', err)
    }
  }

  const closeRealtimeConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId, companyId])

  useEffect(() => {
    if (isEnabled) {
      setupRealtimeConnection()
    } else {
      closeRealtimeConnection()
    }

    return () => {
      closeRealtimeConnection()
    }
  }, [isEnabled, userId, companyId])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const getNotificationConfig = (type: string) => {
    return (
      notificationConfig[type as keyof typeof notificationConfig] || {
        icon: Info,
        color: 'bg-gray-500',
        label: 'Notificação',
      }
    )
  }

  const getPriorityConfig = (priority: string) => {
    return (
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.medium
    )
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    onNotificationClick?.(notification)
  }

  if (loading) {
    return (
      <div className={className}>
        <Button variant="outline" size="sm" disabled>
          <Bell className="w-4 h-4 mr-2" />
          Carregando...
        </Button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botão de notificações */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {isEnabled ? (
          <Bell className="w-4 h-4 mr-2" />
        ) : (
          <BellOff className="w-4 h-4 mr-2" />
        )}
        Notificações
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 z-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEnabled(!isEnabled)}
                >
                  {isEnabled ? (
                    <BellOff className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </Button>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchNotifications}
                  className="mt-2"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma notificação</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {notifications.map(notification => {
                    const config = getNotificationConfig(notification.type)
                    const priorityConfig = getPriorityConfig(
                      notification.priority
                    )
                    const Icon = config.icon

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white flex-shrink-0`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4
                                className={`font-semibold text-sm ${
                                  !notification.read ? 'font-bold' : ''
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1 ml-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${priorityConfig.color} ${priorityConfig.bg}`}
                                >
                                  {notification.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.created_at)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

