'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  Users, 
  Gift, 
  Zap, 
  Shield, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Play,
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  Target,
  BarChart3,
  Settings,
  Code,
  Database,
  Cloud,
  Lock,
  RefreshCw,
  Heart,
  ShoppingCart,
  CreditCard,
  Truck,
  Headphones,
  Rocket,
  Crown,
  Megaphone,
  Calendar
} from 'lucide-react'
import { YoobeLogo } from '@/components/ui/yoobe-logo'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('empresas')

  const features = [
    {
      icon: Store,
      title: 'Loja Corporativa Personalizada',
      description: 'Crie sua própria loja de brindes corporativos com sua marca e produtos exclusivos'
    },
    {
      icon: Users,
      title: 'Gestão de Funcionários',
      description: 'Cadastre e gerencie seus funcionários com sistema de pontos integrado'
    },
    {
      icon: Gift,
      title: 'Catálogo de Produtos',
      description: 'Acesso a milhares de produtos de qualidade para resgate com pontos'
    },
    {
      icon: Zap,
      title: 'Integração com Gamificação',
      description: 'Conecte com Workvivo, Applause, Human e outras plataformas'
    },
    {
      icon: Shield,
      title: 'Fulfillment Automatizado',
      description: 'Entrega automática via Cubbo com rastreamento em tempo real'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avançados',
      description: 'Relatórios detalhados de engajamento e resgates'
    }
  ]

  const integrations = [
    { name: 'Workvivo', logo: '🎯', description: 'Reconhecimento e engajamento' },
    { name: 'Applause', logo: '👏', description: 'Feedback e avaliações' },
    { name: 'Human', logo: '💪', description: 'Desenvolvimento de pessoas' },
    { name: 'Zapier', logo: '🔗', description: 'Automação de workflows' },
    { name: 'Floui', logo: '🇧🇷', description: 'Automação brasileira' },
    { name: 'Make', logo: '⚙️', description: 'Workflows avançados' }
  ]

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'HR Manager',
      company: 'TechCorp',
      content: 'A Yoobe revolucionou nosso programa de reconhecimento. Os funcionários adoram resgatar brindes!',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'CEO',
      company: 'StartupXYZ',
      content: 'Integração perfeita com nossa plataforma de gamificação. Resultados impressionantes!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'People Ops',
      company: 'InnovateLab',
      content: 'Fácil de configurar e gerenciar. O suporte é excepcional!',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'R$ 299',
      period: '/mês',
      description: 'Ideal para empresas pequenas',
      features: [
        'Até 50 funcionários',
        'Loja personalizada',
        'Catálogo básico',
        'Integração com 1 plataforma',
        'Suporte por email',
        'Relatórios básicos'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: 'R$ 599',
      period: '/mês',
      description: 'Para empresas em crescimento',
      features: [
        'Até 200 funcionários',
        'Loja personalizada avançada',
        'Catálogo completo',
        'Integração com 3 plataformas',
        'Suporte prioritário',
        'Analytics avançados',
        'API personalizada'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      description: 'Para grandes empresas',
      features: [
        'Funcionários ilimitados',
        'Loja white-label',
        'Catálogo customizado',
        'Integração ilimitada',
        'Suporte dedicado 24/7',
        'Analytics customizados',
        'API completa',
        'Onboarding personalizado'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <YoobeLogo size={32} variant="default" />
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Funcionalidades</a>
              <a href="#integrations" className="text-gray-600 hover:text-gray-900">Integrações</a>
              <Link href="/demo" className="text-gray-600 hover:text-gray-900">Demo</Link>
              <Link href="/api-docs" className="text-gray-600 hover:text-gray-900">API</Link>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Preços</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contato</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            🚀 Nova versão disponível
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme seu programa de
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}reconhecimento
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Crie sua loja corporativa de brindes, integre com plataformas de gamificação 
            e aumente o engajamento dos seus funcionários com resgates automáticos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                Criar Loja Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
              Sem cartão de crédito
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Cancelamento gratuito
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Para quem é a Yoobe?
            </h2>
            <p className="text-lg text-gray-600">
              Oferecemos soluções para empresas e plataformas de gamificação
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('empresas')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'empresas'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏢 Empresas
              </button>
              <button
                onClick={() => setActiveTab('gamificacao')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'gamificacao'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎮 Plataformas de Gamificação
              </button>
            </div>
          </div>

          {activeTab === 'empresas' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Transforme seu programa de reconhecimento
                </h3>
                <p className="text-gray-600 mb-6">
                  A Yoobe revoluciona como sua empresa reconhece e recompensa funcionários, 
                  criando uma cultura de engajamento e motivação.
                </p>
                
                {/* RH Section */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-900">Recursos Humanos</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Redução de 25% no turnover</li>
                    <li>• Aumento de 40% no engajamento</li>
                    <li>• Melhoria na cultura organizacional</li>
                  </ul>
                </div>

                {/* Marketing Section */}
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Megaphone className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-900">Marketing</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• Campanhas de incentivo com ROI mensurável</li>
                    <li>• Branding corporativo com produtos personalizados</li>
                    <li>• Fidelização de clientes e parceiros</li>
                  </ul>
                </div>

                {/* Eventos Section */}
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Eventos</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Gestão completa de brindes para eventos</li>
                    <li>• Sistema de premiações e conquistas</li>
                    <li>• Logística simplificada e entrega pontual</li>
                  </ul>
                </div>
                <Link href="/auth/register">
                  <Button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Criar Loja Agora
                  </Button>
                </Link>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Loja Corporativa</h4>
                    <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Funcionários</span>
                      <span className="font-semibold">150</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Produtos</span>
                      <span className="font-semibold">2.5k+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Resgates/mês</span>
                      <span className="font-semibold text-green-600">89</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gamificacao' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Integre nossa API na sua plataforma
                </h3>
                <p className="text-gray-600 mb-6">
                  Ofereça lojas corporativas de brindes para seus clientes e 
                  aumente significativamente sua proposta de valor.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    API REST completa e documentada
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Criação automática de lojas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Sincronização de pontos em tempo real
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Revenue sharing atrativo
                  </li>
                </ul>
                <div className="flex space-x-3 mt-6">
                  <Link href="/api-docs">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Ver Documentação da API
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline">
                      Obter API Key
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">API Integration</h4>
                    <Badge className="bg-blue-100 text-blue-800">v2.0</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Endpoints</span>
                      <span className="font-semibold">25+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-semibold text-green-600">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Documentação</span>
                      <span className="font-semibold text-blue-600">Completa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-lg text-gray-600">
              Funcionalidades poderosas para transformar seu programa de reconhecimento
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

      {/* Integrations Section */}
      <section id="integrations" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Integrações que fazem a diferença
            </h2>
            <p className="text-lg text-gray-600">
              Conecte com as principais plataformas de gamificação e automação
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="border border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{integration.logo}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-gray-600">
              Empresas que transformaram seus programas de reconhecimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos que crescem com você
            </h2>
            <p className="text-lg text-gray-600">
              Escolha o plano ideal para o tamanho da sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
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
            Pronto para transformar seu programa de reconhecimento?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já usam a Yoobe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <YoobeLogo size={32} variant="white" />
              <p className="text-gray-400 mb-4">
                Transformando programas de reconhecimento corporativo com 
                lojas de brindes personalizadas e integração com gamificação.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white">Integrações</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Chat</a></li>
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
