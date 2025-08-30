"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Download, 
  FileText, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react"

interface TrackingOrder {
  id: string
  orderNumber: string
  buyer: string
  email: string
  trackingNumber: string
  shippedDate: string
  estimatedDelivery: string
  products: string[]
  status: 'created' | 'shipped' | 'delivered' | 'incident'
  statusText: string
}

const mockOrders: TrackingOrder[] = [
  {
    id: '1',
    orderNumber: 'R599941071',
    buyer: 'Vinicius Mattos Ferreira',
    email: 'vinicius.mattos@jointecnologia.com.br',
    trackingNumber: 'YOOB8002896',
    shippedDate: '29/08/2025',
    estimatedDelivery: '31/08/2025',
    products: ['1 x Itens surpresa - Onboarding Join', '1 x Camiseta Join'],
    status: 'created',
    statusText: 'Envio criado'
  },
  {
    id: '2',
    orderNumber: 'R241780818',
    buyer: 'Allan Renato Rosa de Oliveira Silva',
    email: 'allan.rosa@jointecnologia.com.br',
    trackingNumber: 'YOOB7931864',
    shippedDate: '20/08/2025',
    estimatedDelivery: '22/08/2025',
    products: ['2 x Meia Join - Filhos'],
    status: 'delivered',
    statusText: 'Entregue'
  },
  {
    id: '3',
    orderNumber: 'R767474391',
    buyer: 'Samuel Brasil Guimaraes',
    email: 'samuel.guimaraes@jointecnologia.com.br',
    trackingNumber: 'YOOB7913769',
    shippedDate: '19/08/2025',
    estimatedDelivery: '27/08/2025',
    products: ['1 x Meia Join - Pais', '1 x Meia Join - Filhos'],
    status: 'incident',
    statusText: 'Envio com incidente'
  },
  {
    id: '4',
    orderNumber: 'R123456789',
    buyer: 'Maria Silva Santos',
    email: 'maria.silva@jointecnologia.com.br',
    trackingNumber: 'YOOB8001234',
    shippedDate: '25/08/2025',
    estimatedDelivery: '27/08/2025',
    products: ['1 x Boné Join', '1 x Caneca Join'],
    status: 'shipped',
    statusText: 'Em trânsito'
  },
  {
    id: '5',
    orderNumber: 'R987654321',
    buyer: 'João Pedro Costa',
    email: 'joao.costa@jointecnologia.com.br',
    trackingNumber: 'YOOB8005678',
    shippedDate: '22/08/2025',
    estimatedDelivery: '24/08/2025',
    products: ['1 x Mochila Join'],
    status: 'delivered',
    statusText: 'Entregue'
  }
]

export default function SwagTrackPage() {
  const [orders, setOrders] = useState<TrackingOrder[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string, statusText: string) => {
    switch (status) {
      case 'created':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{statusText}</Badge>
      case 'shipped':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{statusText}</Badge>
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{statusText}</Badge>
      case 'incident':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{statusText}</Badge>
      default:
        return <Badge>{statusText}</Badge>
    }
  }

  const exportToCSV = () => {
    const headers = ['Pedido', 'Comprador', 'E-mail', 'Número de rastreio', 'Saiu para entrega', 'Previsão para entrega', 'Produto', 'Status']
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.buyer,
        order.email,
        order.trackingNumber,
        order.shippedDate,
        order.estimatedDelivery,
        order.products.join('; '),
        order.statusText
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'swag-track-export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Swag Track</h1>
        <p className="text-gray-600 mb-4">
          Realizamos uma atualização nos rastreios para melhorar a experiência. 
          Para consultar envios de antigos até Janeiro de 2025{" "}
          <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-500">
            Clique aqui
          </Button>
        </p>
      </div>

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar por pedido, comprador, email ou rastreio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar em CSV
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          Todos ({orders.length})
        </Button>
        <Button
          variant={filterStatus === "created" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("created")}
          className="bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          Envio criado ({orders.filter(o => o.status === "created").length})
        </Button>
        <Button
          variant={filterStatus === "shipped" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("shipped")}
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        >
          Em trânsito ({orders.filter(o => o.status === "shipped").length})
        </Button>
        <Button
          variant={filterStatus === "delivered" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("delivered")}
          className="bg-green-100 text-green-800 hover:bg-green-200"
        >
          Entregue ({orders.filter(o => o.status === "delivered").length})
        </Button>
        <Button
          variant={filterStatus === "incident" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("incident")}
          className="bg-red-100 text-red-800 hover:bg-red-200"
        >
          Com incidente ({orders.filter(o => o.status === "incident").length})
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Rastreamento de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Pedido</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Comprador</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">E-mail</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Número de rastreio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Saiu para entrega</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Previsão para entrega</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Acompanhe</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.buyer}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{order.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-gray-900">{order.trackingNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{order.shippedDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{order.estimatedDelivery}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.products.map((product, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {product}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(order.status, order.statusText)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          // Aqui você pode implementar a lógica para abrir o rastreamento
                          window.open(`https://rastreamento.yoobe.com.br/${order.trackingNumber}`, '_blank')
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum pedido encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Em Trânsito</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === "shipped").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Entregues</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === "delivered").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Com Incidente</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === "incident").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

