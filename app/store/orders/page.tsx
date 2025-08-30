"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Star
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"

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

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    productName: "Camiseta Join Tecnologia",
    productImage: "https://via.placeholder.com/100x100/1e40af/ffffff?text=Camiseta",
    status: "delivered",
    date: "2024-01-15",
    points: 150,
    quantity: 1,
    trackingCode: "BR123456789BR",
    estimatedDelivery: "2024-01-18"
  },
  {
    id: "ORD-2024-002",
    productName: "Mochila Corporativa",
    productImage: "https://via.placeholder.com/100x100/3b82f6/ffffff?text=Mochila",
    status: "shipped",
    date: "2024-01-14",
    points: 300,
    quantity: 1,
    trackingCode: "BR987654321BR",
    estimatedDelivery: "2024-01-20"
  },
  {
    id: "ORD-2024-003",
    productName: "Caneca Personalizada",
    productImage: "https://via.placeholder.com/100x100/60a5fa/ffffff?text=Caneca",
    status: "processing",
    date: "2024-01-13",
    points: 80,
    quantity: 2,
    estimatedDelivery: "2024-01-22"
  },
  {
    id: "ORD-2024-004",
    productName: "Boné Join",
    productImage: "https://via.placeholder.com/100x100/1e40af/ffffff?text=Boné",
    status: "pending",
    date: "2024-01-12",
    points: 120,
    quantity: 1,
    estimatedDelivery: "2024-01-25"
  }
]

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const statuses = ["all", "pending", "processing", "shipped", "delivered", "cancelled"]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
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
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
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
        return "border-green-200 bg-green-50"
      case 'shipped':
        return "border-blue-200 bg-blue-50"
      case 'processing':
        return "border-yellow-200 bg-yellow-50"
      case 'pending':
        return "border-gray-200 bg-gray-50"
      case 'cancelled':
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size="lg" />
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === "all" ? "Todos os Status" : 
                 status === "pending" ? "Pendente" :
                 status === "processing" ? "Processando" :
                 status === "shipped" ? "Enviado" :
                 status === "delivered" ? "Entregue" :
                 status === "cancelled" ? "Cancelado" : status}
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
        {filteredOrders.map((order) => (
          <Card key={order.id} className={`border-2 ${getStatusColor(order.status)}`}>
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
                        <h3 className="font-semibold text-lg">{order.productName}</h3>
                        <p className="text-sm text-gray-600">Pedido #{order.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Data do Pedido</p>
                        <p className="font-medium">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
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
                          <p className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                    </div>

                    {order.trackingCode && (
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Código de Rastreamento</p>
                            <p className="font-mono text-sm font-medium">{order.trackingCode}</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou termos de busca</p>
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
                    {filteredOrders.reduce((sum, order) => sum + order.points, 0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredOrders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredOrders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


