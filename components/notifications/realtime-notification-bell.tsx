'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
  action_url?: string
  action_label?: string
}

interface NotificationResponse {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function RealtimeNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClientComponentClient()
  const channelRef = useRef<any>(null)

  // Buscar notificações
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=50')
      if (response.ok) {
        const data: NotificationResponse = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: notificationId,
          is_read: true,
        }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)

      for (const notification of unreadNotifications) {
        await markAsRead(notification.id)
      }

      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao marcar notificações como lidas')
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) {
      return 'Agora'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}min atrás`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  // Obter ícone por tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  // Configurar realtime
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        // Buscar notificações iniciais
        await fetchNotifications()

        // Configurar canal realtime
        const channel = supabase
          .channel('notifications-realtime')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
            },
            payload => {
              const newNotification = payload.new as Notification
              console.log('🔔 Nova notificação recebida:', newNotification)

              // Adicionar à lista
              setNotifications(prev => [newNotification, ...prev])
              setUnreadCount(prev => prev + 1)

              // Mostrar toast
              toast(newNotification.title, {
                description: newNotification.message,
                action: newNotification.action_url
                  ? {
                      label: newNotification.action_label || 'Ver',
                      onClick: () => {
                        if (newNotification.action_url) {
                          window.open(newNotification.action_url, '_blank')
                        }
                      },
                    }
                  : undefined,
              })
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
            },
            payload => {
              const updatedNotification = payload.new as Notification
              console.log('🔔 Notificação atualizada:', updatedNotification)

              setNotifications(prev =>
                prev.map(n =>
                  n.id === updatedNotification.id ? updatedNotification : n
                )
              )
            }
          )
          .subscribe(status => {
            console.log('📡 Status do canal realtime:', status)
            setIsConnected(status === 'SUBSCRIBED')
          })

        channelRef.current = channel

        return () => {
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
          }
        }
      } catch (error) {
        console.error('Erro ao configurar realtime:', error)
      }
    }

    setupRealtime()
  }, [])

  // Buscar notificações ao abrir
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} não lidas
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Carregando...
                  </span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                        if (notification.action_url) {
                          window.open(notification.action_url, '_blank')
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${
                                !notification.is_read
                                  ? 'text-gray-900'
                                  : 'text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            {notification.action_url && (
                              <span className="text-xs text-blue-600 hover:text-blue-800">
                                {notification.action_label || 'Ver detalhes'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
