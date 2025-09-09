'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Star,
} from 'lucide-react'
import { YoobeLogo } from '@/components/ui/yoobe-logo'
import { EmptyState } from '@/components/ui/empty-state'
import { getOrders } from '@/lib/queries/orders'

interface Order {
  id: string
  productName: string
  productImage: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  points: number
  quantity: number
  trackingCode?: string
  estimatedDelivery?: string
}

async function loadOrders(): Promise<Order[]> {
  try {
    const list = await getOrders()
    return (list || []).map((o: any) => {
      const firstItem = (o.order_items || [])[0]
      const name = firstItem?.products?.name || 'Pedido com itens'
      const qty = firstItem?.quantity || 1
      return {
        id: o.id,
        productName: name,
        productImage: '/placeholder-product.jpg',
        status: (o.status || 'pending') as Order['status'],
        date: o.created_at,
        points: 0,
        quantity: qty,
        trackingCode: undefined,
        estimatedDelivery: undefined,
      }
    })
  } catch (e) {
    return []
  }
}

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  const statuses = [
    'all',
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]

  // Carregar pedidos
  useEffect(() => {
    const loadOrdersData = async () => {
      try {
        setLoading(true)
        const ordersData = await loadOrders()
        setOrders(ordersData)
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrdersData()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Empty state quando não há pedidos
  if (!loading && orders.length === 0) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
            <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
          </div>
        </div>

        {/* Empty State */}
        <EmptyState
          icon={Package}
          title="Nenhum pedido encontrado"
          description="Você ainda não fez nenhum pedido. Explore o catálogo e resgate produtos com seus pontos!"
          primaryAction={{
            label: 'Explorar Catálogo',
            onClick: () => (window.location.href = '/store/catalog'),
            icon: Package,
          }}
          secondaryAction={{
            label: 'Ver Dashboard',
            onClick: () => (window.location.href = '/store/dashboard'),
            icon: Star,
          }}
        />
      </div>
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      selectedStatus === 'all' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />
      case 'processing':
        return <Package className="h-4 w-4 text-yellow-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Entregue</Badge>
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>
      case 'processing':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
        )
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'border-green-200 bg-green-50'
      case 'shipped':
        return 'border-blue-200 bg-blue-50'
      case 'processing':
        return 'border-yellow-200 bg-yellow-50'
      case 'pending':
        return 'border-gray-200 bg-gray-50'
      case 'cancelled':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  useEffect(() => {
    ;(async () => {
      const data = await loadOrders()
      setOrders(data)
    })()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
            <p className="text-gray-600">Acompanhe seus resgates e entregas</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por produto ou número do pedido..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'Todos os Status'
                  : status === 'pending'
                    ? 'Pendente'
                    : status === 'processing'
                      ? 'Processando'
                      : status === 'shipped'
                        ? 'Enviado'
                        : status === 'delivered'
                          ? 'Entregue'
                          : status === 'cancelled'
                            ? 'Cancelado'
                            : status}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <Card
            key={order.id}
            className={`border-2 ${getStatusColor(order.status)}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {order.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pedido #{order.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Data do Pedido</p>
                        <p className="font-medium">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quantidade</p>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pontos Utilizados</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">{order.points}</span>
                        </div>
                      </div>
                      {order.estimatedDelivery && (
                        <div>
                          <p className="text-gray-600">Entrega Estimada</p>
                          <p className="font-medium">
                            {new Date(
                              order.estimatedDelivery
                            ).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>

                    {order.trackingCode && (
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              Código de Rastreamento
                            </p>
                            <p className="font-mono text-sm font-medium">
                              {order.trackingCode}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Rastrear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Total de Pontos</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="text-2xl font-bold">
                    {filteredOrders.reduce(
                      (sum, order) => sum + order.points,
                      0
                    )}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    filteredOrders.filter(order => order.status === 'delivered')
                      .length
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    filteredOrders.filter(order =>
                      ['pending', 'processing', 'shipped'].includes(
                        order.status
                      )
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
