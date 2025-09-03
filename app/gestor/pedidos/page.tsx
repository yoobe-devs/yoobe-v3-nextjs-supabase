'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Truck,
  Package,
  BarChart3,
  Settings,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  CreditCard,
  Star
} from 'lucide-react'

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const [orders] = useState([
    {
      id: 'ORD-001',
      customer: 'João Silva',
      customerEmail: 'joao.silva@email.com',
      items: 3,
      totalAmount: 'R$ 450,00',
      totalPoints: 2250,
      status: 'delivered',
      paymentMethod: 'points',
      shippingAddress: 'Rua das Flores, 123 - São Paulo, SP',
      createdAt: '2025-01-02',
      deliveredAt: '2025-01-05',
      trackingNumber: 'BR123456789BR',
      rating: 5,
      notes: 'Entrega rápida e produtos de qualidade'
    },
    {
      id: 'ORD-002',
      customer: 'Maria Santos',
      customerEmail: 'maria.santos@email.com',
      items: 2,
      totalAmount: 'R$ 180,00',
      totalPoints: 900,
      status: 'shipped',
      paymentMethod: 'mixed',
      shippingAddress: 'Av. Paulista, 1000 - São Paulo, SP',
      createdAt: '2025-01-01',
      deliveredAt: null,
      trackingNumber: 'BR987654321BR',
      rating: null,
      notes: 'Cliente solicitou entrega expressa'
    },
    {
      id: 'ORD-003',
      customer: 'Pedro Oliveira',
      customerEmail: 'pedro.oliveira@email.com',
      items: 5,
      totalAmount: 'R$ 320,00',
      totalPoints: 1600,
      status: 'processing',
      paymentMethod: 'cash',
      shippingAddress: 'Rua Augusta, 500 - São Paulo, SP',
      createdAt: '2024-12-31',
      deliveredAt: null,
      trackingNumber: null,
      rating: null,
      notes: 'Aguardando confirmação de pagamento'
    },
    {
      id: 'ORD-004',
      customer: 'Ana Costa',
      customerEmail: 'ana.costa@email.com',
      items: 1,
      totalAmount: 'R$ 95,00',
      totalPoints: 475,
      status: 'cancelled',
      paymentMethod: 'points',
      shippingAddress: 'Rua Oscar Freire, 200 - São Paulo, SP',
      createdAt: '2024-12-30',
      deliveredAt: null,
      trackingNumber: null,
      rating: null,
      notes: 'Cancelado pelo cliente'
    }
  ])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue'
      case 'shipped': return 'Enviado'
      case 'processing': return 'Processando'
      case 'cancelled': return 'Cancelado'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'points': return 'Pontos'
      case 'cash': return 'Dinheiro'
      case 'mixed': return 'Misto'
      default: return method
    }
  }

  const statuses = ['delivered', 'shipped', 'processing', 'cancelled', 'pending']

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Pedidos</h1>
          <p className="text-gray-600">Acompanhe pedidos, entregas e satisfação dos clientes.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{orders.filter(o => o.status === 'delivered').length}</span> entregues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.replace('R$ ', '').replace(',', '')), 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: R$ {Math.round(orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.replace('R$ ', '').replace(',', '')), 0) / orders.length).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.reduce((sum, o) => sum + o.totalPoints, 0).toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round(orders.reduce((sum, o) => sum + o.totalPoints, 0) / orders.length).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{orders.filter(o => o.status === 'shipped').length}</span> enviados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Encontre pedidos específicos rapidamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por ID, cliente ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{getStatusText(status)}</option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
          <CardDescription>Lista completa de pedidos dos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.id}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="flex items-center text-sm text-gray-600">
                        <User className="h-3 w-3 mr-1" />
                        {order.customer}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs text-gray-500">
                        <Package className="h-3 w-3 mr-1" />
                        {order.items} itens
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{order.totalAmount}</div>
                    <p className="text-xs text-gray-500">{order.totalPoints.toLocaleString('pt-BR')} pontos</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    {order.rating && (
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < order.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right max-w-xs">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      Endereço
                    </div>
                    <p className="text-xs text-gray-600">{order.shippingAddress}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Truck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerenciar pedidos e entregas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              <span>Novo Pedido</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Truck className="h-6 w-6 mb-2" />
              <span>Rastrear Envios</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Relatórios</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span>Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
