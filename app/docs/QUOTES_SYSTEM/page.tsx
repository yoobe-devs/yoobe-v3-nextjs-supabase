'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign, 
  ShoppingCart,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  Database,
  Settings,
  BarChart3,
  Shield,
  Building,
  CreditCard,
  Package,
  MapPin,
  UserCheck,
  FileCheck,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function QuotesSystemPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Sistema de Orçamentos v3.1.0
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema completo de orçamentos, aprovação e replicação automática da plataforma Yoobe
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
        <span className="text-gray-900 font-medium">Sistema de Orçamentos</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workflow">Fluxo de Trabalho</TabsTrigger>
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
                Sistema completo de orçamentos com aprovação, gestão de status e replicação automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Criação e gestão de orçamentos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Sistema de aprovação multi-nível
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Gestão de status e workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Replicação automática de produtos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Integração com sistema de pagamentos
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
                      RLS (Row Level Security)
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-orange-500" />
                      Middleware de autenticação
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
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Interface de         Controle de           Armazenamento
    Usuário              Negócio               Persistente
         │                       │                       │
         ▼                       ▼                       ▼
    Gestão de            Validações e          Tabelas:
    Orçamentos           Regras de             - quotes
         │               Negócio               - quote_items
         ▼                       │               - approvals
    Aprovação e          Workflow de           - products
    Status               Status                - users`}
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
                <ArrowRight className="h-5 w-5 text-blue-600" />
                Fluxo de Trabalho dos Orçamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Workflow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-sm">Criação</h4>
                    <p className="text-xs text-gray-500">Usuário cria orçamento</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-sm">Revisão</h4>
                    <p className="text-xs text-gray-500">Gestor revisa</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-sm">Aprovação</h4>
                    <p className="text-xs text-gray-500">Admin aprova</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <h4 className="font-medium text-sm">Pagamento</h4>
                    <p className="text-xs text-gray-500">Cliente paga</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-600 font-bold">5</span>
                    </div>
                    <h4 className="font-medium text-sm">Replicação</h4>
                    <p className="text-xs text-gray-500">Produtos replicados</p>
                  </div>
                </div>

                <Separator />

                {/* Status Flow */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Estados do Orçamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-gray-100">draft</Badge>
                        <span className="text-sm text-gray-600">Rascunho inicial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">pending_review</Badge>
                        <span className="text-sm text-gray-600">Aguardando revisão</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">pending_approval</Badge>
                        <span className="text-sm text-gray-600">Aguardando aprovação</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">approved</Badge>
                        <span className="text-sm text-gray-600">Aprovado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">paid</Badge>
                        <span className="text-sm text-gray-600">Pago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">replicated</Badge>
                        <span className="text-sm text-gray-600">Replicado</span>
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
                  <h5 className="font-medium text-gray-900">Gestão de Orçamentos</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Criação de orçamentos com múltiplos itens</li>
                    <li>• Cálculo automático de preços e descontos</li>
                    <li>• Templates de orçamento personalizáveis</li>
                    <li>• Histórico completo de versões</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Sistema de Aprovação</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Workflow configurável de aprovação</li>
                    <li>• Notificações automáticas por email</li>
                    <li>• Aprovação em lote para múltiplos orçamentos</li>
                    <li>• Delegamento de aprovação</li>
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
                  <h5 className="font-medium text-gray-900">Replicação Automática</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Replicação automática após pagamento</li>
                    <li>• Configuração de regras de replicação</li>
                    <li>• Logs detalhados de replicação</li>
                    <li>• Rollback em caso de falha</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Integrações</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sistema de pagamentos múltiplos</li>
                    <li>• Integração com CRM e ERP</li>
                    <li>• Webhooks para sistemas externos</li>
                    <li>• API REST completa</li>
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
                        <span className="text-green-600">POST</span> /api/quotes
                        <span className="text-gray-500 ml-2">- Criar orçamento</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/quotes
                        <span className="text-gray-500 ml-2">- Listar orçamentos</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">PUT</span> /api/quotes/{'{id}'}/approve
                        <span className="text-gray-500 ml-2">- Aprovar orçamento</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">POST</span> /api/quotes/{'{id}'}/replicate
                        <span className="text-gray-500 ml-2">- Replicar produtos</span>
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modelos de Dados</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`interface Quote {
  id: string
  company_id: string
  user_id: string
  status: QuoteStatus
  total_amount: number
  items: QuoteItem[]
  created_at: string
  updated_at: string
}

interface QuoteItem {
  id: string
  quote_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
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
                  <h4 className="font-medium text-gray-900 mb-2">Criar Orçamento</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Criar novo orçamento
const response = await fetch('/api/quotes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company_id: 'company_123',
    items: [
      { product_id: 'prod_1', quantity: 5, unit_price: 100 },
      { product_id: 'prod_2', quantity: 2, unit_price: 250 }
    ]
  })
})

const quote = await response.json()`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Aprovar Orçamento</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Aprovar orçamento
const response = await fetch('/api/quotes/quote_123/approve', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    approved_by: 'user_456',
    notes: 'Aprovado após revisão'
  })
})`}
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
                      <h5 className="font-medium text-gray-900">Orçamento não é aprovado</h5>
                      <p className="text-sm text-gray-600">Verificar se o usuário tem permissão de aprovação e se o workflow está configurado corretamente.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Replicação falha</h5>
                      <p className="text-sm text-gray-600">Verificar logs de replicação, permissões de banco e configuração de produtos.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Cálculos incorretos</h5>
                      <p className="text-sm text-gray-600">Verificar configuração de impostos, descontos e regras de preço.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/quotes/status"
                        <span className="text-gray-500 ml-2">- Verificar status do sistema</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/quotes/logs"
                        <span className="text-gray-500 ml-2">- Ver logs de replicação</span>
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
            <Link href="/docs/CHECKOUT_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Sistema de Checkout</h4>
                  </div>
                  <p className="text-sm text-gray-600">Checkout avançado com múltiplos métodos de pagamento</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/REPLICATION_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Sistema de Replicação</h4>
                  </div>
                  <p className="text-sm text-gray-600">Replicação automática de produtos após pagamento</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/RBAC_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Sistema RBAC</h4>
                  </div>
                  <p className="text-sm text-gray-600">Controle de acesso baseado em roles</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
