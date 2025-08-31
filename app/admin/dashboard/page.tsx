"use client"

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Star,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  users: {
    total: number
    active: number
    inactive: number
  }
  companies: {
    total: number
    active: number
    inactive: number
  }
  products: {
    total: number
    active: number
    outOfStock: number
    totalValue: number
  }
  orders: {
    total: number
    pending: number
    confirmed: number
    totalValue: number
  }
}

interface RecentActivity {
  id: string
  type: 'user' | 'company' | 'product' | 'order'
  action: string
  description: string
  timestamp: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // Dados mockados para evitar travamentos
  const stats: DashboardStats = {
    users: { total: 15, active: 12, inactive: 3 },
    companies: { total: 8, active: 7, inactive: 1 },
    products: { total: 45, active: 42, outOfStock: 3, totalValue: 12500.50 },
    orders: { total: 23, pending: 5, confirmed: 18, totalValue: 8750.25 }
  }

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'product',
      action: 'created',
      description: 'Novo produto "Camiseta Join Tecnologia" foi criado',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      type: 'order',
      action: 'confirmed',
      description: 'Pedido ORD-123456 foi confirmado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      id: '3',
      type: 'user',
      action: 'registered',
      description: 'Novo usuário "João Silva" se registrou',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    },
    {
      id: '4',
      type: 'company',
      action: 'created',
      description: 'Nova empresa "Join Tecnologia" foi criada',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    }
  ]

  // Memoizar funções para evitar recálculos desnecessários
  const getActivityIcon = useMemo(() => (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />
      case 'company':
        return <Building2 className="h-4 w-4" />
      case 'product':
        return <Package className="h-4 w-4" />
      case 'order':
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }, [])

  const getActivityColor = useMemo(() => (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-600 bg-blue-100'
      case 'company':
        return 'text-green-600 bg-green-100'
      case 'product':
        return 'text-purple-600 bg-purple-100'
      case 'order':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }, [])

  useEffect(() => {
    // Simular carregamento rápido
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Visão geral da plataforma</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuários */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                  <p className="text-xs text-gray-500">
                    {stats.users.active} ativos, {stats.users.inactive} inativos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empresas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Empresas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.companies.total}</p>
                  <p className="text-xs text-gray-500">
                    {stats.companies.active} ativas, {stats.companies.inactive} inativas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.products.total}</p>
                  <p className="text-xs text-gray-500">
                    {stats.products.active} ativos, {stats.products.outOfStock} sem estoque
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.orders.total}</p>
                  <p className="text-xs text-gray-500">
                    {stats.orders.pending} pendentes, {stats.orders.confirmed} confirmados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Valor Total em Produtos
              </CardTitle>
              <CardDescription>
                Valor total do inventário de produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                R$ {stats.products.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Baseado no preço e estoque atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Valor Total em Pedidos
              </CardTitle>
              <CardDescription>
                Valor total de todos os pedidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {stats.orders.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Incluindo pedidos confirmados e pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => router.push('/admin/usuarios')}
          >
            <Users className="h-6 w-6 mb-2" />
            <span>Gerenciar Usuários</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => router.push('/admin/empresas')}
          >
            <Building2 className="h-6 w-6 mb-2" />
            <span>Gerenciar Empresas</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => router.push('/admin/produtos')}
          >
            <Package className="h-6 w-6 mb-2" />
            <span>Gerenciar Produtos</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => router.push('/admin/pedidos')}
          >
            <ShoppingCart className="h-6 w-6 mb-2" />
            <span>Ver Pedidos</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atividades na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
