'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Gift,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  Download,
  Share2,
  Home,
  ShoppingCart,
} from 'lucide-react'

interface OrderData {
  items: Array<{
    productId: string
    name: string
    price: number
    points_cost: number
    quantity: number
    image: string
  }>
  customer: {
    name: string
    email: string
    phone: string
    cpf: string
  }
  address: {
    zipCode: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
  }
  paymentMethod: string
  totalPoints: number
  orderId: string
}

export default function ConfirmationPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrderData()
  }, [])

  const loadOrderData = () => {
    try {
      const order = JSON.parse(localStorage.getItem('last_order') || 'null')
      if (order) {
        setOrderData(order)
      } else {
        router.push('/loja-brindes-preview')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error)
      router.push('/loja-brindes-preview')
    } finally {
      setLoading(false)
    }
  }

  const getTotalItems = () => {
    if (!orderData) return 0
    return orderData.items.reduce((total, item) => total + item.quantity, 0)
  }

  const formatAddress = () => {
    if (!orderData) return ''
    const { address } = orderData
    return `${address.street}, ${address.number}${address.complement ? ', ' + address.complement : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}`
  }

  const downloadReceipt = () => {
    // Simular download do comprovante
    const receiptData = {
      orderId: orderData?.orderId,
      date: new Date().toLocaleString('pt-BR'),
      customer: orderData?.customer,
      items: orderData?.items,
      total: orderData?.totalPoints,
    }

    const dataStr = JSON.stringify(receiptData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comprovante-${orderData?.orderId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando confirmação...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pedido não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            Não foi possível encontrar os dados do seu pedido.
          </p>
          <Button onClick={() => router.push('/loja-brindes-preview')}>
            <Home className="h-4 w-4 mr-2" />
            Voltar para a loja
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
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="font-semibold">Pedido Confirmado</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pedido Confirmado com Sucesso!
          </h1>
          <p className="text-gray-600 mb-4">
            Seu pedido foi processado e está sendo preparado para envio.
          </p>
          <Badge className="bg-blue-600 text-white px-4 py-2">
            Número do Pedido: {orderData.orderId}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.items.map(item => (
                  <div
                    key={item.productId}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Quantidade: {item.quantity} •{' '}
                        {item.points_cost * item.quantity} pontos
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {orderData.totalPoints} pontos
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{orderData.customer.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{orderData.customer.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{orderData.customer.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span>CPF: {orderData.customer.cpf}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping and Payment */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{formatAddress()}</p>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">Pagamento com Pontos</div>
                    <div className="text-sm text-gray-600">
                      {orderData.totalPoints} pontos utilizados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Previsão de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Pedido Confirmado</div>
                    <div className="text-xs text-gray-600">Hoje</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Preparando Envio</div>
                    <div className="text-xs text-gray-600">1-2 dias úteis</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Em Trânsito</div>
                    <div className="text-xs text-gray-600">2-3 dias úteis</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Entregue</div>
                    <div className="text-xs text-gray-600">3-5 dias úteis</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={downloadReceipt}
            variant="outline"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Comprovante
          </Button>
          <Button
            onClick={() => router.push('/loja-brindes-preview')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Continuar Comprando
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const shareText = `Acabei de fazer um pedido na Loja de Brindes Yoobe! Pedido #${orderData.orderId}`
              if (navigator.share) {
                navigator.share({ text: shareText })
              } else {
                navigator.clipboard.writeText(shareText)
                alert('Link copiado para a área de transferência!')
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Você receberá um e-mail de confirmação em breve com todos os
            detalhes do seu pedido.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Em caso de dúvidas, entre em contato conosco através do e-mail:
            contato@yoobe.com
          </p>
        </div>
      </div>
    </div>
  )
}










