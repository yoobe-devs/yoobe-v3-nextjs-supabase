'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  user_id: string
  company_id: string
  total_amount: number
  points_used: number
  payment_method: string
  status: string
  shipping_address: string
  tracking_code: string
  created_at: string
  updated_at: string
  users: {
    id: string
    full_name: string
    email: string
  }
  order_items: {
    id: string
    quantity: number
    unit_price: number
    points_cost: number
    company_products: {
      id: string
      name: string
      image_url: string
    }
  }[]
}

export default function PedidosPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/gestor/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/gestor/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Status do pedido atualizado!')
        loadOrders()
      } else {
        throw new Error('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status do pedido')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>
      case 'confirmed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Confirmado</Badge>
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><Truck className="h-3 w-3" /> Enviado</Badge>
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><Package className="h-3 w-3" /> Entregue</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'points':
        return <Badge variant="outline">Pontos</Badge>
      case 'money':
        return <Badge variant="outline">Dinheiro</Badge>
      case 'mixed':
        return <Badge variant="outline">Misto</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || !selectedStatus || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const totalOrders = orders.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
              <p className="text-gray-600 mt-2">
                Gerencie os pedidos da sua loja
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Todos os pedidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Valor total dos pedidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por cliente ou ID do pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <div className="font-bold text-lg">R$ {order.total_amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">
                        {order.points_used > 0 && `${order.points_used} pontos`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold mb-2">Cliente</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nome:</strong> {order.users.full_name}</p>
                      <p><strong>Email:</strong> {order.users.email}</p>
                      <p><strong>Método:</strong> {getPaymentMethodBadge(order.payment_method)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {item.company_products.image_url ? (
                              <img
                                src={item.company_products.image_url}
                                alt={item.company_products.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.company_products.name}</p>
                            <p className="text-sm text-gray-600">
                              Qtd: {item.quantity} • R$ {item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">R$ {(item.quantity * item.unit_price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar Pedido
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Marcar como Enviado
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Marcar como Entregue
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus 
                ? 'Tente ajustar os filtros de busca' 
                : 'Ainda não há pedidos na sua loja'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
