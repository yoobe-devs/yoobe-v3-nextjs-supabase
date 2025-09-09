'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Package,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Truck,
  FileText,
  Download,
  Copy,
  Gift,
  User,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

interface Order {
  id: string
  number: string
  total_amount: number
  status: string
  payment_method: string
  payment_state: string
  confirmed_at: string
  address_snapshot: any
  cart_snapshot: any[]
  redemption_info: any
  tracking_info: any
  invoice_info: any
  notes?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const tenantId = user.user_metadata?.tenant_id
      const employeeId = user.user_metadata?.employee_id

      if (!tenantId || !employeeId) return

      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('tenant_id', tenantId)
        .eq('employee_id', employeeId)
        .single()

      if (error) {
        console.error('Erro ao buscar pedido:', error)
        return
      }

      setOrder(orderData)
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: {
        label: 'Confirmado',
        className: 'bg-green-500',
        icon: CheckCircle,
      },
      preparing: {
        label: 'Preparando',
        className: 'bg-yellow-500',
        icon: Clock,
      },
      shipped: { label: 'Enviado', className: 'bg-blue-500', icon: Truck },
      delivered: {
        label: 'Entregue',
        className: 'bg-green-600',
        icon: CheckCircle,
      },
      cancelled: {
        label: 'Cancelado',
        className: 'bg-red-500',
        icon: AlertCircle,
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-500',
      icon: Package,
    }
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (method: string) => {
    const methodConfig = {
      pix: { label: 'PIX', className: 'bg-purple-500' },
      card: { label: 'Cartão', className: 'bg-blue-500' },
      pontos: { label: 'Pontos', className: 'bg-yellow-500' },
      misto: { label: 'Misto', className: 'bg-orange-500' },
    }

    const config = methodConfig[method as keyof typeof methodConfig] || {
      label: method,
      className: 'bg-gray-500',
    }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPaymentStateBadge = (state: string) => {
    const stateConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-500' },
      paid: { label: 'Pago', className: 'bg-green-500' },
      failed: { label: 'Falhou', className: 'bg-red-500' },
    }

    const config = stateConfig[state as keyof typeof stateConfig] || {
      label: state,
      className: 'bg-gray-500',
    }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Em produção, mostrar toast de sucesso
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pedido não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            O pedido que você está procurando não existe ou não está mais
            disponível.
          </p>
          <Button onClick={() => router.push('/gestor/pedidos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Pedidos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/gestor/pedidos')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Pedido {order.number}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resumo do Pedido</span>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status)}
                    {getPaymentBadge(order.payment_method)}
                    {getPaymentStateBadge(order.payment_state)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Número do Pedido
                    </span>
                    <div className="font-medium">{order.number}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Data de Confirmação
                    </span>
                    <div className="font-medium">
                      {new Date(order.confirmed_at).toLocaleDateString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        R${' '}
                        {order.total_amount.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      {order.redemption_info?.total_points && (
                        <div className="text-sm text-yellow-600">
                          {order.redemption_info.total_points} pontos
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="border-t pt-4">
                    <span className="text-sm text-gray-500">Observações</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      {order.notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.cart_snapshot?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <Gift className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        SKU: {item.final_sku}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        R${' '}
                        {item.subtotal.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-sm text-yellow-600">
                        {item.subtotalPoints} pontos
                      </div>
                      <div className="text-xs text-gray-500">
                        R${' '}
                        {item.price.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        cada
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.address_snapshot?.full_name && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{order.address_snapshot.full_name}</span>
                    </div>
                  )}

                  {order.address_snapshot?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{order.address_snapshot.phone}</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <div>
                        {order.address_snapshot?.street},{' '}
                        {order.address_snapshot?.number}
                      </div>
                      {order.address_snapshot?.complement && (
                        <div>{order.address_snapshot.complement}</div>
                      )}
                      <div>{order.address_snapshot?.neighborhood}</div>
                      <div>
                        {order.address_snapshot?.city} -{' '}
                        {order.address_snapshot?.state}
                      </div>
                      <div>{order.address_snapshot?.postal_code}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${order.address_snapshot?.street}, ${order.address_snapshot?.number}, ${order.address_snapshot?.neighborhood}, ${order.address_snapshot?.city} - ${order.address_snapshot?.state}, ${order.address_snapshot?.postal_code}`
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Endereço
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Informações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Método</span>
                  <div className="font-medium">
                    {getPaymentBadge(order.payment_method)}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="font-medium">
                    {getPaymentStateBadge(order.payment_state)}
                  </div>
                </div>

                {order.redemption_info && (
                  <div className="border-t pt-3">
                    <span className="text-sm text-gray-500">
                      Informações do Resgate
                    </span>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>
                        Pontos utilizados: {order.redemption_info.total_points}
                      </div>
                      <div>
                        Taxa de conversão:{' '}
                        {order.redemption_info.conversion_rate}:1
                      </div>
                      {order.redemption_info.mix_ratio && (
                        <div>
                          Proporção mista:{' '}
                          {Math.round(order.redemption_info.mix_ratio * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking */}
            {order.tracking_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Rastreamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">
                      Código de Rastreamento
                    </span>
                    <div className="font-medium">
                      {order.tracking_info.code}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="font-medium">
                      {order.tracking_info.status}
                    </div>
                  </div>

                  {order.tracking_info.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        window.open(order.tracking_info.url, '_blank')
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Rastrear Pedido
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Invoice */}
            {order.invoice_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Nota Fiscal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Número da NF</span>
                    <div className="font-medium">
                      {order.invoice_info.number}
                    </div>
                  </div>

                  {order.invoice_info.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        window.open(order.invoice_info.url, '_blank')
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar NF
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/loja-brindes-preview')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Fazer Novo Pedido
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/gestor/pedidos')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Lista
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}










