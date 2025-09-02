'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Crown
} from 'lucide-react'
import Link from 'next/link'

export default function AdminGlobalDashboard() {
  // Mock data for demonstration
  const stats = {
    totalUsers: 1248,
    totalQuotes: 156,
    totalReplications: 89,
    totalOrders: 342,
    totalRevenue: 125000,
    pendingQuotes: 23,
    failedReplications: 5,
    activeCompanies: 12
  }

  const recentActivity = [
    {
      id: '1',
      type: 'quote_approved',
      message: 'Orçamento #Q-001 aprovado para TechCorp',
      time: '2 minutos atrás',
      status: 'success'
    },
    {
      id: '2',
      type: 'replication_completed',
      message: 'Replicação concluída para 15 produtos',
      time: '15 minutos atrás',
      status: 'success'
    },
    {
      id: '3',
      type: 'quote_rejected',
      message: 'Orçamento #Q-002 rejeitado por valores',
      time: '1 hora atrás',
      status: 'error'
    },
    {
      id: '4',
      type: 'new_company',
      message: 'Nova empresa cadastrada: InovaçãoTech',
      time: '2 horas atrás',
      status: 'info'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin Global</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma Yoobe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Nova Replicação
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> em relação ao mês passado
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
              <span className="text-red-600">{stats.pendingQuotes}</span> pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replicações</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReplications}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stats.failedReplications}</span> falharam
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
              <span className="text-green-600">+8.2%</span> em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Empresas Ativas
            </CardTitle>
            <CardDescription>
              Visão geral das empresas na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de Empresas</span>
                <Badge variant="outline">{stats.activeCompanies}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Empresas Premium</span>
                <Badge variant="default">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Novas este mês</span>
                <Badge variant="secondary">3</Badge>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/admin-global/companies">
                <Button variant="outline" className="w-full">
                  Ver Todas as Empresas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Pedidos Recentes
            </CardTitle>
            <CardDescription>
              Últimos pedidos processados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de Pedidos</span>
                <Badge variant="outline">{stats.totalOrders}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pedidos Hoje</span>
                <Badge variant="default">24</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Valor Médio</span>
                <Badge variant="secondary">
                  {formatCurrency(stats.totalRevenue / stats.totalOrders)}
                </Badge>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/admin-global/orders">
                <Button variant="outline" className="w-full">
                  Ver Todos os Pedidos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas ações na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button variant="outline" className="w-full">
              Ver Todas as Atividades
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin-global/quotes">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <FileText className="w-6 h-6" />
                <span>Gerenciar Orçamentos</span>
              </Button>
            </Link>
            
            <Link href="/admin-global/replications">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Package className="w-6 h-6" />
                <span>Monitorar Replicações</span>
              </Button>
            </Link>
            
            <Link href="/admin-global/users">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span>Gerenciar Usuários</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
