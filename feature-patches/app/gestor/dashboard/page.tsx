'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  FileText,
  Download,
  Filter,
  Bell,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Componentes específicos
import { KpiCard } from './components/KpiCard'
import { DashboardFilters } from './components/DashboardFilters'
import { TimeSeriesChart } from './components/TimeSeriesChart'
import { FunnelChart as CustomFunnelChart } from './components/FunnelChart'
import { RankChart } from './components/RankChart'
import { InteractionsFeed } from './components/InteractionsFeed'
import { NotificationsBell } from './components/NotificationsBell'

export default function GestorDashboard() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [filters, setFilters] = useState({
    period: '30d',
    department: 'all',
    tags: 'all',
    category: 'all',
    method: 'all',
  })

  useEffect(() => {
    loadAnalytics()
  }, [
    filters.period,
    filters.department,
    filters.tags,
    filters.category,
    filters.method,
  ])

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout: API demorou muito para responder')),
          10000
        )
      )

      const fetchPromise = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Usuário não autenticado')
        }

        const storeId =
          user?.user_metadata?.store_id || user?.user_metadata?.company_id

        if (!storeId) {
          throw new Error(
            'Store ID não encontrado. Verifique se o usuário tem uma loja associada.'
          )
        }

        const params = new URLSearchParams({
          store_id: storeId,
          from: getDateRange(filters.period).from,
          to: getDateRange(filters.period).to,
          ...(filters.department !== 'all' && { dept: filters.department }),
          ...(filters.tags !== 'all' && { tag: filters.tags }),
        })

        const response = await fetch(
          `/api/v2/gestor/analytics/summary?${params}`
        )

        if (!response.ok) {
          throw new Error(
            `Erro na API: ${response.status} ${response.statusText}`
          )
        }

        const result = await response.json()

        if (result.success) {
          setAnalytics(result.data)
        } else {
          throw new Error(result.error || 'Erro desconhecido na API')
        }
      }

      await Promise.race([fetchPromise(), timeoutPromise])
    } catch (error: any) {
      console.error('Erro ao carregar analytics:', error)
      setError(error.message || 'Erro ao carregar dados do dashboard')

      // Dados de fallback para não quebrar a interface
      setAnalytics({
        activeUsers30d: 0,
        totalRedeems: 0,
        engagementRate: 0,
        pendingApprovals: 0,
        lowStockItems: 0,
        deltas: {
          activeUsers: 0,
          redeems: 0,
          engagement: 0,
        },
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getDateRange = (period: string) => {
    const now = new Date()
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return {
      from: from.toISOString(),
      to: now.toISOString(),
    }
  }

  const exportData = async (format: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const storeId =
        user?.user_metadata?.store_id || user?.user_metadata?.company_id

      const params = new URLSearchParams({
        store_id: storeId,
        type: 'analytics',
        from: getDateRange(filters.period).from,
        to: getDateRange(filters.period).to,
      })

      const response = await fetch(`/api/v2/gestor/export/csv?${params}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Carregando Dashboard
            </h3>
            <p className="text-sm text-gray-500">
              Buscando dados de analytics...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <Activity className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Erro ao Carregar Dashboard
            </h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={() => loadAnalytics(false)} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard - Analytics Avançado
          </h1>
          <p className="text-gray-600">Engajamento e métricas avançadas</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              Atualizando...
            </div>
          )}
          <NotificationsBell />
          <Button
            onClick={() => loadAnalytics(true)}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
          <Button onClick={() => exportData('csv')} disabled={refreshing}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard
          title="Usuários Ativos (30d)"
          value={analytics?.activeUsers30d || 0}
          delta={`${analytics?.deltas?.activeUsers > 0 ? '+' : ''}${analytics?.deltas?.activeUsers || 0}%`}
          hint="8 colaboradores inativos há 30 dias"
          icon={Users}
          color="blue"
        />
        <KpiCard
          title="Resgates"
          value={analytics?.totalRedeems || 0}
          delta={`${analytics?.deltas?.redeems > 0 ? '+' : ''}${analytics?.deltas?.redeems || 0}%`}
          hint="Taxa de conversão: 65%"
          icon={Package}
          color="green"
        />
        <KpiCard
          title="Taxa Engajamento"
          value={`${analytics?.engagementRate || 0}%`}
          delta={`${analytics?.deltas?.engagement > 0 ? '+' : ''}${analytics?.deltas?.engagement || 0}%`}
          hint="Acima da média do setor"
          icon={TrendingUp}
          color="purple"
        />
        <KpiCard
          title="Aprovações Pendentes"
          value={analytics?.pendingApprovals || 0}
          delta="0"
          hint="Tempo médio: 2h"
          icon={FileText}
          color="orange"
        />
        <KpiCard
          title="Estoque Baixo"
          value={analytics?.lowStockItems || 0}
          delta="-2"
          hint="Reabastecer 3 produtos prioritários"
          icon={Activity}
          color="red"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Série Temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Engajamento ao Longo do Tempo
              <Button size="sm" onClick={() => exportData('timeseries')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              storeId={analytics?.storeId}
              period={filters.period}
            />
          </CardContent>
        </Card>

        {/* Funil de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Funil de Conversão
              <Button size="sm" onClick={() => exportData('funnel')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomFunnelChart
              storeId={analytics?.storeId}
              period={filters.period}
            />
          </CardContent>
        </Card>
      </div>

      {/* Rankings e Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Colaboradores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Colaboradores</CardTitle>
            <CardDescription>Por engagement score</CardDescription>
          </CardHeader>
          <CardContent>
            <RankChart storeId={analytics?.storeId} type="employees" />
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos</CardTitle>
            <CardDescription>Mais visualizados</CardDescription>
          </CardHeader>
          <CardContent>
            <RankChart storeId={analytics?.storeId} type="products" />
          </CardContent>
        </Card>

        {/* Feed de Interações */}
        <Card>
          <CardHeader>
            <CardTitle>Feed em Tempo Real</CardTitle>
            <CardDescription>Últimas interações</CardDescription>
          </CardHeader>
          <CardContent>
            <InteractionsFeed storeId={analytics?.storeId} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
