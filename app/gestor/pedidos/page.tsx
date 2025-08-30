"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  Package,
  User,
  Calendar,
  DollarSign,
  Star,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { 
  getCompanyOrders, 
  updateOrderStatus,
  type CompanyOrder 
} from "@/lib/queries/gestor"

export default function GestorPedidosPage() {
  const [orders, setOrders] = useState<CompanyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<CompanyOrder | null>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getCompanyOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: CompanyOrder['status']) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus)
      if (updatedOrder) {
        setOrders(prev => 
          prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
        )
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder)
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">Enviado</Badge>
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Entregue</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'processing':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-600" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.employee_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos da Empresa</h1>
            <p className="text-gray-600">Acompanhe e gerencie os pedidos dos funcionários</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">{order.employee_name}</p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">R$ {order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{order.points_used} pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{order.items.length} itens</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Details */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detalhes do Pedido
                </CardTitle>
                <CardDescription>
                  {selectedOrder.order_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-semibold">R$ {selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pontos Utilizados</span>
                    <span className="font-semibold">{selectedOrder.points_used}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data</span>
                    <span className="font-semibold">
                      {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Employee Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Funcionário</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{selectedOrder.employee_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{selectedOrder.employee_email}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-600">Qtd: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">R$ {item.unit_price.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">Total: R$ {item.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Atualizar Status</h4>
                  <div className="space-y-2">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleUpdateStatus(selectedOrder.id, status as CompanyOrder['status'])}
                        disabled={selectedOrder.status === status}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-2">
                          {status === 'pending' ? 'Pendente' :
                           status === 'processing' ? 'Processando' :
                           status === 'shipped' ? 'Enviado' :
                           status === 'delivered' ? 'Entregue' :
                           status === 'cancelled' ? 'Cancelado' : status}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Pedido</h3>
                <p className="text-gray-600">Clique em um pedido para ver os detalhes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
