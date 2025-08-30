"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings,
  Edit,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react'

interface StoreStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  activeProducts: number
  pendingOrders: number
}

export default function MinhaLojaPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StoreStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    activeProducts: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados da loja
    const loadStoreData = async () => {
      try {
        // Aqui você faria a chamada real para a API
        // const response = await fetch('/api/gestor/store-stats')
        // const data = await response.json()
        
        // Dados mockados para demonstração
        setStats({
          totalProducts: 45,
          totalOrders: 89,
          totalCustomers: 156,
          totalRevenue: 12500,
          activeProducts: 38,
          pendingOrders: 5
        })
      } catch (error) {
        console.error('Erro ao carregar dados da loja:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStoreData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados da loja...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minha Loja</h1>
              <p className="text-gray-600 mt-2">
                Gerencie sua loja corporativa e acompanhe o desempenho
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.open('/store/dashboard', '_blank')}
              >
                <Eye className="h-4 w-4" />
                Visualizar Loja
              </Button>
              <Button className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +12% este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Configurações da Loja
              </CardTitle>
              <CardDescription>
                Personalize a aparência e comportamento da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Nome da Loja</h4>
                  <p className="text-sm text-gray-600">Loja Corporativa</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Tema</h4>
                  <p className="text-sm text-gray-600">Azul Corporativo</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Status</h4>
                  <Badge variant="default">Ativa</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gerenciamento Rápido
              </CardTitle>
              <CardDescription>
                Ações rápidas para gerenciar sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Funcionários
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Pedidos Recentes
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios de Vendas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atividades da sua loja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo pedido recebido</p>
                  <p className="text-xs text-gray-600">Pedido #1234 - R$ 150,00</p>
                </div>
                <span className="text-xs text-gray-500">2 min atrás</span>
              </div>
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Produto atualizado</p>
                  <p className="text-xs text-gray-600">Camiseta Corporativa - Estoque: 25</p>
                </div>
                <span className="text-xs text-gray-500">15 min atrás</span>
              </div>
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Funcionário adicionado</p>
                  <p className="text-xs text-gray-600">João Silva - joao@empresa.com</p>
                </div>
                <span className="text-xs text-gray-500">1 hora atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
