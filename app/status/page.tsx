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
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Server,
  Cpu,
  Memory,
} from 'lucide-react'

interface HealthData {
  ok: boolean
  version: string
  timestamp: string
  uptime: number
  environment: string
  services: {
    database: {
      status: string
      responseTime: string
    }
    supabase: {
      url: string
      serviceRole: string
    }
  }
  system: {
    nodeVersion: string
    platform: string
    arch: string
    memory: {
      used: number
      total: number
      unit: string
    }
  }
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/health', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'configured':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
      case 'configured':
        return (
          <Badge variant="default" className="bg-green-500">
            OK
          </Badge>
        )
      case 'error':
      case 'missing':
        return <Badge variant="destructive">Erro</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading && !health) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Verificando status do sistema...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !health) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Erro ao verificar status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchHealth} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Status do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da plataforma Yoobe v3.3
          </p>
        </div>
        <Button onClick={fetchHealth} disabled={loading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {health?.ok ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Status Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="font-semibold">{health?.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ambiente</p>
              <Badge
                variant={
                  health?.environment === 'production' ? 'default' : 'secondary'
                }
              >
                {health?.environment}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="font-semibold">
                {health ? formatUptime(health.uptime) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Última verificação
              </p>
              <p className="font-semibold text-sm">
                {health ? new Date(health.timestamp).toLocaleTimeString() : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(health?.services.database.status || '')}
                {getStatusBadge(health?.services.database.status || '')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Tempo de resposta</span>
              <span className="font-mono">
                {health?.services.database.responseTime || '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>URL</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(health?.services.supabase.url || '')}
                {getStatusBadge(health?.services.supabase.url || '')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Service Role</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(health?.services.supabase.serviceRole || '')}
                {getStatusBadge(health?.services.supabase.serviceRole || '')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Node.js</p>
              <p className="font-semibold">{health?.system.nodeVersion}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plataforma</p>
              <p className="font-semibold">
                {health?.system.platform} ({health?.system.arch})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Memória</p>
              <div className="flex items-center gap-2">
                <Memory className="h-4 w-4" />
                <span className="font-semibold">
                  {health?.system.memory.used} / {health?.system.memory.total}{' '}
                  {health?.system.memory.unit}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}







