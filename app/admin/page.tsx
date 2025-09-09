'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  FileText, 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalBudgets: number
  pendingBudgets: number
  totalUsers: number
  totalCompanies: number
  totalRevenue: number
  totalPoints: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  status: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalBudgets: 0,
    pendingBudgets: 0,
    totalUsers: 0,
    totalCompanies: 0,
    totalRevenue: 0,
    totalPoints: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Carregar estatísticas
      const [
        { count: productsCount },
        { count: budgetsCount },
        { count: usersCount },
        { count: companiesCount }
      ] = await Promise.all([
        supabase.from('products_base').select('*', { count: 'exact', head: true }),
        supabase.from('budgets').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true })
      ])

      // Carregar produtos ativos
      const { count: activeProductsCount } = await supabase
        .from('products_base')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

      // Carregar orçamentos pendentes
      const { count: pendingBudgetsCount } = await supabase
        .from('budgets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')

      // Calcular receita total (simulado)
      const totalRevenue = (budgetsCount || 0) * 1500 // Média por orçamento
      const totalPoints = (productsCount || 0) * 500 // Média de pontos por produto

      setStats({
        totalProducts: productsCount || 0,
        activeProducts: activeProductsCount || 0,
        totalBudgets: budgetsCount || 0,
        pendingBudgets: pendingBudgetsCount || 0,
        totalUsers: usersCount || 0,
        totalCompanies: companiesCount || 0,
        totalRevenue,
        totalPoints
      })

      // Carregar atividades recentes (simulado)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'budget_created',
          title: 'Novo Orçamento Criado',
          description: 'Orçamento #1234 foi criado para Yoobe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'product_updated',
          title: 'Produto Atualizado',
          description: 'Camiseta Personalizada foi atualizada',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'user_registered',
          title: 'Novo Usuário Registrado',
          description: 'João Silva foi registrado como gestor',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: '4',
          type: 'budget_approved',
          title: 'Orçamento Aprovado',
          description: 'Orçamento #1230 foi aprovado pelo gestor',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ]

      setRecentActivity(mockActivity)

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar dados na montagem
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Formatar pontos
  const formatPoints = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  // Formatar data relativa
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    return `${Math.floor(diffInHours / 24)}d atrás`
  }

  // Obter ícone da atividade
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'budget_created':
      case 'budget_approved':
        return <FileText className="h-5 w-5" />
      case 'product_updated':
        return <Package className="h-5 w-5" />
      case 'user_registered':
        return <Users className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600">Visão geral do sistema Yoobe v3.1.0</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => router.push('/admin/products-base')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeProducts}</span> ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBudgets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">{stats.pendingBudgets}</span> pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{stats.totalCompanies}</span> empresas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPoints(stats.totalPoints)} pontos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/products-base')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Gerenciar Produtos</h3>
                <p className="text-sm text-gray-600">Criar e editar produtos base</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/budgets')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Criar Orçamento</h3>
                <p className="text-sm text-gray-600">Montar orçamento personalizado</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Usuários</h3>
                <p className="text-sm text-gray-600">Gerenciar usuários do sistema</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Atividades Recentes</span>
          </CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluído
                        </>
                      ) : activity.status === 'pending' ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Erro
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => router.push('/admin/reports')}>
              Ver Todas as Atividades
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sistema</CardTitle>
            <CardDescription>Status dos serviços</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Supabase</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Banco de Dados</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Autenticação</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Webhooks</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Configurando
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Ações</CardTitle>
            <CardDescription>Recomendações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">Configurar webhooks para Cubbo</p>
                <p className="text-xs text-gray-500">Integração com sistema de estoque</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">Revisar orçamentos pendentes</p>
                <p className="text-xs text-gray-500">{stats.pendingBudgets} orçamentos aguardando</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">Atualizar produtos inativos</p>
                <p className="text-xs text-gray-500">{stats.totalProducts - stats.activeProducts} produtos inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
