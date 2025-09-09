'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  total_amount: number
  status: string
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  created_at: string
  updated_at: string
  notes?: string
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false)
  const [showEditOrderModal, setShowEditOrderModal] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar detalhes do pedido
      const orderResponse = await fetch(`/api/tracking-simple/${orderId}`)
      const orderResult = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderResult.error || 'Pedido não encontrado')
      }

      setOrder(orderResult.order)
      setTrackingEvents(orderResult.trackingEvents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
      case 'processando':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
      case 'enviado':
      case 'em-transito':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
      case 'entregue':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pendente':
        return <Clock className="h-4 w-4" />
      case 'processing':
      case 'processando':
        return <Package className="h-4 w-4" />
      case 'shipped':
      case 'enviado':
      case 'em-transito':
        return <Truck className="h-4 w-4" />
      case 'delivered':
      case 'entregue':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
      case 'cancelado':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pendente':
        return 'Pendente'
      case 'processing':
      case 'processando':
        return 'Processando'
      case 'shipped':
      case 'enviado':
      case 'em-transito':
        return 'Em Trânsito'
      case 'delivered':
      case 'entregue':
        return 'Entregue'
      case 'cancelled':
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando detalhes do pedido...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erro ao carregar pedido
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-3">
              <Button onClick={fetchOrderDetails}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/gestor/swag-track')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/gestor/swag-track')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pedido #{order.order_number}
            </h1>
            <p className="text-gray-600">Rastreamento e detalhes do pedido</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowEditOrderModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowUpdateStatusModal(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Status
          </Button>
          <Button onClick={() => setShowNewDeliveryModal(true)}>
            <Truck className="h-4 w-4 mr-2" />
            Nova Entrega
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-3">
        <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1`}>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span>{getStatusText(order.status)}</span>
          </div>
        </Badge>
        <span className="text-sm text-gray-500">
          Última atualização: {formatDate(order.updated_at)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalhes do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.customer_name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{order.customer_email}</span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>Pedido: {formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-3 w-3" />
                      <span>Total: {formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{order.shipping_address.street}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{' '}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Itens do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} cada
                      </p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline de Rastreamento */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="h-5 w-5 mr-2" />
                Timeline de Rastreamento
              </CardTitle>
              <CardDescription>
                Acompanhe o progresso do seu pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackingEvents.length > 0 ? (
                <div className="space-y-4">
                  {trackingEvents
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((event, index) => (
                      <div key={event.id} className="flex space-x-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          />
                          {index < trackingEvents.length - 1 && (
                            <div className="w-px h-8 bg-gray-300 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(event.status)}>
                              {getStatusIcon(event.status)}
                            </Badge>
                            <span className="text-sm font-medium">
                              {getStatusText(event.status)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1">
                              📍 {event.location}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhum evento de rastreamento encontrado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUpdateStatusModal(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowNewDeliveryModal(true)}
              >
                <Truck className="h-4 w-4 mr-2" />
                Nova Entrega
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowEditOrderModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Pedido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modais */}
      {showUpdateStatusModal && (
        <UpdateStatusModal
          orderId={orderId}
          onClose={() => setShowUpdateStatusModal(false)}
          onSuccess={() => {
            setShowUpdateStatusModal(false)
            fetchOrderDetails()
          }}
        />
      )}

      {showNewDeliveryModal && (
        <NewDeliveryModal
          orderId={orderId}
          onClose={() => setShowNewDeliveryModal(false)}
          onSuccess={() => {
            setShowNewDeliveryModal(false)
            fetchOrderDetails()
          }}
        />
      )}

      {showEditOrderModal && (
        <EditOrderModal
          orderId={orderId}
          order={order}
          onClose={() => setShowEditOrderModal(false)}
          onSuccess={() => {
            setShowEditOrderModal(false)
            fetchOrderDetails()
          }}
        />
      )}
    </div>
  )
}
