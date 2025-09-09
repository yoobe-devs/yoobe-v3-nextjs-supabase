'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  GitBranch,
  Star,
  Wrench,
  Shield,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SystemNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
  action_url?: string
  action_label?: string
}

interface ChangelogNotification {
  version: string
  date: string
  title: string
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'performance'
  items: string[]
  read: boolean
}

interface NotificationResponse {
  notifications: SystemNotification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function UnifiedNotificationBell() {
  const [systemNotifications, setSystemNotifications] = useState<
    SystemNotification[]
  >([])
  const [changelogNotifications, setChangelogNotifications] = useState<
    ChangelogNotification[]
  >([])
  const [systemUnreadCount, setSystemUnreadCount] = useState(0)
  const [changelogUnreadCount, setChangelogUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClientComponentClient()
  const channelRef = useRef<any>(null)
  const router = useRouter()

  const totalUnreadCount = systemUnreadCount + changelogUnreadCount

  // Buscar notificações do sistema
  const fetchSystemNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=50')
      if (response.ok) {
        const data: NotificationResponse = await response.json()
        setSystemNotifications(data.notifications)
        setSystemUnreadCount(data.notifications.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Erro ao buscar notificações do sistema:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar notificações do changelog
  const loadChangelogNotifications = () => {
    const mockChangelogNotifications: ChangelogNotification[] = [
      {
        version: '3.2.0',
        date: '2025-01-15',
        title: 'Sistema de Validação de Dados Mockados',
        type: 'feature',
        items: [
          'Validações integradas nas APIs',
          'Hooks implementados em formulários React',
          'CI/CD configurado para verificação automática',
          'Sistema de verificação semanal implementado',
        ],
        read: false,
      },
      {
        version: '3.1.0',
        date: '2025-01-10',
        title: 'Perfil Completo do Gestor',
        type: 'improvement',
        items: [
          'Cadastro completo da empresa no perfil',
          'Endereço, endereço de cobrança, dados fiscais',
          'Dados para recebimento de notas fiscais',
          'CNPJ, inscrição estadual, etc.',
        ],
        read: false,
      },
      {
        version: '3.0.0',
        date: '2025-01-05',
        title: 'Correções de Interface e Notificações',
        type: 'fix',
        items: [
          'Correção de erros 403 em APIs',
          'Ícone de notificação em tempo real',
          'Estados vazios melhorados na interface',
          'Sistema de autorização padronizado',
        ],
        read: true,
      },
    ]

    setChangelogNotifications(mockChangelogNotifications)
    setChangelogUnreadCount(
      mockChangelogNotifications.filter(n => !n.read).length
    )
  }

  // Marcar notificação do sistema como lida
  const markSystemNotificationAsRead = async (notificationId: string) => {
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
        setSystemNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
        setSystemUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  // Marcar notificação do changelog como lida
  const markChangelogNotificationAsRead = (version: string) => {
    setChangelogNotifications(prev =>
      prev.map(n => (n.version === version ? { ...n, read: true } : n))
    )
    setChangelogUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Marcar todas as notificações do sistema como lidas
  const markAllSystemNotificationsAsRead = async () => {
    try {
      const unreadNotifications = systemNotifications.filter(n => !n.is_read)

      for (const notification of unreadNotifications) {
        await markSystemNotificationAsRead(notification.id)
      }

      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao marcar notificações como lidas')
    }
  }

  // Marcar todas as notificações do changelog como lidas
  const markAllChangelogNotificationsAsRead = () => {
    setChangelogNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setChangelogUnreadCount(0)
  }

  // Ir para o changelog
  const goToChangelog = () => {
    router.push('/admin/changelog')
    setIsOpen(false)
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

  // Obter ícone por tipo do sistema
  const getSystemTypeIcon = (type: string) => {
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

  // Obter ícone por tipo do changelog
  const getChangelogTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return GitBranch
      case 'improvement':
        return Star
      case 'fix':
        return Wrench
      case 'security':
        return Shield
      case 'performance':
        return Zap
      default:
        return GitBranch
    }
  }

  // Obter cor por tipo do changelog
  const getChangelogTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'improvement':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'fix':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'security':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'performance':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obter label por tipo do changelog
  const getChangelogTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'Nova Funcionalidade'
      case 'improvement':
        return 'Melhoria'
      case 'fix':
        return 'Correção'
      case 'security':
        return 'Segurança'
      case 'performance':
        return 'Performance'
      default:
        return 'Atualização'
    }
  }

  // Configurar realtime para notificações do sistema
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        // Buscar notificações iniciais
        await fetchSystemNotifications()
        loadChangelogNotifications()

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
              const newNotification = payload.new as SystemNotification
              console.log('🔔 Nova notificação recebida:', newNotification)

              // Adicionar à lista
              setSystemNotifications(prev => [newNotification, ...prev])
              setSystemUnreadCount(prev => prev + 1)

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
              const updatedNotification = payload.new as SystemNotification
              console.log('🔔 Notificação atualizada:', updatedNotification)

              setSystemNotifications(prev =>
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
      fetchSystemNotifications()
    }
  }, [isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Notificações
                {totalUnreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {totalUnreadCount} não lidas
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="system" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="system" className="relative">
                  Sistema
                  {systemUnreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-4 w-4 p-0 text-xs"
                    >
                      {systemUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="changelog" className="relative">
                  Atualizações
                  {changelogUnreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-4 w-4 p-0 text-xs"
                    >
                      {changelogUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="system" className="mt-0">
                <div className="p-3 border-b">
                  {systemUnreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllSystemNotificationsAsRead}
                      className="text-xs w-full"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-80">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Carregando...
                      </span>
                    </div>
                  ) : systemNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        Nenhuma notificação
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {systemNotifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            if (!notification.is_read) {
                              markSystemNotificationAsRead(notification.id)
                            }
                            if (notification.action_url) {
                              window.open(notification.action_url, '_blank')
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getSystemTypeIcon(notification.type)}
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
                                    {notification.action_label ||
                                      'Ver detalhes'}
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
              </TabsContent>

              <TabsContent value="changelog" className="mt-0">
                <div className="p-3 border-b">
                  {changelogUnreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllChangelogNotificationsAsRead}
                      className="text-xs w-full"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-80">
                  {changelogNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        Nenhuma atualização recente
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {changelogNotifications.map((notification, index) => {
                        const TypeIcon = getChangelogTypeIcon(notification.type)
                        return (
                          <Card
                            key={index}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              !notification.read
                                ? 'border-l-4 border-l-blue-500 bg-blue-50'
                                : ''
                            }`}
                            onClick={() =>
                              markChangelogNotificationAsRead(
                                notification.version
                              )
                            }
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <TypeIcon className="h-4 w-4" />
                                  <Badge
                                    className={getChangelogTypeColor(
                                      notification.type
                                    )}
                                  >
                                    {getChangelogTypeLabel(notification.type)}
                                  </Badge>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">
                                    v{notification.version}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(
                                      notification.date
                                    ).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                              <CardTitle className="text-sm">
                                {notification.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <ul className="space-y-1">
                                {notification.items
                                  .slice(0, 2)
                                  .map((item, itemIndex) => (
                                    <li
                                      key={itemIndex}
                                      className="text-xs text-gray-600 flex items-start gap-2"
                                    >
                                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                      {item}
                                    </li>
                                  ))}
                                {notification.items.length > 2 && (
                                  <li className="text-xs text-blue-600">
                                    +{notification.items.length - 2} mais
                                    mudanças
                                  </li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-3 border-t bg-gray-50">
                  <Button
                    onClick={goToChangelog}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Ver Changelog Completo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
