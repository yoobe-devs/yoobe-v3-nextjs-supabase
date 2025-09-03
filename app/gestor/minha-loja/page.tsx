'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Users,
  TrendingUp,
  Settings,
  Edit,
  Eye,
  Plus,
  BarChart3,
  Activity,
  Calendar,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function MinhaLojaPage() {
  const [storeStats] = useState({
    totalProducts: 89,
    totalOrders: 156,
    totalCustomers: 234,
    totalRevenue: 'R$ 45.670,00',
    monthlyGrowth: '+23%',
    averageOrderValue: 'R$ 292,76',
    conversionRate: '4.2%',
    customerSatisfaction: '4.8/5.0'
  })

  const [storeConfig] = useState({
    name: 'Join Store',
    theme: 'Azul Corporativo',
    status: 'Ativa',
    domain: 'joinstore.yoobe.com',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    language: 'Português'
  })

  const [recentOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'João Silva',
      product: 'Camiseta Join',
      amount: 'R$ 89,90',
      status: 'Entregue',
      date: '2025-09-02'
    },
    {
      id: 'ORD-002',
      customer: 'Maria Santos',
      product: 'Mochila Corporativa',
      amount: 'R$ 129,90',
      status: 'Em Trânsito',
      date: '2025-09-01'
    },
    {
      id: 'ORD-003',
      customer: 'Pedro Costa',
      product: 'Caneca Personalizada',
      amount: 'R$ 29,90',
      status: 'Processando',
      date: '2025-08-31'
    }
  ])

  const [topProducts] = useState([
    {
      name: 'Camiseta Join',
      sales: 45,
      revenue: 'R$ 4.045,50',
      growth: '+18%'
    },
    {
      name: 'Mochila Corporativa',
      sales: 32,
      revenue: 'R$ 4.156,80',
      growth: '+25%'
    },
    {
      name: 'Caneca Personalizada',
      sales: 67,
      revenue: 'R$ 2.003,30',
      growth: '+12%'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue': return 'bg-green-100 text-green-800'
      case 'Em Trânsito': return 'bg-blue-100 text-blue-800'
      case 'Processando': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minha Loja</h1>
          <p className="text-gray-600">Gerencie sua loja corporativa e acompanhe o desempenho</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Loja
          </Button>
        </div>
      </div>

      {/* Store Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-6 w-6 mr-3 text-blue-600" />
            {storeConfig.name}
          </CardTitle>
          <CardDescription>
            Sua loja corporativa está funcionando perfeitamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tema</p>
              <p className="font-semibold">{storeConfig.theme}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {storeConfig.status}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Domínio</p>
              <p className="font-semibold text-sm">{storeConfig.domain}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Moeda</p>
              <p className="font-semibold">{storeConfig.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Clientes únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{storeStats.monthlyGrowth}</span> este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.averageOrderValue}</div>
            <p className="text-xs text-muted-foreground">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.conversionRate}</div>
            <p className="text-xs text-muted-foreground">
              Visitantes → Clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.customerSatisfaction}</div>
            <p className="text-xs text-muted-foreground">
              Avaliação dos clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{storeStats.monthlyGrowth}</div>
            <p className="text-xs text-muted-foreground">
              vs. mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Pedidos Recentes
            </CardTitle>
            <CardDescription>
              Últimos pedidos da sua loja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.product}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.amount}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/gestor/pedidos">
                <Button variant="outline" className="w-full">
                  Ver Todos os Pedidos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Produtos Mais Vendidos
            </CardTitle>
            <CardDescription>
              Top produtos por vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} vendas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.revenue}</p>
                    <p className="text-sm text-green-600">{product.growth}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/gestor/produtos">
                <Button variant="outline" className="w-full">
                  Ver Todos os Produtos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/gestor/produtos">
              <Button className="w-full" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Gerenciar Produtos
              </Button>
            </Link>
            <Link href="/gestor/pedidos">
              <Button className="w-full" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Pedidos
              </Button>
            </Link>
            <Link href="/gestor/configuracoes">
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
