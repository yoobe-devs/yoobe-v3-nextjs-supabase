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
  Download,
  Calendar,
  User,
  Store,
  Package,
  DollarSign
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  company_name: string
  store_name: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  items_count: number
  created_at: string
  updated_at: string
}

const mockOrders: Order[] = [
  {
    id: "1",
    order_number: "ORD-2024-001",
    customer_name: "João Silva",
    customer_email: "joao.silva@jointecnologia.com",
    company_name: "Join Tecnologia",
    store_name: "Loja Corporativa Join",
    status: "delivered",
    total_amount: 150.00,
    items_count: 2,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-18T14:20:00Z"
  },
  {
    id: "2",
    order_number: "ORD-2024-002",
    customer_name: "Maria Oliveira",
    customer_email: "maria.oliveira@techcorp.com",
    company_name: "TechCorp Solutions",
    store_name: "Loja TechCorp",
    status: "processing",
    total_amount: 200.00,
    items_count: 3,
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-17T11:45:00Z"
  },
  {
    id: "3",
    order_number: "ORD-2024-003",
    customer_name: "Pedro Santos",
    customer_email: "pedro.santos@jointecnologia.com",
    company_name: "Join Tecnologia",
    store_name: "Loja Corporativa Join",
    status: "pending",
    total_amount: 100.00,
    items_count: 1,
    created_at: "2024-01-17T16:20:00Z",
    updated_at: "2024-01-17T16:20:00Z"
  },
  {
    id: "4",
    order_number: "ORD-2024-004",
    customer_name: "Ana Costa",
    customer_email: "ana.costa@techcorp.com",
    company_name: "TechCorp Solutions",
    store_name: "Loja TechCorp",
    status: "shipped",
    total_amount: 300.00,
    items_count: 4,
    created_at: "2024-01-14T13:45:00Z",
    updated_at: "2024-01-16T08:30:00Z"
  }
]

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState("all")

  const statuses = ["all", "pending", "processing", "shipped", "delivered", "cancelled"]
  const companies = ["all", "Join Tecnologia", "TechCorp Solutions", "Inovação Digital"]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    const matchesCompany = selectedCompany === "all" || order.company_name === selectedCompany
    return matchesSearch && matchesStatus && matchesCompany
  })

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
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
            <p className="text-gray-600">Gerencie todos os pedidos do sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Eye className="h-4 w-4 mr-2" />
            Ver Relatórios
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalOrders}
            </div>
            <p className="text-sm text-gray-500">Pedidos realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {totalRevenue.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Valor total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {averageOrderValue.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Por pedido</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-500">Aguardando processamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os pedidos por número, cliente, empresa ou status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número do pedido, cliente ou email..."
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
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'Todos os Status' : 
                     status === 'pending' ? 'Pendente' :
                     status === 'processing' ? 'Processando' :
                     status === 'shipped' ? 'Enviado' :
                     status === 'delivered' ? 'Entregue' : 'Cancelado'}
                  </option>
                ))}
              </select>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {companies.map(company => (
                  <option key={company} value={company}>
                    {company === 'all' ? 'Todas as Empresas' : company}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
          <CardDescription>Lista de todos os pedidos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {order.customer_name}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Store className="h-3 w-3" />
                        {order.store_name}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {order.items_count} itens
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Criado em: {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">R$ {order.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.customer_email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


