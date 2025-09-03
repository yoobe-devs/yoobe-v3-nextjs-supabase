'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  FileText, 
  Code, 
  Database, 
  Zap, 
  Globe, 
  Settings,
  Download,
  Eye,
  Star,
  Clock,
  User,
  Shield,
  ShoppingCart,
  Users,
  Building,
  CreditCard,
  Package,
  BarChart3,
  ChevronRight,
  Home,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface DocumentationItem {
  id: string
  title: string
  description: string
  category: string
  version: string
  lastUpdated: string
  author: string
  status: 'active' | 'draft' | 'deprecated'
  tags: string[]
  url: string
  icon: React.ComponentType<any>
  featured?: boolean
}

const documentationItems: DocumentationItem[] = [
  {
    id: 'PLATFORM_OVERVIEW',
    title: 'Visão Geral da Plataforma',
    description: 'Introdução completa à Yoobe Platform v3.1.0, arquitetura e conceitos fundamentais',
    category: 'Fundamentos',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['introdução', 'arquitetura', 'conceitos', 'v3.1.0'],
    url: '/docs/PLATFORM_OVERVIEW',
    icon: BookOpen,
    featured: true
  },
  {
    id: 'USER_GUIDE',
    title: 'Manual do Usuário',
    description: 'Guia completo para usuários da plataforma com todas as funcionalidades v3.1.0',
    category: 'Fundamentos',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['usuário', 'manual', 'funcionalidades', 'v3.1.0'],
    url: '/docs/USER_GUIDE',
    icon: BookOpen,
    featured: true
  },
  {
    id: 'QUOTES_SYSTEM',
    title: 'Sistema de Orçamentos',
    description: 'Fluxo completo de orçamentos, aprovação e replicação automática',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['orçamentos', 'quotes', 'aprovação', 'replicação', 'v3.1.0'],
    url: '/docs/QUOTES_SYSTEM',
    icon: FileText,
    featured: true
  },
  {
    id: 'CHECKOUT_SYSTEM',
    title: 'Sistema de Checkout',
    description: 'Checkout avançado com múltiplos métodos de pagamento e validações',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['checkout', 'pagamento', 'carrinho', 'validação', 'v3.1.0'],
    url: '/docs/CHECKOUT_SYSTEM',
    icon: ShoppingCart,
    featured: true
  },
  {
    id: 'RBAC_SYSTEM',
    title: 'Sistema RBAC',
    description: 'Documentação completa do sistema de controle de acesso baseado em roles',
    category: 'Segurança',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['rbac', 'segurança', 'permissões', 'roles', 'v3.1.0'],
    url: '/docs/RBAC_SYSTEM',
    icon: Shield,
    featured: true
  },
  {
    id: 'SMART_DOCS_SYSTEM',
    title: 'Sistema Inteligente',
    description: 'Documentação completa do Sistema de Documentação Inteligente (Smart Docs).',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['docs', 'automação', 'monitoramento', 'smart-docs', 'v3.1.0'],
    url: '/admin/documentacao/viva/SMART_DOCS_SYSTEM_COMPLETE',
    icon: BookOpen,
    featured: true
  },
  {
    id: 'SMART_DOCS_GUIDE',
    title: 'Guia de Uso (Smart Docs)',
    description: 'Guia detalhado de uso e configuração do Sistema Inteligente de Documentação.',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['docs', 'guia', 'smart-docs', 'configuração', 'v3.1.0'],
    url: '/admin/documentacao/viva/SMART_DOCS_GUIDE',
    icon: BookOpen
  },
  {
    id: 'SMART_DOCS_QUICK_REFERENCE',
    title: 'Consulta Rápida (Smart Docs)',
    description: 'Referência rápida de comandos, endpoints e operações do Smart Docs.',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['docs', 'consulta', 'referência', 'smart-docs', 'v3.1.0'],
    url: '/admin/documentacao/viva/SMART_DOCS_QUICK_REFERENCE',
    icon: FileText
  },
  {
    id: 'MULTITENANCY',
    title: 'Multi-tenancy',
    description: 'Sistema robusto de multi-tenancy com isolamento de dados',
    category: 'Arquitetura',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['multi-tenancy', 'empresas', 'isolamento', 'tenants', 'v3.1.0'],
    url: '/docs/MULTITENANCY',
    icon: Building,
    featured: true
  },
  {
    id: 'WALLET_SYSTEM',
    title: 'Sistema de Carteira',
    description: 'Gestão de pontos, transações e sistema de crédito/debito',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['carteira', 'pontos', 'transações', 'crédito', 'v3.1.0'],
    url: '/docs/WALLET_SYSTEM',
    icon: CreditCard
  },
  {
    id: 'REPLICATION_SYSTEM',
    title: 'Sistema de Replicação',
    description: 'Replicação automática de produtos após pagamento confirmado',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['replicação', 'produtos', 'automação', 'pagamento', 'v3.1.0'],
    url: '/docs/REPLICATION_SYSTEM',
    icon: Package
  },
  {
    id: 'WALLET_SYSTEM',
    title: 'Sistema de Carteira',
    description: 'Gestão completa de pontos, transações e sistema de crédito/debito',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['carteira', 'pontos', 'transações', 'crédito', 'v3.1.0'],
    url: '/docs/WALLET_SYSTEM',
    icon: CreditCard
  },
  {
    id: 'USER_MANAGEMENT',
    title: 'Gestão de Usuários',
    description: 'Sistema de convites, roles e gestão de equipes',
    category: 'Administração',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['usuários', 'convites', 'equipes', 'gestão', 'v3.1.0'],
    url: '/docs/USER_MANAGEMENT',
    icon: Users
  },
  {
    id: 'ADDRESS_MANAGEMENT',
    title: 'Gestão de Endereços',
    description: 'Sistema de endereços múltiplos com validação e padrão único',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['endereços', 'validação', 'cep', 'padrão', 'v3.1.0'],
    url: '/docs/ADDRESS_MANAGEMENT',
    icon: Globe
  },
  {
    id: 'DASHBOARDS',
    title: 'Dashboards e Métricas',
    description: 'Dashboards em tempo real com métricas e analytics avançados',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['dashboards', 'métricas', 'analytics', 'tempo real', 'v3.1.0'],
    url: '/docs/DASHBOARDS',
    icon: BarChart3
  },
  {
    id: 'API_REFERENCE',
    title: 'Referência da API',
    description: 'Documentação completa de todos os endpoints da API REST v3.1.0',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['api', 'endpoints', 'rest', 'desenvolvimento', 'v3.1.0'],
    url: '/admin/documentacao/viva/API_REFERENCE',
    icon: Code
  },
  {
    id: 'DATABASE_SCHEMA',
    title: 'Schema do Banco de Dados',
    description: 'Estrutura completa do banco de dados v3.1.0 e relacionamentos',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['database', 'schema', 'tabelas', 'relacionamentos', 'v3.1.0'],
    url: '/admin/documentacao/viva/DATABASE_SCHEMA',
    icon: Database
  },
  {
    id: 'DEPLOYMENT_GUIDE',
    title: 'Guia de Deploy',
    description: 'Guia completo para deploy em desenvolvimento e produção v3.1.0',
    category: 'Operações',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['deploy', 'produção', 'vercel', 'docker', 'v3.1.0'],
    url: '/admin/documentacao/viva/DEPLOYMENT_GUIDE',
    icon: Settings
  }
]

