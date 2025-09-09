'use client'

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
  Shield,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Eye,
  Zap,
  Lock,
  Monitor,
  Database,
  Code,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'

export default function SystemProtectionPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Sistema de Proteção e Monitoramento
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sistema abrangente de proteção e monitoramento do middleware e MCPs da
          Yoobe v3.1.0
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Shield className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando normalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Middleware</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Protegido</div>
            <p className="text-xs text-muted-foreground">
              Rate limiting e health checks ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MCPs</CardTitle>
            <Server className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">6 Ativos</div>
            <p className="text-xs text-muted-foreground">
              Todos os MCPs monitorados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="middleware">Middleware</TabsTrigger>
          <TabsTrigger value="mcps">MCPs</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Funcionalidades Principais
              </CardTitle>
              <CardDescription>
                Sistema completo de proteção e monitoramento implementado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    🛡️ Proteção do Middleware
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Rate limiting por IP
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Health checks automáticos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Auditoria completa
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Tratamento de erros
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Métricas em tempo real
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    🔍 Monitoramento de MCPs
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Tracking de operações
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Métricas de performance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Status de saúde
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Health checks automáticos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Log de erros integrado
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                Acesso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/monitor">
                  <Button className="w-full justify-start">
                    <Monitor className="h-4 w-4 mr-2" />
                    Dashboard Público
                  </Button>
                </Link>
                <Link href="/admin/system-monitoring">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Dashboard Admin
                  </Button>
                </Link>
                <Link href="/api/system/health-public">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Health Check API
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Link href="/api/system/status">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Status do Sistema
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open(
                      'http://localhost:3000/api/system/health-public',
                      '_blank'
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Testar Health Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="middleware" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Sistema de Proteção do Middleware
              </CardTitle>
              <CardDescription>
                Proteção avançada com rate limiting, health checks e auditoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🔒 Rate Limiting</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Limite: 100 requisições/minuto por IP</li>
                    <li>• Janela de tempo configurável</li>
                    <li>• Bloqueio automático de IPs suspeitos</li>
                    <li>• Log de eventos de segurança</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">💓 Health Checks</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Verificação automática a cada minuto</li>
                    <li>• Detecção de degradação de performance</li>
                    <li>• Status: healthy/degraded/unhealthy</li>
                    <li>• Alertas automáticos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">📊 Auditoria</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Log de todas as requisições</li>
                    <li>• Tracking de redirecionamentos</li>
                    <li>• Registro de eventos de segurança</li>
                    <li>• Integração com sistema de auditoria</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">⚠️ Tratamento de Erros</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Captura e log de erros</li>
                    <li>• Integração com memória de erros</li>
                    <li>• Prevenção de falhas em cascata</li>
                    <li>• Métricas de erro em tempo real</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {`// lib/middleware-protection.ts
const config: MiddlewareConfig = {
  enableMetrics: true,
  enableAudit: true,
  enableErrorLogging: true,
  enableRateLimit: true,
  maxRequestsPerMinute: 100,
  enableHealthCheck: true,
  healthCheckInterval: 60000
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-600" />
                Monitoramento de MCPs
              </CardTitle>
              <CardDescription>
                Monitoramento completo dos Model Context Protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📡 MCPs Monitorados</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      MCP_DOCKER - GitHub, Stripe, Docker
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      context7 - Busca de documentação
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      gemini-mcp-tool - Análises e conteúdo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      playwright - Automação de browser
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      spec-kit - Gerenciamento de especificações
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      yoobe-v3-filesystem - Acesso ao sistema de arquivos
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">📊 Métricas Coletadas</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Total de requisições</li>
                    <li>• Requisições bem-sucedidas</li>
                    <li>• Requisições com falha</li>
                    <li>• Tempo médio de resposta</li>
                    <li>• Status de saúde</li>
                    <li>• Operações ativas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuração por MCP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {`// lib/mcp-monitoring.ts
const mcpConfig: MCPConfig = {
  name: 'MCP_DOCKER',
  type: 'docker',
  enabled: true,
  maxRequestsPerMinute: 50,
  timeout: 30000,
  retryAttempts: 3,
  healthCheckInterval: 60000
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <Alert>
            <Monitor className="h-4 w-4" />
            <AlertDescription>
              Acesse o dashboard completo de monitoramento em tempo real para
              visualizar métricas detalhadas, status de saúde e operações
              ativas.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Dashboard de Monitoramento
              </CardTitle>
              <CardDescription>
                Interface visual para monitoramento em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">
                    📊 Funcionalidades do Dashboard
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Status geral do sistema</li>
                    <li>• Métricas do middleware</li>
                    <li>• Status dos MCPs</li>
                    <li>• Operações ativas</li>
                    <li>• Ações de gerenciamento</li>
                    <li>• Auto-refresh configurável</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">🔧 Ações Disponíveis</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Reset de métricas do middleware</li>
                    <li>• Reset de métricas dos MCPs</li>
                    <li>• Limpeza de operações antigas</li>
                    <li>• Configuração de auto-refresh</li>
                    <li>• Exportação de dados</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Link href="/admin/system-monitoring">
                  <Button className="w-full">
                    <Monitor className="h-4 w-4 mr-2" />
                    Dashboard Completo
                  </Button>
                </Link>
                <Link href="/admin/system-monitoring-simple">
                  <Button variant="outline" className="w-full">
                    <Monitor className="h-4 w-4 mr-2" />
                    Dashboard Simples (Teste)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>APIs de Monitoramento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Dashboard Público</h4>
                    <p className="text-sm text-gray-600">
                      Interface visual de monitoramento - sem autenticação
                    </p>
                  </div>
                  <code className="bg-white px-2 py-1 rounded text-sm">
                    GET /monitor
                  </code>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Health Check (Público)</h4>
                    <p className="text-sm text-gray-600">
                      Status geral do sistema - sem autenticação
                    </p>
                  </div>
                  <code className="bg-white px-2 py-1 rounded text-sm">
                    GET /api/system/health-public
                  </code>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Métricas (Público)</h4>
                    <p className="text-sm text-gray-600">
                      Métricas básicas - sem autenticação
                    </p>
                  </div>
                  <code className="bg-white px-2 py-1 rounded text-sm">
                    GET /api/system/metrics-public
                  </code>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Status do Sistema</h4>
                    <p className="text-sm text-gray-600">
                      Status completo do monitoramento
                    </p>
                  </div>
                  <code className="bg-white px-2 py-1 rounded text-sm">
                    GET /api/system/status
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Documentação Relacionada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/docs/MCP_GUIDE">
              <Button variant="outline" className="w-full justify-start">
                <Code className="h-4 w-4 mr-2" />
                Guia de MCPs
              </Button>
            </Link>
            <Link href="/docs/RBAC_SYSTEM">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Sistema RBAC
              </Button>
            </Link>
            <Link href="/docs/API_REFERENCE">
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Referência da API
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
