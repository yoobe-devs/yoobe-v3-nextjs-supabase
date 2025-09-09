"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Star,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react'
import { getOrderById } from '@/lib/queries/orders'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  points_used: number
  currency: string
  created_at: string
  items: any[]
}

export default function OrderConfirmedPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const o = await getOrderById(params.id as string)
        const items = (o.order_items || []).map((it: any) => ({
          id: String(it.id),
          name: it.products?.name || 'Item do pedido',
          quantity: it.quantity || 1,
          price: it.unit_price || 0,
          points: 0,
        }))
        setOrder({
          id: o.id,
          order_number: o.order_number || o.id,
          status: o.status,
          total_amount: o.total_amount || 0,
          points_used: 0,
          currency: 'BRL',
          created_at: o.created_at,
          items,
        })
      } catch (error) {
        console.error('Erro ao carregar pedido:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadOrder()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido não encontrado</h2>
          <p className="text-gray-600 mb-6">O pedido que você está procurando não existe.</p>
          <Button onClick={() => router.push('/store/orders')}>
            Ver Meus Pedidos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/store/orders')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Pedidos
          </Button>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-600 text-lg">
            Seu pedido foi processado com sucesso
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detalhes do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Número do Pedido:</span>
                  <span className="font-mono font-medium">{order.order_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Confirmado
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data:</span>
                  <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pontos Utilizados:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{order.points_used}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center border">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">{item.points} pontos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informações de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Status da Entrega</p>
                  <p className="text-sm text-gray-600">Preparando para envio</p>
                </div>
                <div>
                  <p className="font-medium">Prazo Estimado</p>
                  <p className="text-sm text-gray-600">3-5 dias úteis</p>
                </div>
                <div>
                  <p className="font-medium">Endereço de Entrega</p>
                  <p className="text-sm text-gray-600">
                    {user?.email}<br />
                    Endereço da empresa
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Comprovante
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => router.push('/store/catalog')}
                >
                  Continuar Comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium mb-1">Pedido Confirmado</h4>
                <p className="text-sm text-gray-600">Seu pedido foi processado</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-600 font-bold">2</span>
                </div>
                <h4 className="font-medium mb-1">Em Preparação</h4>
                <p className="text-sm text-gray-600">Produtos sendo preparados</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h4 className="font-medium mb-1">Entrega</h4>
                <p className="text-sm text-gray-600">Produtos enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
