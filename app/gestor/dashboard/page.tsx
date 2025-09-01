"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
  Store,
  Star,
  UserPlus,
  Loader2
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { LogOut } from "lucide-react"
import { getGestorStats, type GestorStats } from "@/lib/queries/gestor"
import { toast } from "sonner"

export default function GestorDashboardPage() {
  const [stats, setStats] = useState<GestorStats>({
    totalEmployees: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeEmployees: 0,
    pendingOrders: 0,
    totalPointsDistributed: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const dashboardStats = await getGestorStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        toast.error('Erro ao carregar estatísticas')
        // Fallback para dados vazios se houver erro
        setStats({
          totalEmployees: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          activeEmployees: 0,
          pendingOrders: 0,
          totalPointsDistributed: 0,
          averageOrderValue: 0
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão da Empresa</h1>
            <p className="text-gray-600">Gerencie sua empresa, funcionários e produtos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => router.push('/gestor/configuracoes')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button onClick={() => router.push('/gestor/funcionarios')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Funcionários</p>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalEmployees}
                </p>
                <p className="text-xs text-green-600">
                  +{loading ? '...' : stats.activeEmployees} ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Produtos</p>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalProducts}
                </p>
                <p className="text-xs text-blue-600">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalOrders}
                </p>
                <p className="text-xs text-orange-600">
                  {loading ? '...' : stats.pendingOrders} pendentes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Receita</p>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `R$ ${stats.totalRevenue.toLocaleString()}`}
                </p>
                <p className="text-xs text-green-600">+12% este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/gestor/funcionarios')}
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Funcionários
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/gestor/produtos')}
            >
              <Package className="h-4 w-4 mr-2" />
              Gestão de Produtos
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/gestor/minha-loja')}
            >
              <Store className="h-4 w-4 mr-2" />
              Configurar Loja
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/gestor/pedidos')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Acompanhar Pedidos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas atividades da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando atividades...</span>
              </div>
            ) : stats.totalEmployees > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Funcionários cadastrados</p>
                    <p className="text-sm text-gray-600">{stats.totalEmployees} funcionários</p>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Produtos disponíveis</p>
                    <p className="text-sm text-gray-600">{stats.totalProducts} produtos</p>
                  </div>
                  <Badge variant="secondary">Disponível</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pedidos realizados</p>
                    <p className="text-sm text-gray-600">{stats.totalOrders} pedidos</p>
                  </div>
                  <Badge variant="secondary">Total</Badge>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
                <p className="text-sm text-gray-400">Comece adicionando funcionários e produtos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visão Geral dos Funcionários
          </CardTitle>
          <CardDescription>
            Status dos funcionários e atividades recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeEmployees}
                </span>
              </div>
              <p className="text-sm text-gray-600">Funcionários Ativos</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalPointsDistributed.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">Pontos Distribuídos</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalOrders}
                </span>
              </div>
              <p className="text-sm text-gray-600">Resgates Realizados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
