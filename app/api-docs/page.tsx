'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { YoobeLogo } from '@/components/ui/yoobe-logo'
import { 
  Code, 
  Zap, 
  Users, 
  Store, 
  Gift, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  Play,
  BookOpen,
  MessageSquare,
  Star,
  DollarSign,
  BarChart3,
  Settings,
  Globe,
  Lock,
  RefreshCw,
  Database,
  Webhook,
  Key,
  Terminal
} from 'lucide-react'

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const features = [
    {
      icon: Store,
      title: 'Criação Automática de Lojas',
      description: 'Crie lojas corporativas automaticamente via API'
    },
    {
      icon: Users,
      title: 'Sincronização de Usuários',
      description: 'Sincronize funcionários e pontos em tempo real'
    },
    {
      icon: Gift,
      title: 'Gestão de Produtos',
      description: 'Gerencie catálogos e estoque automaticamente'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançados',
      description: 'Relatórios detalhados de engajamento e resgates'
    },
    {
      icon: Webhook,
      title: 'Webhooks em Tempo Real',
      description: 'Receba notificações instantâneas de eventos'
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Autenticação JWT e criptografia SSL'
    }
  ]

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/stores',
      title: 'Criar Loja',
      description: 'Cria uma nova loja corporativa',
      example: {
        request: `{
  "platform": "workvivo",
  "company_name": "TechCorp",
  "company_email": "hr@techcorp.com",
  "employee_count": 150,
  "contact_name": "João Silva",
  "contact_email": "joao@techcorp.com",
  "plan": "professional"
}`,
        response: `{
  "success": true,
  "store": {
    "id": "store_123456",
    "domain": "techcorp.yoobe.com",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`
      }
    },
    {
      method: 'POST',
      path: '/api/v1/users/sync',
      title: 'Sincronizar Usuários',
      description: 'Sincroniza funcionários e seus pontos',
      example: {
        request: `{
  "platform": "workvivo",
  "users": [
    {
      "external_id": "wv_user_123",
      "email": "maria@techcorp.com",
      "name": "Maria Santos",
      "points": 1250,
      "department": "Marketing"
    }
  ]
}`,
        response: `{
  "success": true,
  "synced_users": 1,
  "total_points": 1250
}`
      }
    },
    {
      method: 'GET',
      path: '/api/v1/stores/{store_id}/analytics',
      title: 'Obter Analytics',
      description: 'Retorna métricas da loja',
      example: {
        request: `GET /api/v1/stores/store_123456/analytics?period=30d`,
        response: `{
  "success": true,
  "analytics": {
    "total_users": 150,
    "active_users": 89,
    "total_resgates": 45,
    "total_value": 12500.50,
    "avg_points_per_user": 850
  }
}`
      }
    }
  ]

  const pricing = [
    {
      name: 'Starter',
      price: 'Gratuito',
      description: 'Para testes e desenvolvimento',
      features: [
        '100 requisições/mês',
        '1 loja de teste',
        'Documentação básica',
        'Suporte por email'
      ]
    },
    {
      name: 'Growth',
      price: 'R$ 299',
      period: '/mês',
      description: 'Para plataformas em crescimento',
      features: [
        '10.000 requisições/mês',
        'Até 10 lojas',
        'Webhooks',
        'Suporte prioritário',
        'Revenue sharing 15%'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      description: 'Para grandes plataformas',
      features: [
        'Requisições ilimitadas',
        'Lojas ilimitadas',
        'SLA garantido',
        'Suporte dedicado 24/7',
        'Revenue sharing 20%',
        'Onboarding personalizado'
      ]
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <YoobeLogo size={32} variant="default" />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Funcionalidades</a>
              <a href="#endpoints" className="text-gray-600 hover:text-gray-900">Endpoints</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Preços</a>
              <a href="#support" className="text-gray-600 hover:text-gray-900">Suporte</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/register">
                <Button variant="ghost">Criar Conta</Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Acessar API
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            🚀 API v2.0 Disponível
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            API para
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Plataformas de Gamificação
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Integre a Yoobe na sua plataforma e ofereça lojas corporativas de brindes 
            para seus clientes. Aumente sua proposta de valor e gere receita adicional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
              <Key className="mr-2 h-5 w-5" />
              Obter API Key
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Setup em 5 minutos
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Revenue sharing até 20%
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Suporte técnico dedicado
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funcionalidades da API
            </h2>
            <p className="text-lg text-gray-600">
              Tudo que você precisa para integrar a Yoobe na sua plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section id="endpoints" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Documentação da API
            </h2>
            <p className="text-lg text-gray-600">
              Endpoints principais para integração
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="examples">Exemplos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Base URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    https://api.yoobe.com/v1
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Autenticação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Use sua API Key no header de todas as requisições:
                  </p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Webhook className="w-5 h-5 mr-2" />
                    Webhooks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Configure webhooks para receber notificações em tempo real:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Novo resgate de produto</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Atualização de pontos</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Criação de nova loja</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.path)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Request:</h4>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <pre>{endpoint.example.request}</pre>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Response:</h4>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <pre>{endpoint.example.response}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Terminal className="w-5 h-5 mr-2" />
                    Exemplo de Integração - Node.js
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`const axios = require('axios');

const yoobeAPI = axios.create({
  baseURL: 'https://api.yoobe.com/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Criar uma nova loja
async function createStore(companyData) {
  try {
    const response = await yoobeAPI.post('/stores', {
      platform: 'workvivo',
      company_name: companyData.name,
      company_email: companyData.email,
      employee_count: companyData.employeeCount,
      contact_name: companyData.contactName,
      contact_email: companyData.contactEmail,
      plan: 'professional'
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar loja:', error.response.data);
  }
}

// Sincronizar usuários
async function syncUsers(users) {
  try {
    const response = await yoobeAPI.post('/users/sync', {
      platform: 'workvivo',
      users: users
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao sincronizar usuários:', error.response.data);
  }
}`}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos da API
            </h2>
            <p className="text-lg text-gray-600">
              Escolha o plano ideal para sua plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <Card key={index} className={`border-2 ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  >
                    {plan.name === 'Enterprise' ? 'Falar com Vendas' : 'Começar Agora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para integrar a Yoobe?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se às principais plataformas de gamificação que já usam nossa API
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              <Key className="mr-2 h-5 w-5" />
              Obter API Key Gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              <MessageSquare className="mr-2 h-5 w-5" />
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="support" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <YoobeLogo size={32} variant="white" />
              <p className="text-gray-400 mt-4">
                API para plataformas de gamificação integrarem lojas corporativas de brindes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Documentação</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Guia de Início</a></li>
                <li><a href="#" className="hover:text-white">Referência da API</a></li>
                <li><a href="#" className="hover:text-white">Exemplos</a></li>
                <li><a href="#" className="hover:text-white">Webhooks</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Comunidade</a></li>
                <li><a href="#" className="hover:text-white">Status da API</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
                <li><a href="#" className="hover:text-white">Parcerias</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Yoobe. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
