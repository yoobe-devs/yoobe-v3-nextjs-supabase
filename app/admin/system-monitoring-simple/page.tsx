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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  RefreshCw,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface SystemHealth {
  timestamp: string
  overall: 'healthy' | 'degraded' | 'unhealthy'
  middleware: {
    status: string
    lastCheck: number
    metrics: {
      totalRequests: number
      blockedRequests: number
      redirects: number
      errors: number
      averageResponseTime: number
    }
  }
  mcps: {
    summary: {
      totalMCPs: number
      healthyMCPs: number
      degradedMCPs: number
      unhealthyMCPs: number
      activeOperations: number
    }
    details: Record<string, any>
  }
  activeOperations: Array<{
    id: string
    mcpName: string
    operation: string
    startTime: number
    metadata?: any
  }>
}

interface SystemMetrics {
  timestamp: string
  summary: {
    totalRequests: number
    totalMCPRequests: number
    totalErrors: number
    errorRate: number
    activeOperations: number
  }
  middleware: any
  mcps: Record<string, any>
  activeOperations: Array<{
    id: string
    mcpName: string
    operation: string
    duration: number
    metadata?: any
  }>
}

export default function SystemMonitoringSimplePage() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/system/health-simple')
      const data = await response.json()

      if (data.success) {
        setHealth(data.data)
        setError(null)
      } else {
        setError(data.error || 'Erro ao carregar health check')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/system/metrics-simple')
      const data = await response.json()

      if (data.success) {
        setMetrics(data.data)
      }
    } catch (err) {
      console.error('Erro ao carregar métricas:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchHealth(), fetchMetrics()])
    setLoading(false)
  }

  const resetMetrics = async (action: string, target?: string) => {
    try {
      const response = await fetch('/api/system/metrics-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchData()
      }
    } catch (err) {
      console.error('Erro ao resetar métricas:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000) // 30 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  if (loading && !health) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando monitoramento do sistema...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Monitoramento do Sistema (Versão Simples)
          </h1>
          <p className="text-muted-foreground">
            Status e métricas do middleware e MCPs - Versão de teste
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pausar' : 'Iniciar'} Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Geral */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status Geral
              </CardTitle>
              {getStatusIcon(health.overall)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getStatusBadge(health.overall)}
              </div>
              <p className="text-xs text-muted-foreground">
                Última verificação:{' '}
                {new Date(health.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Middleware Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Middleware</CardTitle>
              {getStatusIcon(health.middleware.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getStatusBadge(health.middleware.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {health.middleware.metrics.totalRequests} requisições
              </p>
            </CardContent>
          </Card>

          {/* MCPs Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MCPs</CardTitle>
              <Server className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {health.mcps.summary.healthyMCPs}/
                {health.mcps.summary.totalMCPs}
              </div>
              <p className="text-xs text-muted-foreground">
                {health.mcps.summary.activeOperations} operações ativas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="operations">Operações Ativas</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          {health && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Middleware Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Middleware</CardTitle>
                  <CardDescription>
                    Status e métricas do middleware
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    {getStatusBadge(health.middleware.status)}
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Requisições:</span>
                    <span className="font-mono">
                      {health.middleware.metrics.totalRequests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requisições Bloqueadas:</span>
                    <span className="font-mono">
                      {health.middleware.metrics.blockedRequests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redirecionamentos:</span>
                    <span className="font-mono">
                      {health.middleware.metrics.redirects}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erros:</span>
                    <span className="font-mono text-red-500">
                      {health.middleware.metrics.errors}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo Médio de Resposta:</span>
                    <span className="font-mono">
                      {Math.round(
                        health.middleware.metrics.averageResponseTime
                      )}
                      ms
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* MCPs Details */}
              <Card>
                <CardHeader>
                  <CardTitle>MCPs</CardTitle>
                  <CardDescription>
                    Status dos Model Context Protocols
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de MCPs:</span>
                    <span className="font-mono">
                      {health.mcps.summary.totalMCPs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MCPs Saudáveis:</span>
                    <span className="font-mono text-green-500">
                      {health.mcps.summary.healthyMCPs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MCPs Degradados:</span>
                    <span className="font-mono text-yellow-500">
                      {health.mcps.summary.degradedMCPs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MCPs Não Saudáveis:</span>
                    <span className="font-mono text-red-500">
                      {health.mcps.summary.unhealthyMCPs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operações Ativas:</span>
                    <span className="font-mono">
                      {health.mcps.summary.activeOperations}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {metrics && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo das Métricas</CardTitle>
                  <CardDescription>
                    Estatísticas gerais do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metrics.summary.totalRequests}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Requisições Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metrics.summary.totalMCPRequests}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Requisições MCP
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {metrics.summary.totalErrors}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Erros Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metrics.summary.errorRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Taxa de Erro
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MCP Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas por MCP</CardTitle>
                  <CardDescription>
                    Detalhes de cada Model Context Protocol
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(metrics.mcps).map(
                      ([mcpName, mcpMetrics]) => (
                        <div key={mcpName} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{mcpName}</h4>
                            {getStatusBadge(mcpMetrics.healthStatus)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Requisições:
                              </span>
                              <div className="font-mono">
                                {mcpMetrics.totalRequests}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Sucessos:
                              </span>
                              <div className="font-mono text-green-500">
                                {mcpMetrics.successfulRequests}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Falhas:
                              </span>
                              <div className="font-mono text-red-500">
                                {mcpMetrics.failedRequests}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Tempo Médio:
                              </span>
                              <div className="font-mono">
                                {Math.round(mcpMetrics.averageResponseTime)}ms
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                  <CardDescription>
                    Gerenciar métricas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetMetrics('reset_middleware')}
                    >
                      Reset Middleware
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetMetrics('reset_mcp')}
                    >
                      Reset MCPs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetMetrics('cleanup_operations')}
                    >
                      Limpar Operações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          {health && health.activeOperations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Operações Ativas</CardTitle>
                <CardDescription>Operações MCP em execução</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {health.activeOperations.map(operation => (
                    <div key={operation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{operation.operation}</h4>
                        <Badge variant="outline">{operation.mcpName}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>ID: {operation.id}</div>
                        <div>
                          Iniciado:{' '}
                          {new Date(operation.startTime).toLocaleString()}
                        </div>
                        <div>
                          Duração:{' '}
                          {Math.round(
                            (Date.now() - operation.startTime) / 1000
                          )}
                          s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma operação ativa no momento
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

