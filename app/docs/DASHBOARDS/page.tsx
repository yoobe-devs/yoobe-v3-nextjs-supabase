'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  PieChart,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  Database,
  Settings,
  Shield,
  User,
  Building,
  Package,
  MapPin,
  FileCheck,
  Zap,
  AlertTriangle,
  FileText,
  LineChart,
  Target,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Sistema de Dashboards v3.1.0
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboards em tempo real com métricas avançadas, relatórios personalizados e analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-blue-600">Documentação</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Sistema de Dashboards</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workflow">Fluxo de Dados</TabsTrigger>
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
                Sistema completo de dashboards com métricas em tempo real e relatórios personalizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Dashboards em tempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Métricas personalizáveis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Relatórios automáticos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Alertas inteligentes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Exportação de dados
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
                      <Activity className="h-4 w-4 text-purple-500" />
                      WebSockets para tempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      Charts.js + D3.js
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Tipos de Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Dashboard Executivo</h4>
                  <p className="text-sm text-gray-600">Visão geral para gestores</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">KPI's</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <LineChart className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Dashboard Operacional</h4>
                  <p className="text-sm text-gray-600">Métricas de operação</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Operacional</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Dashboard Analítico</h4>
                  <p className="text-sm text-gray-600">Análises profundas</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">Analytics</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Fluxo de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Data Flow */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-sm">Coleta</h4>
                    <p className="text-xs text-gray-500">Dados do sistema</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-sm">Processamento</h4>
                    <p className="text-xs text-gray-500">Agregação e cálculo</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-sm">Armazenamento</h4>
                    <p className="text-xs text-gray-500">Cache e banco</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <h4 className="font-medium text-sm">Transmissão</h4>
                    <p className="text-xs text-gray-500">WebSocket/API</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-600 font-bold">5</span>
                    </div>
                    <h4 className="font-medium text-sm">Renderização</h4>
                    <p className="text-xs text-gray-500">Charts e gráficos</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 font-bold">6</span>
                    </div>
                    <h4 className="font-medium text-sm">Interação</h4>
                    <p className="text-xs text-gray-500">Filtros e drill-down</p>
                  </div>
                </div>

                <Separator />

                {/* Real-time Updates */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Atualizações em Tempo Real</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">WebSocket</Badge>
                        <span className="text-sm text-gray-600">Conexão persistente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Server-Sent Events</Badge>
                        <span className="text-sm text-gray-600">Streaming de dados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Polling</Badge>
                        <span className="text-sm text-gray-600">Verificação periódica</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Cache Redis</Badge>
                        <span className="text-sm text-gray-600">Dados em memória</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Queue</Badge>
                        <span className="text-sm text-gray-600">Processamento assíncrono</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800">Batch</Badge>
                        <span className="text-sm text-gray-600">Atualizações em lote</span>
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
                  <h5 className="font-medium text-gray-900">Visualizações</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Gráficos de linha, barra e pizza</li>
                    <li>• Tabelas interativas</li>
                    <li>• Mapas e heatmaps</li>
                    <li>• Indicadores de progresso</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Métricas</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• KPI's personalizáveis</li>
                    <li>• Comparações temporais</li>
                    <li>• Metas e alertas</li>
                    <li>• Análise de tendências</li>
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
                  <h5 className="font-medium text-gray-900">Inteligência</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Alertas automáticos</li>
                    <li>• Detecção de anomalias</li>
                    <li>• Previsões e ML</li>
                    <li>• Insights automáticos</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Personalização</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Dashboards customizáveis</li>
                    <li>• Filtros avançados</li>
                    <li>• Exportação de dados</li>
                    <li>• Compartilhamento</li>
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
                        <span className="text-green-600">GET</span> /api/dashboards/metrics
                        <span className="text-gray-500 ml-2">- Obter métricas</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/dashboards/realtime
                        <span className="text-gray-500 ml-2">- Dados em tempo real</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">POST</span> /api/dashboards/reports
                        <span className="text-gray-500 ml-2">- Gerar relatórios</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">GET</span> /api/dashboards/alerts
                        <span className="text-gray-500 ml-2">- Listar alertas</span>
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modelos de Dados</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`interface DashboardMetric {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change_percentage: number
  last_updated: string
}

interface DashboardChart {
  id: string
  type: 'line' | 'bar' | 'pie'
  data: ChartDataPoint[]
  options: ChartOptions
  last_updated: string
}

interface ChartDataPoint {
  timestamp: string
  value: number
  label?: string
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
                  <h4 className="font-medium text-gray-900 mb-2">Obter Métricas em Tempo Real</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Conectar ao WebSocket para dados em tempo real
const ws = new WebSocket('ws://localhost:3000/api/dashboards/realtime')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  if (data.type === 'metric_update') {
    updateMetric(data.metric_id, data.value)
  } else if (data.type === 'alert') {
    showAlert(data.message, data.level)
  }
}

// Obter métricas via API REST
const response = await fetch('/api/dashboards/metrics?dashboard=executive')
const metrics = await response.json()

metrics.forEach(metric => {
  updateMetricDisplay(metric)
})`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Gerar Relatório Personalizado</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Gerar relatório personalizado
const response = await fetch('/api/dashboards/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'sales_summary',
    date_range: {
      start: '2024-01-01',
      end: '2024-12-31'
    },
    filters: {
      team_id: 'team_vendas',
      product_category: 'eletronicos'
    },
    format: 'pdf',
    include_charts: true
  })
})

