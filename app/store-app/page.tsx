'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ShoppingCart, 
  Package, 
  Gift, 
  CreditCard,
  MapPin,
  User,
  Plus,
  Eye
} from 'lucide-react'
import Link from 'next/link'

export default function StoreDashboard() {
  const [stats] = useState({
    pointsBalance: 1250,
    totalOrders: 12,
    completedOrders: 10,
    pendingOrders: 2,
    totalSpent: 'R$ 890,00',
    availableProducts: 89,
    recentRewards: 3
  })

  const [recentOrders] = useState([
    {
      id: 1,
      product: 'Camiseta Corporativa',
      status: 'delivered',
      date: '2024-01-15',
      points: 150
    },
    {
      id: 2,
      product: 'Mochila Executiva',
      status: 'shipped',
      date: '2024-01-20',
      points: 300
    },
    {
      id: 3,
      product: 'Garrafa Térmica',
      status: 'delivered',
      date: '2024-01-10',
      points: 80
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue'
      case 'shipped': return 'Enviado'
      case 'pending': return 'Pendente'
      default: return 'Desconhecido'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minha Loja</h1>
          <p className="text-gray-600">Bem-vindo! Aqui você pode resgatar produtos com seus pontos.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ir ao Checkout
          </Button>
        </div>
      </div>

      {/* Points Balance Card */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Saldo de Pontos
          </CardTitle>
          <CardDescription className="text-green-100">
            Use seus pontos para resgatar produtos incríveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.pointsBalance} pontos</div>
          <p className="text-sm text-green-100 mt-2">
            Equivalente a aproximadamente R$ {Math.round(stats.pointsBalance * 0.8)}
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.completedOrders}</span> completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Disponíveis</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableProducts}</div>
            <p className="text-xs text-muted-foreground">
              Catálogo ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              Em pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recompensas Recentes</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentRewards}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Checkout
            </CardTitle>
            <CardDescription>
              Faça seu pedido e resgate produtos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/store-app/checkout">
              <Button className="w-full">
                Ir ao Checkout
              </Button>
            </Link>
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Carrinho
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Perfil
            </CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/store-app/profile">
              <Button className="w-full" variant="outline">
                Ver Perfil
              </Button>
            </Link>
            <Link href="/store-app/profile/addresses">
              <Button className="w-full" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Endereços
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Catálogo
            </CardTitle>
            <CardDescription>
              Explore produtos disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Produtos
            </Button>
            <Button className="w-full" variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Favoritos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>
            Acompanhe o status dos seus últimos pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{order.product}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.points} pontos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/store-app/orders">
              <Button variant="outline">
                Ver Todos os Pedidos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
