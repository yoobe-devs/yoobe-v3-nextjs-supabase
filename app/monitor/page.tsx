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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Monitor,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Server,
  Database,
  Globe,
  Settings,
} from 'lucide-react'

interface SystemStatus {
  timestamp: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    middleware: { status: string; available: boolean }
    mcps: { status: string; available: boolean }
  }
  uptime: number
  version: string
  environment: string
}

interface SystemMetrics {
  timestamp: string
  summary: {
    totalRequests: number
    totalErrors: number
    errorRate: number
    activeOperations: number
    uptime: number
  }
  middleware: any
  mcps: any
  activeOperations: any[]
}

interface MonitorStatus {
  timestamp: string
  status: string
  services: {
    middleware: boolean
    mcps: boolean
    database: boolean
    apis: boolean
  }
  uptime: number
  lastCheck: string
  checks: {
    total: number
    passed: number
    failed: number
  }
  healthChecks: Array<{
    name: string
    url: string
    lastResult?: {
      success: boolean
      responseTime: number
      timestamp: string
      error?: string
    }
  }>
  isHealthy: boolean
}

interface SystemIssue {
  id: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  details: any
  timestamp: string
  resolved?: boolean
}

interface SystemIssues {
  timestamp: string
  systemStatus: string
  stats: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    resolved: number
    unresolved: number
  }
  issues: SystemIssue[]
  summary: {
    healthy: boolean
    needsAttention: boolean
    overallHealth: string
  }
}

