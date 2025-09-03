'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  CheckCircle, 
  RefreshCw, 
  Database, 
  Zap,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  Shield,
  Settings,
  BarChart3,
  User,
  Building,
  FileText,
  MapPin,
  FileCheck,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'

export default function ReplicationSystemPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Sistema de Replicação v3.0.0
          </h1>
          <p className="text-gray-600 mt-2">
            Replicação automática de produtos após pagamento confirmado com logs e auditoria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code className="h-3 w-3 mr-1" />
            v3.0.0
          </Badge>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-blue-600">Documentação</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Sistema de Replicação</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workflow">Fluxo de Replicação</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Visão Geral do Sistema
              </CardTitle>
              <CardDescription>
                Sistema automático de replicação de produtos com triggers inteligentes e logs detalhados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Replicação automática após pagamento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Triggers inteligentes por evento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Logs detalhados de replicação
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Rollback automático em caso de falha
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Configuração por produto/empresa
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Tecnologias Utilizadas</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      Next.js 14 + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-500" />
                      Supabase (PostgreSQL)
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      Triggers e Functions SQL
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Queue de processamento
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Arquitetura do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pagamento     │    │   Trigger       │    │   Replicação   │
│   Confirmado    │◄──►│   de Evento     │◄──►│   Automática    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Atualização de         Verificação de         Processamento
    Status para            Regras de              de Replicação
    'paid'                 Replicação                    │
         │                       │                       ▼
         ▼                       ▼               ┌─────────────────┐
    Trigger SQL            Validação de         │   Logs e        │
    Disparado              Produtos e            │   Auditoria     │
         │               Configurações          └─────────────────┘
         ▼                       │                       │
    Queue de                     ▼                       ▼
    Processamento         Execução da            Confirmação
         │               Replicação              de Sucesso`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Fluxo de Replicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Workflow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-sm">Pagamento</h4>
                    <p className="text-xs text-gray-500">Confirmado</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-sm">Trigger</h4>
                    <p className="text-xs text-gray-500">Disparado</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-sm">Validação</h4>
                    <p className="text-xs text-gray-500">Regras</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <h4 className="font-medium text-sm">Replicação</h4>
                    <p className="text-xs text-gray-500">Executada</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-600 font-bold">5</span>
                    </div>
                    <h4 className="font-medium text-sm">Logs</h4>
                    <p className="text-xs text-gray-500">Gerados</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 font-bold">6</span>
                    </div>
                    <h4 className="font-medium text-sm">Confirmação</h4>
                    <p className="text-xs text-gray-500">Finalizada</p>
                  </div>
                </div>

                <Separator />

                {/* Replication Rules */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Regras de Replicação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">Produto Ativo</Badge>
                        <span className="text-sm text-gray-600">Produto deve estar ativo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Estoque Disponível</Badge>
                        <span className="text-sm text-gray-600">Quantidade em estoque</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Configuração</Badge>
                        <span className="text-sm text-gray-600">Regras habilitadas</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Status Pagamento</Badge>
                        <span className="text-sm text-gray-600">Pagamento confirmado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Permissões</Badge>
                        <span className="text-sm text-gray-600">Usuário autorizado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800">Limites</Badge>
                        <span className="text-sm text-gray-600">Limites de replicação</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Funcionalidades Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Replicação Automática</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Triggers por evento de pagamento</li>
                    <li>• Validação automática de regras</li>
                    <li>• Processamento em background</li>
                    <li>• Retry automático em falhas</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Configuração</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Regras por produto/empresa</li>
                    <li>• Limites de replicação</li>
                    <li>• Horários de execução</li>
                    <li>• Templates de configuração</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Funcionalidades Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Monitoramento</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Logs detalhados de execução</li>
                    <li>• Métricas de performance</li>
                    <li>• Alertas de falha</li>
                    <li>• Dashboard em tempo real</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Segurança</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Validação de permissões</li>
                    <li>• Auditoria completa</li>
                    <li>• Rollback automático</li>
                    <li>• Proteção contra loops</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                Referência da API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Endpoints Principais</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-green-600">POST</span> /api/replication/trigger
                        <span className="text-gray-500 ml-2">- Disparar replicação</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/replication/status
                        <span className="text-gray-500 ml-2">- Status da replicação</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">GET</span> /api/replication/logs
                        <span className="text-gray-500 ml-2">- Logs de replicação</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">POST</span> /api/replication/rollback
                        <span className="text-gray-500 ml-2">- Rollback de replicação</span>
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modelos de Dados</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`interface ReplicationJob {
  id: string
  product_id: string
  company_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  triggered_by: string
  created_at: string
  completed_at?: string
  logs: ReplicationLog[]
}

interface ReplicationLog {
  id: string
  job_id: string
  level: 'info' | 'warning' | 'error'
  message: string
  timestamp: string
  metadata?: object
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                Exemplos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Disparar Replicação</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Disparar replicação manualmente
const response = await fetch('/api/replication/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 'prod_123',
    company_id: 'company_456',
    trigger_type: 'manual'
  })
})

const job = await response.json()`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Verificar Status</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Verificar status da replicação
const response = await fetch('/api/replication/status/job_789')
const status = await response.json()

console.log('Status:', status.status)
console.log('Logs:', status.logs)`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Problemas Comuns</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h5 className="font-medium text-gray-900">Replicação não executa</h5>
                      <p className="text-sm text-gray-600">Verificar se o trigger está ativo, se as regras estão configuradas e se o pagamento foi confirmado.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Falha na replicação</h5>
                      <p className="text-sm text-gray-600">Verificar logs de erro, permissões de banco e configuração de produtos.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Replicação lenta</h5>
                      <p className="text-sm text-gray-600">Verificar performance do banco, índices e configuração de queue.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/replication/health"
                        <span className="text-gray-500 ml-2">- Verificar saúde do sistema</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/replication/queue"
                        <span className="text-gray-500 ml-2">- Verificar fila de processamento</span>
                      </code>
                    </div>
                  </div>
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
            <ExternalLink className="h-5 w-5 text-blue-600" />
            Documentação Relacionada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/docs/QUOTES_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Sistema de Orçamentos</h4>
                  </div>
                  <p className="text-sm text-gray-600">Sistema completo de orçamentos e aprovação</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/CHECKOUT_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Sistema de Checkout</h4>
                  </div>
                  <p className="text-sm text-gray-600">Checkout avançado com múltiplos métodos de pagamento</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/DASHBOARDS" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Dashboards e Métricas</h4>
                  </div>
                  <p className="text-sm text-gray-600">Monitoramento em tempo real</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
