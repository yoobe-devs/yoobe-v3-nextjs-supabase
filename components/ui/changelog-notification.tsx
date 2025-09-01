'use client'

import { useState, useEffect } from 'react'
import { Bell, GitBranch, Star, Wrench, Shield, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface ChangelogNotification {
  version: string
  date: string
  title: string
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'performance'
  items: string[]
  read: boolean
}

export function ChangelogNotification() {
  const [notifications, setNotifications] = useState<ChangelogNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Simular notificações de changelog
    const mockNotifications: ChangelogNotification[] = [
      {
        version: '2.0.0',
        date: '2024-01-17',
        title: 'Sistema de Documentação Visual',
        type: 'feature',
        items: [
          'Renderização HTML colorida de arquivos MD',
          'Interface visual com gradientes e cards',
          'Sistema automático de atualização',
          'Changelog visual melhorado'
        ],
        read: false
      },
      {
        version: '1.9.0',
        date: '2024-01-15',
        title: 'Integração Cubbo Global',
        type: 'improvement',
        items: [
          'Fulfillment centralizado',
          'Sincronização automática de produtos',
          'Gestão de estoque integrada'
        ],
        read: false
      },
      {
        version: '1.8.0',
        date: '2024-01-10',
        title: 'Sistema de Gamificação',
        type: 'feature',
        items: [
          'Integração Workvivo',
          'Integração Applause',
          'Sistema de pontos'
        ],
        read: true
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const markAsRead = (version: string) => {
    setNotifications(prev => 
      prev.map(n => n.version === version ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const goToChangelog = () => {
    router.push('/admin/changelog')
    setIsOpen(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return GitBranch
      case 'improvement': return Star
      case 'fix': return Wrench
      case 'security': return Shield
      case 'performance': return Zap
      default: return GitBranch
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'improvement': return 'bg-green-100 text-green-800 border-green-200'
      case 'fix': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'security': return 'bg-red-100 text-red-800 border-red-200'
      case 'performance': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature': return 'Nova Funcionalidade'
      case 'improvement': return 'Melhoria'
      case 'fix': return 'Correção'
      case 'security': return 'Segurança'
      case 'performance': return 'Performance'
      default: return 'Atualização'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Atualizações Recentes</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma atualização recente
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map((notification, index) => {
                const TypeIcon = getTypeIcon(notification.type)
                return (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.version)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          <Badge className={getTypeColor(notification.type)}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">v{notification.version}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(notification.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-sm">{notification.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1">
                        {notification.items.slice(0, 2).map((item, itemIndex) => (
                          <li key={itemIndex} className="text-xs text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            {item}
                          </li>
                        ))}
                        {notification.items.length > 2 && (
                          <li className="text-xs text-blue-600">
                            +{notification.items.length - 2} mais mudanças
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <Button 
            onClick={goToChangelog} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Ver Changelog Completo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