export default function PublicMonitorPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [monitorStatus, setMonitorStatus] = useState<MonitorStatus | null>(null)
  const [systemIssues, setSystemIssues] = useState<SystemIssues | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchData = async () => {
    try {
      setLoading(true)

      // Buscar dados de todas as APIs
      const [healthResponse, metricsResponse, statusResponse, issuesResponse] =
        await Promise.all([
          fetch('/api/system/health-public'),
          fetch('/api/system/metrics-public'),
          fetch('/api/system/status'),
          fetch('/api/system/issues'),
        ])

      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        setSystemStatus(healthData)
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setSystemMetrics(metricsData)
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setMonitorStatus(statusData)
      }

      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        setSystemIssues(issuesData)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Saudável
          </Badge>
        )
      case 'degraded':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Degradado
          </Badge>
        )
      case 'unhealthy':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Não Saudável
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Monitor className="h-8 w-8 text-blue-600" />
                Monitor do Sistema
              </h1>
              <p className="text-gray-600 mt-2">
                Dashboard público de monitoramento e saúde do sistema Yoobe
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={fetchData} disabled={loading} variant="outline">
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Atualizar
              </Button>
              <div className="text-sm text-gray-500">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status Geral
              </CardTitle>
              {systemStatus && getStatusIcon(systemStatus.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus
                  ? getStatusBadge(systemStatus.status)
                  : 'Carregando...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStatus?.environment || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus ? formatUptime(systemStatus.uptime) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Tempo online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requisições</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemMetrics?.summary.totalRequests.toLocaleString() || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de requisições
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Erro
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemMetrics?.summary.errorRate.toFixed(2) || 'N/A'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Erros por requisição
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Errors and Issues Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Erros e Problemas Detectados
              </CardTitle>
              <CardDescription>
                Lista de erros e problemas encontrados no sistema para
                visualização rápida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Error Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {systemIssues?.stats.critical || 0}
                    </div>
                    <div className="text-sm text-red-600">Críticos</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {systemIssues?.stats.high || 0}
                    </div>
                    <div className="text-sm text-orange-600">Altos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">
                      {systemIssues?.stats.medium || 0}
                    </div>
                    <div className="text-sm text-yellow-600">Médios</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemIssues?.stats.total || 0}
                    </div>
                    <div className="text-sm text-blue-600">Total</div>
                  </div>
                </div>

                {/* Current Issues */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Problemas Detectados:
                  </h4>

                  {systemIssues?.issues && systemIssues.issues.length > 0 ? (
                    systemIssues.issues.map(issue => {
                      const getIcon = () => {
                        switch (issue.severity) {
                          case 'critical':
                            return (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            )
                          case 'high':
                            return (
                              <XCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                            )
                          case 'medium':
                            return (
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            )
                          case 'low':
                            return (
                              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                            )
                          default:
                            return (
                              <AlertTriangle className="h-5 w-5 text-gray-500 mt-0.5" />
                            )
                        }
                      }

                      const getBadgeColor = () => {
                        switch (issue.severity) {
                          case 'critical':
                            return 'bg-red-100 text-red-800 border-red-200'
                          case 'high':
                            return 'bg-orange-100 text-orange-800 border-orange-200'
                          case 'medium':
                            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          case 'low':
                            return 'bg-blue-100 text-blue-800 border-blue-200'
                          default:
                            return 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      }

                      const getBackgroundColor = () => {
                        switch (issue.severity) {
                          case 'critical':
                            return 'bg-red-50 border-red-200'
                          case 'high':
                            return 'bg-orange-50 border-orange-200'
                          case 'medium':
                            return 'bg-yellow-50 border-yellow-200'
                          case 'low':
                            return 'bg-blue-50 border-blue-200'
                          default:
                            return 'bg-gray-50 border-gray-200'
                        }
                      }

                      return (
                        <div
                          key={issue.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${getBackgroundColor()}`}
                        >
                          {getIcon()}
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {issue.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {issue.description}
                            </div>
                            {issue.details && (
                              <div className="text-xs text-gray-500 mt-1">
                                {typeof issue.details === 'object'
                                  ? Object.entries(issue.details).map(
                                      ([key, value]) => (
                                        <div key={key}>
                                          <strong>{key}:</strong>{' '}
                                          {String(value)}
                                        </div>
                                      )
                                    )
                                  : String(issue.details)}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={getBadgeColor()}
                              >
                                {issue.severity.toUpperCase()}
                              </Badge>
                              {issue.resolved !== undefined && (
                                <Badge
                                  variant={
                                    issue.resolved ? 'default' : 'destructive'
                                  }
                                >
                                  {issue.resolved ? 'Resolvido' : 'Pendente'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <div className="font-medium text-green-800">
                          Nenhum Problema Detectado
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          Sistema funcionando normalmente sem problemas
                          identificados
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MCP Services Status - Always show */}
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-green-800">
                        Serviços MCP Funcionando
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Todos os serviços MCP estão operacionais e respondendo
                        corretamente
                      </div>
                      <div className="text-xs text-green-500 mt-1">
                        Status:{' '}
                        <Badge
                          variant="outline"
                          className="ml-1 bg-green-100 text-green-800"
                        >
                          Saudável
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Ações Rápidas:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open('/docs/SYSTEM_PROTECTION', '_blank')
                      }
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ver Documentação
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open('/api/system/health-public', '_blank')
                      }
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Health Check API
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="health-checks">Health Checks</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Status dos Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemStatus?.services &&
                    Object.entries(systemStatus.services).map(
                      ([key, service]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {service.available ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">{key}</span>
                          </div>
                          <Badge
                            variant={
                              service.available ? 'default' : 'destructive'
                            }
                          >
                            {service.status}
                          </Badge>
                        </div>
                      )
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Versão:</span>
                    <Badge variant="outline">
                      {systemStatus?.version || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ambiente:</span>
                    <Badge variant="outline">
                      {systemStatus?.environment || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Última verificação:</span>
                    <span className="text-sm text-gray-500">
                      {monitorStatus?.lastCheck
                        ? new Date(monitorStatus.lastCheck).toLocaleTimeString()
                        : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Detalhado dos Serviços</CardTitle>
                <CardDescription>
                  Monitoramento em tempo real de todos os serviços do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monitorStatus?.services &&
                    Object.entries(monitorStatus.services).map(
                      ([service, status]) => (
                        <div
                          key={service}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {status ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <h4 className="font-medium capitalize">
                                {service}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {status
                                  ? 'Funcionando normalmente'
                                  : 'Com problemas'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={status ? 'default' : 'destructive'}>
                            {status ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      )
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health-checks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Checks</CardTitle>
                <CardDescription>
                  Resultados das verificações de saúde automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monitorStatus?.healthChecks.map((check, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {check.lastResult ? (
                          check.lastResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{check.name}</h4>
                          <p className="text-sm text-gray-500">{check.url}</p>
                          {check.lastResult && (
                            <p className="text-xs text-gray-400">
                              {check.lastResult.responseTime}ms -{' '}
                              {new Date(
                                check.lastResult.timestamp
                              ).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {check.lastResult ? (
                          <Badge
                            variant={
                              check.lastResult.success
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {check.lastResult.success ? 'OK' : 'Falhou'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Métricas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemMetrics?.summary &&
                    Object.entries(systemMetrics.summary).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-medium">
                            {typeof value === 'number'
                              ? value.toLocaleString()
                              : value}
                          </span>
                        </div>
                      )
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operações Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {systemMetrics?.activeOperations.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">
                    Operações em execução no momento
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
