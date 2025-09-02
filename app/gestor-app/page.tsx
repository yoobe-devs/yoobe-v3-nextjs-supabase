'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Package, 
  FileText, 
  ShoppingCart,
  TrendingUp,
  Plus,
  Eye
} from 'lucide-react'
import Link from 'next/link'

export default function GestorDashboard() {
  const [stats] = useState({
    totalUsers: 156,
    totalProducts: 89,
    totalQuotes: 23,
    totalOrders: 67,
    activeUsers: 142,
    pendingQuotes: 5,
    completedOrders: 58,
    revenue: 'R$ 12.450,00'
  })

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'user',
      action: 'Novo funcionário cadastrado',
      user: 'João Silva',
      time: '2 horas atrás'
    },
    {
      id: 2,
      type: 'quote',
      action: 'Orçamento aprovado',
      user: 'Maria Santos',
      time: '4 horas atrás'
    },
    {
      id: 3,
      type: 'order',
      action: 'Pedido enviado',
      user: 'Pedro Costa',
      time: '6 horas atrás'
    },
    {
      id: 4,
      type: 'product',
      action: 'Produto atualizado',
      user: 'Ana Oliveira',
      time: '1 dia atrás'
    }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />
      case 'quote': return <FileText className="h-4 w-4" />
      case 'order': return <ShoppingCart className="h-4 w-4" />
      case 'product': return <Package className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'quote': return 'bg-green-100 text-green-800'
      case 'order': return 'bg-purple-100 text-purple-800'
      case 'product': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Gestor</h1>
          <p className="text-gray-600">Bem-vindo de volta! Aqui está o resumo da sua empresa.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.activeUsers}</span> ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Catálogo disponível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">{stats.pendingQuotes}</span> pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.completedOrders}</span> completados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Receita Total
          </CardTitle>
          <CardDescription className="text-blue-100">
            Valor total dos pedidos processados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.revenue}</div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Gestão de Funcionários
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie seus funcionários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/gestor-app/users">
              <Button className="w-full" variant="outline">
                Ver Funcionários
              </Button>
            </Link>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Produtos
            </CardTitle>
            <CardDescription>
              Gerencie seu catálogo de produtos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/gestor-app/products">
              <Button className="w-full" variant="outline">
                Ver Produtos
              </Button>
            </Link>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Orçamentos
            </CardTitle>
            <CardDescription>
              Acompanhe solicitações e aprovações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/gestor-app/quotes">
              <Button className="w-full" variant="outline">
                Ver Orçamentos
              </Button>
            </Link>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas ações realizadas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">por {activity.user}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activity.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