const report = await response.json()
console.log('Relatório gerado:', report.download_url)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Configurar Alertas Inteligentes</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Configurar alerta para métrica
const alertConfig = {
  metric_id: 'sales_daily',
  condition: 'below_threshold',
  threshold: 10000,
  notification_channels: ['email', 'slack'],
  recipients: ['gestor@empresa.com'],
  cooldown_minutes: 60
}

const response = await fetch('/api/dashboards/alerts/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(alertConfig)
})

const alert = await response.json()
console.log('Alerta configurado:', alert.id)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Criar Dashboard Customizado</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Criar dashboard personalizado
const dashboardConfig = {
  name: 'Dashboard Vendas',
  description: 'Métricas de vendas da equipe',
  layout: [
    {
      widget_id: 'metric_total_sales',
      position: { x: 0, y: 0, w: 6, h: 2 }
    },
    {
      widget_id: 'chart_sales_trend',
      position: { x: 6, y: 0, w: 6, h: 4 }
    },
    {
      widget_id: 'table_top_products',
      position: { x: 0, y: 2, w: 12, h: 4 }
    }
  ],
  refresh_interval: 300, // 5 minutos
  is_public: false
}

const response = await fetch('/api/dashboards/custom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(dashboardConfig)
})

const dashboard = await response.json()`}
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
                      <h5 className="font-medium text-gray-900">Dados não atualizam</h5>
                      <p className="text-sm text-gray-600">Verificar conexão WebSocket, cache Redis e processamento de dados.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Performance lenta</h5>
                      <p className="text-sm text-gray-600">Verificar índices do banco, cache e otimização de queries.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Alertas não funcionam</h5>
                      <p className="text-sm text-gray-600">Verificar configuração de alertas, canais de notificação e regras.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/dashboards/health"
                        <span className="text-gray-500 ml-2">- Verificar saúde do sistema</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/dashboards/metrics/cache"
                        <span className="text-gray-500 ml-2">- Verificar cache de métricas</span>
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
                  <p className="text-sm text-gray-600">Métricas de orçamentos e vendas</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/WALLET_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Sistema de Carteira</h4>
                  </div>
                  <p className="text-sm text-gray-600">Métricas de transações e pontos</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/REPLICATION_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Sistema de Replicação</h4>
                  </div>
                  <p className="text-sm text-gray-600">Métricas de performance</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