const categories = [
  { id: 'all', name: 'Todas', icon: BookOpen },
  { id: 'Fundamentos', name: 'Fundamentos', icon: BookOpen },
  { id: 'Funcionalidades', name: 'Funcionalidades', icon: Package },
  { id: 'Desenvolvimento', name: 'Desenvolvimento', icon: Code },
  { id: 'Segurança', name: 'Segurança', icon: Shield },
  { id: 'Arquitetura', name: 'Arquitetura', icon: Building },
  { id: 'Administração', name: 'Administração', icon: Users },
  { id: 'Operações', name: 'Operações', icon: Settings }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'deprecated':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return '✅'
    case 'draft':
      return '📝'
    case 'deprecated':
      return '⚠️'
    default:
      return '❓'
  }
}

export default function DocsNavigation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredDocs = documentationItems.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const featuredDocs = documentationItems.filter(doc => doc.featured)
  const regularDocs = filteredDocs.filter(doc => !doc.featured)

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Home className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Documentação Yoobe v3.1.0</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Documentação completa da plataforma Yoobe v3.1.0 - Sistema de Orçamentos e Replicação
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="h-3 w-3 mr-1" />
            {documentationItems.length} Documentos
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Star className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
        </div>
      </div>

      {/* Smart Docs Banner */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-2xl text-indigo-900">🧠 Sistema de Documentação Inteligente</CardTitle>
          <CardDescription className="text-indigo-700">
            O Sistema de Documentação Inteligente transforma a forma como você gerencia conhecimento na plataforma Yoobe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-1 text-indigo-900">
              <li>✅ Documentação sempre atualizada</li>
              <li>✅ Prevenção inteligente de erros</li>
              <li>✅ Memória institucional preservada</li>
              <li>✅ Monitoramento automático</li>
              <li>✅ Consistência garantida</li>
            </ul>
            <div>
              <p className="font-semibold text-indigo-900 mb-2">Próximos Passos</p>
              <ol className="list-decimal ml-5 space-y-1 text-indigo-900">
                <li>Inicialize: <code className="bg-white/70 px-1 rounded border">node scripts/init-smart-docs.js</code></li>
                <li>Configure o monitoramento dos diretórios</li>
                <li>Registre erros conhecidos (base de conhecimento)</li>
                <li>Integre ao workflow do time</li>
                <li>Aproveite a prevenção inteligente</li>
              </ol>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Link href="/admin/documentacao/viva/SMART_DOCS_SYSTEM_COMPLETE">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Ver Sistema Inteligente</Button>
            </Link>
            <Link href="/admin/documentacao/viva/SMART_DOCS_QUICK_REFERENCE">
              <Button variant="outline">Consulta Rápida</Button>
            </Link>
            <Link href="/admin/documentacao/viva/SMART_DOCS_GUIDE">
              <Button variant="outline">Guia de Uso</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar na documentação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Documentation */}
      {featuredDocs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Documentação em Destaque</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDocs.map((doc) => (
              <Link key={doc.id} href={doc.url} className="block">
                <Card className="h-full hover:shadow-lg transition-all duration-200 border-2 border-blue-100 hover:border-blue-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <doc.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                          <Badge variant="outline" className={getStatusColor(doc.status)}>
                            {getStatusIcon(doc.status)} {doc.status}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-3">
                      {doc.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.category}</span>
                      <span>{doc.lastUpdated}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* All Documentation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Toda a Documentação</h2>
          <div className="text-sm text-gray-500">
            {filteredDocs.length} de {documentationItems.length} documentos
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularDocs.map((doc) => (
            <Link key={doc.id} href={doc.url} className="block">
              <Card className="h-full hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <doc.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                        <Badge variant="outline" className={getStatusColor(doc.status)}>
                          {getStatusIcon(doc.status)} {doc.status}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-gray-600 mb-3">
                    {doc.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.category}</span>
                    <span>{doc.lastUpdated}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {regularDocs.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/changelog" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Ver Changelog
              </Button>
            </Link>
            <Link href="/admin/documentacao/viva/SMART_DOCS_SYSTEM_COMPLETE" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Sistema Inteligente
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
