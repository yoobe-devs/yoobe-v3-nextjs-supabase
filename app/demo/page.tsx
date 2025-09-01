'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { YoobeLogo } from '@/components/ui/yoobe-logo'
import { 
  Users, 
  Heart, 
  Megaphone, 
  Calendar, 
  Store, 
  Gift, 
  TrendingUp, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  DollarSign,
  Target,
  Zap,
  Shield,
  Clock,
  Globe,
  Award,
  Trophy,
  Coffee,
  Briefcase,
  Smartphone,
  Home,
  Car,
  Plane,
  Camera,
  Headphones,
  Watch,
  BookOpen,
  Palette,
  Music,
  Gamepad2,
  Dumbbell,
  Utensils,
  Wine,
  ShoppingBag,
  CreditCard,
  Truck,
  MessageSquare,
  Bell,
  Settings,
  UserPlus,
  FileText,
  PieChart,
  Activity,
  CalendarDays,
  Users2,
  GiftIcon,
  ShoppingCart,
  Package,
  Tag,
  Percent,
  Award as AwardIcon,
  Medal,
  Crown,
  Sparkles,
  Rocket,
  Lightbulb,
  Target as TargetIcon,
  TrendingDown,
  RefreshCw,
  Eye,
  MousePointer,
  Smartphone as PhoneIcon,
  Monitor,
  Tablet,
  Laptop
} from 'lucide-react'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('rh')

  const areas = [
    {
      id: 'rh',
      name: 'Recursos Humanos',
      icon: Users,
      color: 'blue',
      description: 'Transforme seu programa de reconhecimento e engajamento'
    },
    {
      id: 'engajamento',
      name: 'Engajamento',
      icon: Heart,
      color: 'red',
      description: 'Aumente a satisfação e retenção dos funcionários'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: Megaphone,
      color: 'purple',
      description: 'Crie campanhas de incentivo e fidelização'
    },
    {
      id: 'eventos',
      name: 'Eventos',
      icon: Calendar,
      color: 'green',
      description: 'Gerencie brindes e premiações para eventos'
    }
  ]

  const rhFeatures = [
    {
      icon: Users,
      title: 'Programa de Reconhecimento',
      description: 'Sistema completo de pontos e recompensas para reconhecer funcionários',
      benefits: [
        'Aumento de 40% no engajamento',
        'Redução de 25% no turnover',
        'Melhoria na cultura organizacional'
      ]
    },
    {
      icon: Award,
      title: 'Gestão de Performance',
      description: 'Integre com sistemas de avaliação e reconhecimento',
      benefits: [
        'Feedback em tempo real',
        'Metas e objetivos claros',
        'Reconhecimento automático'
      ]
    },
    {
      icon: BarChart3,
      title: 'Analytics de RH',
      description: 'Relatórios detalhados sobre engajamento e satisfação',
      benefits: [
        'Métricas de satisfação',
        'Análise de turnover',
        'ROI do programa'
      ]
    }
  ]

  const engajamentoFeatures = [
    {
      icon: Heart,
      title: 'Gamificação Corporativa',
      description: 'Transforme tarefas diárias em experiências divertidas',
      benefits: [
        'Aumento de 60% na produtividade',
        'Maior satisfação no trabalho',
        'Competição saudável'
      ]
    },
    {
      icon: Target,
      title: 'Desafios e Missões',
      description: 'Crie desafios personalizados para diferentes equipes',
      benefits: [
        'Objetivos claros e mensuráveis',
        'Recompensas instantâneas',
        'Progresso visível'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Engajamento Contínuo',
      description: 'Mantenha os funcionários motivados com novidades constantes',
      benefits: [
        'Conteúdo atualizado regularmente',
        'Novos produtos no catálogo',
        'Campanhas sazonais'
      ]
    }
  ]

  const marketingFeatures = [
    {
      icon: Megaphone,
      title: 'Campanhas de Incentivo',
      description: 'Crie campanhas promocionais para aumentar vendas',
      benefits: [
        'Aumento de 35% nas vendas',
        'Maior motivação da equipe',
        'ROI mensurável'
      ]
    },
    {
      icon: TargetIcon,
      title: 'Fidelização de Clientes',
      description: 'Programas de pontos para clientes e parceiros',
      benefits: [
        'Retenção de clientes',
        'Aumento no ticket médio',
        'Referências orgânicas'
      ]
    },
    {
      icon: Sparkles,
      title: 'Branding Corporativo',
      description: 'Produtos personalizados com a marca da empresa',
      benefits: [
        'Maior visibilidade da marca',
        'Produtos exclusivos',
        'Diferenciação no mercado'
      ]
    }
  ]

  const eventosFeatures = [
    {
      icon: Calendar,
      title: 'Gestão de Eventos',
      description: 'Organize brindes e premiações para eventos corporativos',
      benefits: [
        'Logística simplificada',
        'Controle de estoque',
        'Entrega pontual'
      ]
    },
    {
      icon: Trophy,
      title: 'Premiações e Conquistas',
      description: 'Sistema de troféus e conquistas para eventos',
      benefits: [
        'Reconhecimento público',
        'Motivação para participação',
        'Memória do evento'
      ]
    },
    {
      icon: GiftIcon,
      title: 'Brindes Personalizados',
      description: 'Produtos exclusivos para cada tipo de evento',
      benefits: [
        'Produtos únicos',
        'Personalização completa',
        'Qualidade premium'
      ]
    }
  ]

  const productCategories = [
    {
      name: 'Tecnologia',
      icon: Smartphone,
      products: ['Power Banks', 'Fones Bluetooth', 'Carregadores', 'Smartwatches'],
      color: 'blue'
    },
    {
      name: 'Escritório',
      icon: Briefcase,
      products: ['Canecas Personalizadas', 'Agendas', 'Mochilas', 'Organizadores'],
      color: 'gray'
    },
    {
      name: 'Bem-estar',
      icon: Heart,
      products: ['Garrafas Térmicas', 'Yoga Mats', 'Produtos de Spa', 'Suplementos'],
      color: 'pink'
    },
    {
      name: 'Casa',
      icon: Home,
      products: ['Eletrodomésticos', 'Decoração', 'Utensílios', 'Jogos'],
      color: 'green'
    },
    {
      name: 'Esportes',
      icon: Dumbbell,
      products: ['Equipamentos Fitness', 'Roupas Esportivas', 'Acessórios', 'Suplementos'],
      color: 'orange'
    },
    {
      name: 'Lazer',
      icon: Gamepad2,
      products: ['Jogos de Tabuleiro', 'Livros', 'Instrumentos', 'Hobbies'],
      color: 'purple'
    }
  ]

  const getFeaturesByArea = (areaId: string) => {
    switch (areaId) {
      case 'rh': return rhFeatures
      case 'engajamento': return engajamentoFeatures
      case 'marketing': return marketingFeatures
      case 'eventos': return eventosFeatures
      default: return rhFeatures
    }
  }

  const getAreaColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
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
              <a href="#areas" className="text-gray-600 hover:text-gray-900">Áreas</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900">Funcionalidades</a>
              <a href="#products" className="text-gray-600 hover:text-gray-900">Produtos</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900">Demo</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/register">
                <Button variant="ghost">Criar Conta</Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Testar Gratuitamente
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
            🎯 Demo Interativo
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Descubra como a Yoobe
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}transforma sua empresa
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore todas as funcionalidades da Yoobe para diferentes áreas da sua empresa. 
            Veja como podemos revolucionar seu programa de reconhecimento e engajamento.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Ver Demo Completo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              <MessageSquare className="mr-2 h-5 w-5" />
              Agendar Apresentação
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Demo em 5 minutos
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Sem compromisso
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Suporte especializado
            </div>
          </div>
        </div>
      </section>

      {/* Areas Section */}
      <section id="areas" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Soluções por Área
            </h2>
            <p className="text-lg text-gray-600">
              Descubra como a Yoobe pode transformar diferentes áreas da sua empresa
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              {areas.map((area) => (
                <TabsTrigger key={area.id} value={area.id} className="flex items-center space-x-2">
                  <area.icon className="w-4 h-4" />
                  <span>{area.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {areas.map((area) => (
              <TabsContent key={area.id} value={area.id} className="mt-8">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getAreaColor(area.color)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <area.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{area.name}</h3>
                  <p className="text-lg text-gray-600">{area.description}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {getFeaturesByArea(area.id).map((feature, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className={`w-12 h-12 bg-gradient-to-r ${getAreaColor(area.color)} rounded-lg flex items-center justify-center mb-4`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Catálogo de Produtos
            </h2>
            <p className="text-lg text-gray-600">
              Milhares de produtos de qualidade para resgate com pontos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCategories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 bg-gradient-to-r ${getAreaColor(category.color)} rounded-lg flex items-center justify-center mb-4`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.products.map((product, productIndex) => (
                      <li key={productIndex} className="flex items-center text-sm text-gray-600">
                        <Gift className="w-4 h-4 text-gray-400 mr-2" />
                        {product}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Screenshots */}
      <section id="demo" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Screenshots da Plataforma
            </h2>
            <p className="text-lg text-gray-600">
              Veja como a Yoobe se parece na prática
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dashboard */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Dashboard Principal</CardTitle>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Dashboard com métricas</p>
                    <p className="text-xs text-gray-500">150 funcionários ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loja */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Loja Corporativa</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">Personalizada</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Store className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loja personalizada</p>
                    <p className="text-xs text-gray-500">2.500+ produtos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">App Mobile</CardTitle>
                  <Badge className="bg-purple-100 text-purple-800">Responsivo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">App mobile</p>
                    <p className="text-xs text-gray-500">iOS e Android</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <Badge className="bg-orange-100 text-orange-800">Real-time</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Relatórios detalhados</p>
                    <p className="text-xs text-gray-500">ROI mensurável</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestão */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Gestão de Usuários</CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-800">Admin</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Users2 className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Gestão completa</p>
                    <p className="text-xs text-gray-500">Departamentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrações */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Integrações</CardTitle>
                  <Badge className="bg-teal-100 text-teal-800">API</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-teal-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Integrações</p>
                    <p className="text-xs text-gray-500">Workvivo, Applause, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para transformar sua empresa?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já usam a Yoobe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Agendar Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              <MessageSquare className="mr-2 h-5 w-5" />
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <YoobeLogo size={32} variant="white" />
              <p className="text-gray-400 mt-4">
                Transformando programas de reconhecimento corporativo com 
                lojas de brindes personalizadas.
              </p>
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
