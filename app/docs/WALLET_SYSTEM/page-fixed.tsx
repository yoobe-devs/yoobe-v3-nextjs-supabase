'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  CheckCircle,
  DollarSign,
  TrendingUp,
  History,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  Database,
  Settings,
  BarChart3,
  User,
  Building,
  Package,
  MapPin,
  FileCheck,
  Zap,
  AlertTriangle,
  FileText,
  Plus,
  Minus,
  Wallet,
  Coins,
} from 'lucide-react'
import Link from 'next/link'

export default function WalletSystemPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            Sistema de Carteira v3.1.0
          </h1>
          <p className="text-gray-600 mt-2">
            Gestão completa de pontos, transações e sistema de crédito/debito da
            plataforma Yoobe
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <Code className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-blue-600">
          Documentação
        </Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Sistema de Carteira</span>
      </nav>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workflow">Fluxo de Transações</TabsTrigger>
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
                Sistema completo de gestão de carteira com pontos, transações e
                sistema de crédito/debito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Características Principais
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Gestão de pontos e recompensas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Sistema de transações completo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Integração com checkout
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Analytics e relatórios
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Benefícios</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Fidelização de clientes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aumento de engajamento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Dados de comportamento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      ROI mensurável
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1,250</p>
                    <p className="text-sm text-gray-600">Carteiras Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">45,230</p>
                    <p className="text-sm text-gray-600">
                      Pontos em Circulação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">89%</p>
                    <p className="text-sm text-gray-600">Taxa de Engajamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3,456</p>
                    <p className="text-sm text-gray-600">Transações Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                Fluxo de Transações
              </CardTitle>
              <CardDescription>
                Como o sistema processa transações de pontos e créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">
                      📈 Acumulação de Pontos
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Compra de produtos/serviços</li>
                      <li>• Login diário</li>
                      <li>• Referências de usuários</li>
                      <li>• Participação em campanhas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">📉 Uso de Pontos</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Resgate em compras</li>
                      <li>• Expiração por tempo</li>
                      <li>• Transferência entre carteiras</li>
                      <li>• Conversão para crédito</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Gestão de Pontos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Funcionalidades</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Acumulação automática por ações</li>
                    <li>• Sistema de recompensas configurável</li>
                    <li>• Validade configurável por tipo</li>
                    <li>• Conversão de moedas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Integrações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Conectores</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Checkout automático com pontos</li>
                    <li>• Webhooks para sistemas externos</li>
                    <li>• API REST completa</li>
                    <li>• SDK para aplicações</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                API Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Endpoints Principais
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-green-600">POST</span>{' '}
                        /api/wallet/transactions
                        <span className="text-gray-500 ml-2">
                          - Criar transação
                        </span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span>{' '}
                        /api/wallet/balance
                        <span className="text-gray-500 ml-2">
                          - Obter saldo atual
                        </span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">GET</span>{' '}
                        /api/wallet/history
                        <span className="text-gray-500 ml-2">
                          - Histórico de transações
                        </span>
                      </code>
                    </div>
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
                  <h4 className="font-medium text-gray-900 mb-2">
                    Adicionar Pontos por Compra
                  </h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
                      {`// Exemplo de adição de pontos
const transaction = {
  userId: "user123",
  type: "credit",
  amount: 100,
  reason: "purchase",
  orderId: "order456"
}

await fetch('/api/wallet/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(transaction)
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
                  <h4 className="font-medium text-gray-900 mb-2">
                    Problemas Comuns
                  </h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h5 className="font-medium text-gray-900">
                        Pontos não são creditados
                      </h5>
                      <p className="text-sm text-gray-600">
                        Verificar se a carteira está ativa, se as regras de
                        recompensa estão configuradas e se o usuário está
                        elegível.
                      </p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">
                        Transação falha
                      </h5>
                      <p className="text-sm text-gray-600">
                        Verificar saldo disponível, permissões do usuário e
                        configuração da carteira.
                      </p>
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
                    <Package className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Sistema de Checkout</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Integração com sistema de pagamentos
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/QUOTES_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Sistema de Orçamentos</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Sistema completo de orçamentos
                  </p>
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
                  <p className="text-sm text-gray-600">
                    Monitoramento em tempo real
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

