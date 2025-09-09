'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  FileText,
  Eye,
  EyeOff,
  Calendar,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TrackingEvent {
  id: string
  status: string
  title: string
  description?: string
  meta?: Record<string, any>
  created_at: string
  users?: {
    id: string
    email: string
    user_metadata?: {
      name?: string
    }
  }
}

interface BudgetTimelineProps {
  budgetId: string
  className?: string
}

const STATUS_CONFIG = {
  received: {
    icon: FileText,
    label: 'Recebido',
    color: 'bg-blue-500',
    description: 'Orçamento recebido e em análise',
  },
  design_review: {
    icon: Eye,
    label: 'Revisão de Design',
    color: 'bg-yellow-500',
    description: 'Artes em análise pela equipe',
  },
  proof_sent: {
    icon: FileText,
    label: 'Prova Enviada',
    color: 'bg-orange-500',
    description: 'Prova de impressão enviada para aprovação',
  },
  proof_approved: {
    icon: CheckCircle,
    label: 'Prova Aprovada',
    color: 'bg-green-500',
    description: 'Prova aprovada pelo cliente',
  },
  production: {
    icon: Package,
    label: 'Em Produção',
    color: 'bg-purple-500',
    description: 'Produtos em produção',
  },
  qc: {
    icon: AlertCircle,
    label: 'Controle de Qualidade',
    color: 'bg-indigo-500',
    description: 'Verificação de qualidade',
  },
  shipped: {
    icon: Truck,
    label: 'Enviado',
    color: 'bg-teal-500',
    description: 'Produtos enviados',
  },
  delivered: {
    icon: CheckCircle,
    label: 'Entregue',
    color: 'bg-green-600',
    description: 'Produtos entregues',
  },
  blocked: {
    icon: AlertCircle,
    label: 'Bloqueado',
    color: 'bg-red-500',
    description: 'Processo bloqueado',
  },
}

export function BudgetTimeline({
  budgetId,
  className = '',
}: BudgetTimelineProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [budgetId])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/budgets/${budgetId}/tracking`)

      if (!response.ok) {
        throw new Error('Erro ao carregar timeline')
      }

      const { data } = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      setError('Erro ao carregar timeline')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
        icon: Clock,
        label: status,
        color: 'bg-gray-500',
        description: 'Status desconhecido',
      }
    )
  }

  const getUserDisplayName = (user?: TrackingEvent['users']) => {
    if (!user) return 'Sistema'

    return user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchEvents} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline do Orçamento
        </CardTitle>
        <CardDescription>
          Acompanhe o progresso do seu orçamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum evento registrado ainda
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => {
              const statusConfig = getStatusConfig(event.status)
              const Icon = statusConfig.icon
              const isLast = index === events.length - 1

              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-0.5 h-16 bg-border" />
                  )}

                  <div className="flex gap-4">
                    {/* Status icon */}
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white
                      ${statusConfig.color}
                    `}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Event content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Meta information */}
                      {event.meta && Object.keys(event.meta).length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          {event.meta.po_number && (
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>PO: {event.meta.po_number}</span>
                            </div>
                          )}
                          {event.meta.tracking_code && (
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Rastreamento: {event.meta.tracking_code}
                              </span>
                            </div>
                          )}
                          {event.meta.carrier && (
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>Transportadora: {event.meta.carrier}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Event footer */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getUserDisplayName(event.users)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
