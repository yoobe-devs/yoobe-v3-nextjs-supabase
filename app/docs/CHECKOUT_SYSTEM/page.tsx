'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  CheckCircle, 
  CreditCard, 
  Shield, 
  Truck,
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
  Lock,
  AlertTriangle,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSystemPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            Sistema de Checkout v3.1.0
          </h1>
          <p className="text-gray-600 mt-2">
            Checkout avançado com múltiplos métodos de pagamento, validações e integração completa
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
        <span className="text-gray-900 font-medium">Sistema de Checkout</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workflow">Fluxo de Checkout</TabsTrigger>
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
                Sistema de checkout completo com múltiplos métodos de pagamento, validações e segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Múltiplos métodos de pagamento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Validação avançada de dados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Sistema de carrinho inteligente
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Integração com gateways de pagamento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Segurança e criptografia
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
                      Stripe + PayPal
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-red-500" />
                      Criptografia SSL/TLS
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
│   Frontend      │    │   API Layer     │    │   Payment      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   Gateways     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Interface de         Controle de           Stripe, PayPal,
    Usuário              Negócio               PIX, etc.
         │                       │                       │
         ▼                       ▼                       ▼
    Carrinho de          Validações e          Processamento
    Compras               Regras de             de Pagamento
         │               Negócio                       │
         ▼                       │                       ▼
    Checkout e           Segurança e            Confirmação
    Pagamento            Criptografia          de Transação`}
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
                Fluxo de Checkout
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
                    <h4 className="font-medium text-sm">Carrinho</h4>
                    <p className="text-xs text-gray-500">Adicionar produtos</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-sm">Checkout</h4>
                    <p className="text-xs text-gray-500">Iniciar compra</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-sm">Dados</h4>
                    <p className="text-xs text-gray-500">Preencher dados</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <h4 className="font-medium text-sm">Pagamento</h4>
                    <p className="text-xs text-gray-500">Escolher método</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-600 font-bold">5</span>
                    </div>
                    <h4 className="font-medium text-sm">Validação</h4>
                    <p className="text-xs text-gray-500">Processar pagamento</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 font-bold">6</span>
                    </div>
                    <h4 className="font-medium text-sm">Confirmação</h4>
                    <p className="text-xs text-gray-500">Pedido confirmado</p>
                  </div>
                </div>

                <Separator />

                {/* Payment Methods */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Métodos de Pagamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Cartão de Crédito</Badge>
                        <span className="text-sm text-gray-600">Visa, Mastercard, Amex</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">PIX</Badge>
                        <span className="text-sm text-gray-600">Pagamento instantâneo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">PayPal</Badge>
                        <span className="text-sm text-gray-600">Carteira digital</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Boleto</Badge>
                        <span className="text-sm text-gray-600">Pagamento bancário</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">Transferência</Badge>
                        <span className="text-sm text-gray-600">TED/DOC</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Carteira</Badge>
                        <span className="text-sm text-gray-600">Pontos Yoobe</span>
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
                  <h5 className="font-medium text-gray-900">Carrinho Inteligente</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Adição/remoção de produtos</li>
                    <li>• Cálculo automático de preços</li>
                    <li>• Aplicação de cupons e descontos</li>
                    <li>• Persistência de sessão</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Validação de Dados</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Validação de endereços</li>
                    <li>• Verificação de CPF/CNPJ</li>
                    <li>• Validação de cartão de crédito</li>
                    <li>• Verificação de estoque</li>
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
                  <h5 className="font-medium text-gray-900">Segurança</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Criptografia SSL/TLS</li>
                    <li>• Tokenização de cartões</li>
                    <li>• Proteção contra fraudes</li>
                    <li>• Auditoria de transações</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Integrações</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Múltiplos gateways de pagamento</li>
                    <li>• Sistema de notificações</li>
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
                        <span className="text-green-600">POST</span> /api/cart/add
                        <span className="text-gray-500 ml-2">- Adicionar ao carrinho</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/cart
                        <span className="text-gray-500 ml-2">- Obter carrinho</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">POST</span> /api/checkout/start
                        <span className="text-gray-500 ml-2">- Iniciar checkout</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">POST</span> /api/payment/process
                        <span className="text-gray-500 ml-2">- Processar pagamento</span>
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modelos de Dados</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`interface CartItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
}

interface CheckoutSession {
  id: string
  user_id: string
  cart_items: CartItem[]
  total_amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  payment_method: string
  created_at: string
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
                  <h4 className="font-medium text-gray-900 mb-2">Adicionar ao Carrinho</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Adicionar produto ao carrinho
const response = await fetch('/api/cart/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 'prod_123',
    quantity: 2
  })
})

const cartItem = await response.json()`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Processar Pagamento</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Processar pagamento com cartão
const response = await fetch('/api/payment/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    checkout_session_id: 'session_456',
    payment_method: 'card',
    card_token: 'tok_visa',
    amount: 15000
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
                      <h5 className="font-medium text-gray-900">Pagamento recusado</h5>
                      <p className="text-sm text-gray-600">Verificar dados do cartão, limite disponível e configuração do gateway.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Carrinho não persiste</h5>
                      <p className="text-sm text-gray-600">Verificar configuração de sessão e cookies do navegador.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Validação falha</h5>
                      <p className="text-sm text-gray-600">Verificar formato dos dados e regras de validação configuradas.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/cart/status"
                        <span className="text-gray-500 ml-2">- Verificar status do carrinho</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/payment/methods"
                        <span className="text-gray-500 ml-2">- Listar métodos disponíveis</span>
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
            <Link href="/docs/WALLET_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Sistema de Carteira</h4>
                  </div>
                  <p className="text-sm text-gray-600">Gestão de pontos e transações</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/ADDRESS_MANAGEMENT" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Gestão de Endereços</h4>
                  </div>
                  <p className="text-sm text-gray-600">Sistema de endereços múltiplos</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
