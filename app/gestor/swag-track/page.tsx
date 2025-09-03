'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Truck, 
  Package, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Eye,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader
} from 'lucide-react'

export default function SwagTrackPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const [orders] = useState([
    {
      id: 'ORD-001',
      customer: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      products: ['Camiseta Join Tech', 'Mochila Corporativa'],
      total: 'R$ 219,80',
      status: 'entregue',
      trackingNumber: 'BR123456789BR',
      estimatedDelivery: '2025-09-01',
      actualDelivery: '2025-08-30',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      notes: 'Entregue no portão da empresa'
    },
    {
      id: 'ORD-002',
      customer: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
      products: ['Caneca Personalizada', 'Mouse Pad'],
      total: 'R$ 49,80',
      status: 'em-transito',
      trackingNumber: 'BR987654321BR',
      estimatedDelivery: '2025-09-05',
      actualDelivery: null,
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      notes: 'Em trânsito para entrega'
    },
    {
      id: 'ORD-003',
      customer: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      phone: '(11) 77777-7777',
      products: ['Garrafa Térmica'],
      total: 'R$ 79,90',
      status: 'processando',
      trackingNumber: 'BR456789123BR',
      estimatedDelivery: '2025-09-08',
      actualDelivery: null,
      address: 'Rua Augusta, 500 - São Paulo, SP',
      notes: 'Aguardando confirmação de pagamento'
    },
    {
      id: 'ORD-004',
      customer: 'Ana Oliveira',
      email: 'ana.oliveira@email.com',
      phone: '(11) 66666-6666',
      products: ['Post-it Personalizado', 'Caneca Personalizada'],
      total: 'R$ 45,80',
      status: 'pendente',
      trackingNumber: null,
      estimatedDelivery: '2025-09-10',
      actualDelivery: null,
      address: 'Rua Oscar Freire, 200 - São Paulo, SP',
      notes: 'Aguardando aprovação do gestor'
    },
    {
      id: 'ORD-005',
      customer: 'Carlos Ferreira',
      email: 'carlos.ferreira@email.com',
      phone: '(11) 55555-5555',
      products: ['Mochila Corporativa', 'Garrafa Térmica'],
      total: 'R$ 209,80',
      status: 'cancelado',
      trackingNumber: null,
      estimatedDelivery: '2025-09-12',
      actualDelivery: null,
      address: 'Rua Haddock Lobo, 150 - São Paulo, SP',
      notes: 'Cancelado pelo cliente'
    }
  ])

  const [stats] = useState({
    totalOrders: 156,
    deliveredOrders: 89,
    inTransitOrders: 34,
    processingOrders: 23,
    pendingOrders: 8,
    cancelledOrders: 2,
    onTimeDelivery: '94%',
    averageDeliveryTime: '3.2 dias'
  })

  const statuses = [
    { value: 'all', label: 'Todos os Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processando', label: 'Processando', color: 'bg-blue-100 text-blue-800' },
    { value: 'em-transito', label: 'Em Trânsito', color: 'bg-purple-100 text-purple-800' },
    { value: 'entregue', label: 'Entregue', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ]

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="h-4 w-4" />
      case 'processando': return <Loader className="h-4 w-4" />
      case 'em-transito': return <Truck className="h-4 w-4" />
      case 'entregue': return <CheckCircle className="h-4 w-4" />
      case 'cancelado': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'processando': return 'Processando'
      case 'em-transito': return 'Em Trânsito'
      case 'entregue': return 'Entregue'
      case 'cancelado': return 'Cancelado'
      default: return 'Desconhecido'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getDeliveryStatus = (order: any) => {
    if (order.status === 'entregue') {
      return 'Entregue com sucesso'
    } else if (order.status === 'em-transito') {
      return 'Em trânsito para entrega'
    } else if (order.status === 'processando') {
      return 'Processando pedido'
    } else if (order.status === 'pendente') {
      return 'Aguardando aprovação'
    } else if (order.status === 'cancelado') {
      return 'Pedido cancelado'
    }
    return 'Status desconhecido'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Swag Track</h1>
          <p className="text-gray-600">Rastreie e acompanhe todas as entregas de brindes</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Status
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Todos os pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.onTimeDelivery}</span> no prazo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransitOrders}</div>
            <p className="text-xs text-muted-foreground">
              A caminho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDeliveryTime}</div>
            <p className="text-xs text-muted-foreground">
              Para entrega
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statuses.slice(1).map((status) => (
          <Card key={status.value} className="text-center">
            <CardContent className="pt-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${status.color} mb-3`}>
                {getStatusIcon(status.value)}
              </div>
              <div className="text-2xl font-bold">
                {orders.filter(order => order.status === status.value).length}
              </div>
              <p className="text-sm text-gray-600">{status.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, ID do pedido ou número de rastreamento..."
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
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </Badge>
                  <span className="text-sm text-gray-500">#{order.id}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{order.customer}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{order.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{order.phone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">{order.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>Entrega: {order.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products and Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Produtos:</p>
                    <div className="space-y-1">
                      {order.products.map((product, index) => (
                        <p key={index} className="text-sm font-medium">• {product}</p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total:</p>
                    <p className="text-xl font-bold">{order.total}</p>
                  </div>
                </div>
              </div>

              {/* Tracking and Status */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status da Entrega:</p>
                    <p className="font-medium">{getDeliveryStatus(order)}</p>
                    {order.notes && (
                      <p className="text-xs text-gray-500 mt-1">{order.notes}</p>
                    )}
                  </div>
                  <div>
                    {order.trackingNumber ? (
                      <div>
                        <p className="text-sm text-gray-600">Número de Rastreamento:</p>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                          {order.trackingNumber}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Sem rastreamento</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou verificar se há novos pedidos
              </p>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie as entregas de brindes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Status
            </Button>
            <Button variant="outline" className="w-full">
              <Truck className="h-4 w-4 mr-2" />
              Nova Entrega
            </Button>
            <Button variant="outline" className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
