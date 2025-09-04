'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  Star,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Home,
  ShoppingBag,
  Timer,
  Navigation,
  Globe,
  Eye,
  Edit,
} from 'lucide-react'
import Link from 'next/link'
import UpdateStatusModal from '@/components/update-status-modal'
import NewDeliveryModal from '@/components/new-delivery-modal'
import EditOrderModal from '@/components/edit-order-modal'

interface TrackingEvent {
  id: string
  status: string
  location?: string
  description?: string
  timestamp: string
  metadata?: any
}

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  client_products: {
    id: string
    name: string
    price: number
    image_url?: string
    final_sku: string
  }
}

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  points_used: number
  currency: string
  created_at: string
  updated_at: string
  tracking_code?: string
  shipping_address: any
  notes?: string
  company: {
    name: string
    domain: string
  }
  customer: {
    name: string
    email: string
  }
  items: OrderItem[]
}

interface TrackingData {
  order: Order
  tracking_events: TrackingEvent[]
  cubbo_tracking?: any
  estimated_delivery?: string
  actual_delivery?: string
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Pedido aguardando processamento',
  },
  confirmed: {
    label: 'Confirmado',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'Pedido confirmado e em preparação',
  },
  processing: {
    label: 'Processando',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
    description: 'Produtos sendo preparados',
  },
  shipped: {
    label: 'Enviado',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
    description: 'Pedido em trânsito',
  },
  delivered: {
    label: 'Entregue',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Pedido entregue com sucesso',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
    description: 'Pedido cancelado',
  },
}

export default function TrackingPage() {
  const params = useParams()
  const orderId = params.orderId as string

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados dos modais
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false)
  const [showEditOrderModal, setShowEditOrderModal] = useState(false)

  useEffect(() => {
    fetchTrackingData()
  }, [orderId])

  const fetchTrackingData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tracking/${orderId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar dados do pedido')
      }

      setTrackingData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.pending
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando informações do pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pedido não encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              'Não foi possível encontrar informações sobre este pedido.'}
          </p>
          <div className="space-x-4">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
            <Button onClick={fetchTrackingData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { order, tracking_events, cubbo_tracking } = trackingData
  const statusConfig = getStatusConfig(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Rastreamento do Pedido
                </h1>
                <p className="text-gray-600">Pedido #{order.order_number}</p>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditOrderModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpdateStatusModal(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewDeliveryModal(true)}
              >
                <Truck className="h-4 w-4 mr-2" />
                Nova Entrega
              </Button>
            </div>
            <div className="text-right">
              <Badge className={statusConfig.color}>
                <statusConfig.icon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {statusConfig.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Status do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={`${statusConfig.color} text-sm`}>
                      <statusConfig.icon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {statusConfig.description}
                    </p>
                  </div>
                  {order.tracking_code && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Código de Rastreamento
                      </p>
                      <p className="text-lg font-mono">{order.tracking_code}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline de eventos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Histórico do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tracking_events.length > 0 ? (
                    tracking_events.map((event, index) => {
                      const eventStatusConfig = getStatusConfig(event.status)
                      const isLast = index === tracking_events.length - 1

                      return (
                        <div
                          key={event.id}
                          className="flex items-start space-x-4"
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isLast ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <eventStatusConfig.icon
                              className={`h-4 w-4 ${
                                isLast ? 'text-white' : 'text-gray-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {eventStatusConfig.label}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(event.timestamp)}
                              </p>
                            </div>
                            {event.location && (
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Ainda não há eventos de rastreamento disponíveis.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Integração Cubbo */}
            {cubbo_tracking && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Rastreamento Cubbo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="outline">{cubbo_tracking.status}</Badge>
                    </div>
                    {cubbo_tracking.estimated_delivery && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Previsão de Entrega:
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(cubbo_tracking.estimated_delivery)}
                        </span>
                      </div>
                    )}
                    {cubbo_tracking.tracking_url && (
                      <div className="pt-4">
                        <a
                          href={cubbo_tracking.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Rastrear no site da Cubbo
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Detalhes do pedido */}
          <div className="space-y-6">
            {/* Informações do pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Detalhes do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Pedido:</span>
                  <span className="text-sm">#{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Data:</span>
                  <span className="text-sm">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
                {order.points_used > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Pontos Usados:</span>
                    <span className="text-sm">
                      {order.points_used.toLocaleString()}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTrackingData}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{order.customer.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{order.customer.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Endereço de entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {order.shipping_address && (
                    <div>
                      <p>{order.shipping_address.street}</p>
                      <p>
                        {order.shipping_address.city},{' '}
                        {order.shipping_address.state}
                      </p>
                      <p>{order.shipping_address.postal_code}</p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Produtos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Produtos ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center space-x-3">
                      {item.client_products.image_url && (
                        <img
                          src={item.client_products.image_url}
                          alt={item.client_products.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.client_products.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qtd: {item.quantity} •{' '}
                          {formatCurrency(item.unit_price, order.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modais */}
      <UpdateStatusModal
        isOpen={showUpdateStatusModal}
        onClose={() => setShowUpdateStatusModal(false)}
        orderId={orderId}
        currentStatus={order.status}
        onStatusUpdated={fetchTrackingData}
      />

      <NewDeliveryModal
        isOpen={showNewDeliveryModal}
        onClose={() => setShowNewDeliveryModal(false)}
        orderId={orderId}
        currentOrder={order}
        onDeliveryCreated={fetchTrackingData}
      />

      <EditOrderModal
        isOpen={showEditOrderModal}
        onClose={() => setShowEditOrderModal(false)}
        order={order}
        onOrderUpdated={fetchTrackingData}
      />
    </div>
  )
}
