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
  Monitor,
  Smartphone,
  Tablet,
  Layers,
  GitBranch,
  BookMarked,
  Camera,
  Play,
  Terminal,
  FolderOpen
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
  badge?: string
}

interface ScreenDocumentation {
  id: string
  title: string
  route: string
  module: string
  description: string
  status: 'documented' | 'pending' | 'outdated'
  lastUpdated: string
  hasScreenshot: boolean
}

const documentationItems: DocumentationItem[] = [
  {
    id: 'SCREEN_DOCS',
    title: '📱 Documentação das Telas',
    description: 'Documentação técnica completa de todas as 31 telas da plataforma com estrutura padronizada',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: '2 de Setembro, 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['telas', 'documentação', 'técnica', 'onboarding'],
    url: '/admin/documentacao/viva/screens/README',
    icon: Monitor,
    badge: '31 Telas'
  },
  {
    id: 'DEVELOPER_GUIDE',
    title: '🚀 Guia do Desenvolvedor',
    description: 'Guia completo para desenvolvedores sobre como usar e manter a documentação técnica',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: '2 de Setembro, 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['desenvolvedor', 'guia', 'manutenção', 'padrões'],
    url: '/admin/documentacao/viva/DEVELOPER_GUIDE',
    icon: BookMarked
  },
  {
    id: 'SCREENSHOT_GUIDE',
    title: '📸 Guia de Screenshots',
    description: 'Guia para captura, organização e manutenção de screenshots das telas da plataforma',
    category: 'Design',
    version: 'v3.1.0',
    lastUpdated: '2 de Setembro, 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['screenshots', 'captura', 'organização', 'visual'],
    url: '/admin/documentacao/viva/SCREENSHOT_GUIDE',
    icon: Camera
  },
  {
    id: 'EXECUTIVE_SUMMARY',
    title: '📋 Resumo Executivo',
    description: 'Resumo completo do projeto de documentação técnica com métricas e resultados alcançados',
    category: 'Gestão',
    version: 'v3.1.0',
    lastUpdated: '2 de Setembro, 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['resumo', 'executivo', 'métricas', 'resultados'],
    url: '/admin/documentacao/viva/EXECUTIVE_SUMMARY',
    icon: BarChart3
  },
  {
    id: 'AUTOMATION_SCRIPT',
    title: '⚡ Script de Automação',
    description: 'Script automatizado para geração de documentação técnica de todas as telas',
    category: 'Ferramentas',
    version: 'v3.1.0',
    lastUpdated: '2 de Setembro, 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['automação', 'script', 'geração', 'documentação'],
    url: '/admin/documentacao/viva/AUTOMATION_SCRIPT',
    icon: Terminal
  },
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
    url: '/admin/documentacao/viva/PLATFORM_OVERVIEW',
    icon: BookOpen
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
    url: '/admin/documentacao/viva/USER_GUIDE',
    icon: BookOpen
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
    id: 'RBAC_SYSTEM',
    title: 'Sistema RBAC',
    description: 'Documentação completa do sistema de controle de acesso baseado em roles',
    category: 'Segurança',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['rbac', 'segurança', 'permissões', 'roles', 'v3.1.0'],
    url: '/admin/documentacao/viva/RBAC_SYSTEM',
    icon: Shield
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
    url: '/admin/documentacao/viva/QUOTES_SYSTEM',
    icon: FileText
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
    url: '/admin/documentacao/viva/CHECKOUT_SYSTEM',
    icon: ShoppingCart
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
    url: '/admin/documentacao/viva/MULTITENANCY',
    icon: Building
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
    url: '/admin/documentacao/viva/WALLET_SYSTEM',
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
    url: '/admin/documentacao/viva/REPLICATION_SYSTEM',
    icon: Package
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
    url: '/admin/documentacao/viva/USER_MANAGEMENT',
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
    url: '/admin/documentacao/viva/ADDRESS_MANAGEMENT',
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
    url: '/admin/documentacao/viva/DASHBOARDS',
    icon: BarChart3
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
    icon: FileText
  },
  {
    id: 'CHANGELOG_V3',
    title: 'Changelog v3.1.0',
    description: 'Histórico completo de mudanças e funcionalidades da versão 3.1.0',
    category: 'Fundamentos',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['changelog', 'mudanças', 'v3.1.0', 'funcionalidades'],
    url: '/admin/documentacao/viva/CHANGELOG',
    icon: FileText
  },
  {
    id: 'IMPLEMENTATION_SUMMARY',
    title: 'Resumo da Implementação',
    description: 'Resumo executivo da implementação completa da versão 3.1.0',
    category: 'Fundamentos',
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['implementação', 'resumo', 'v3.1.0', 'status'],
    url: '/admin/documentacao/viva/RESUMO_IMPLEMENTACAO_v3.1.0',
    icon: FileText
  }
]

const screenDocumentation: ScreenDocumentation[] = [
  // Admin Module
  {
    id: 'admin-dashboard',
    title: 'Dashboard Administrativo',
    route: '/admin/dashboard',
    module: 'Admin',
    description: 'Visão geral do sistema administrativo com métricas e estatísticas',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-changelog',
    title: 'Changelog do Sistema',
    route: '/admin/changelog',
    module: 'Admin',
    description: 'Histórico completo de mudanças e evolução da plataforma',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-usuarios',
    title: 'Gestão de Usuários',
    route: '/admin/usuarios',
    module: 'Admin',
    description: 'Controle completo de usuários do sistema',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-empresas',
    title: 'Gestão de Empresas',
    route: '/admin/empresas',
    module: 'Admin',
    description: 'Controle de empresas e multi-tenancy',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-lojas',
    title: 'Gestão de Lojas',
    route: '/admin/lojas',
    module: 'Admin',
    description: 'Gestão de lojas por empresa',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-produtos',
    title: 'Catálogo de Produtos',
    route: '/admin/produtos',
    module: 'Admin',
    description: 'Listagem de produtos base',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-orcamentos',
    title: 'Sistema de Orçamentos',
    route: '/admin/orcamentos',
    module: 'Admin',
    description: 'Sistema completo de orçamentos',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-pedidos',
    title: 'Gestão de Pedidos',
    route: '/admin/pedidos',
    module: 'Admin',
    description: 'Gestão completa de pedidos',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-relatorios',
    title: 'Relatórios e Analytics',
    route: '/admin/relatorios',
    module: 'Admin',
    description: 'Analytics e métricas avançadas',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-configuracoes',
    title: 'Configurações do Sistema',
    route: '/admin/configuracoes',
    module: 'Admin',
    description: 'Configurações gerais da plataforma',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-integracoes',
    title: 'Integrações Externas',
    route: '/admin/integracoes',
    module: 'Admin',
    description: 'Integrações com sistemas externos',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-categorias',
    title: 'Gestão de Categorias',
    route: '/admin/categorias',
    module: 'Admin',
    description: 'Gestão de categorias de produtos',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-gestores',
    title: 'Gestão de Gestores',
    route: '/admin/gestores',
    module: 'Admin',
    description: 'Gestão de gestores de empresa',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'admin-documentacao',
    title: 'Documentação Técnica',
    route: '/admin/documentacao',
    module: 'Admin',
    description: 'Central de documentação da plataforma',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  // Store Module
  {
    id: 'store-dashboard',
    title: 'Dashboard da Loja',
    route: '/store/dashboard',
    module: 'Store',
    description: 'Visão geral da loja para clientes',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'store-catalog',
    title: 'Catálogo de Produtos',
    route: '/store/catalog',
    module: 'Store',
    description: 'Listagem de produtos para compra',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'store-cart',
    title: 'Carrinho de Compras',
    route: '/store/cart',
    module: 'Store',
    description: 'Gestão do carrinho de compras',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'store-checkout',
    title: 'Processo de Checkout',
    route: '/store/checkout',
    module: 'Store',
    description: 'Processo de finalização de compra',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'store-orders',
    title: 'Histórico de Pedidos',
    route: '/store/orders',
    module: 'Store',
    description: 'Histórico de pedidos do usuário',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'store-profile',
    title: 'Perfil do Usuário',
    route: '/store/profile',
    module: 'Store',
    description: 'Dados e configurações do usuário',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'store-points',
    title: 'Sistema de Pontos',
    route: '/store/points',
    module: 'Store',
    description: 'Sistema de pontos e recompensas',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'store-product',
    title: 'Detalhes do Produto',
    route: '/store/product',
    module: 'Store',
    description: 'Página de detalhes do produto',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  // Gestor Module
  {
    id: 'gestor-dashboard',
    title: 'Dashboard do Gestor',
    route: '/gestor/dashboard',
    module: 'Gestor',
    description: 'Visão geral para gestores de empresa',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'gestor-users',
    title: 'Gestão de Funcionários',
    route: '/gestor/usuarios',
    module: 'Gestor',
    description: 'Gestão de funcionários da empresa',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'gestor-products',
    title: 'Gestão de Produtos',
    route: '/gestor/produtos',
    module: 'Gestor',
    description: 'Gestão de produtos da empresa',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'gestor-quotes',
    title: 'Sistema de Orçamentos',
    route: '/gestor/orcamentos',
    module: 'Gestor',
    description: 'Sistema de orçamentos para gestores',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'gestor-orders',
    title: 'Acompanhamento de Pedidos',
    route: '/gestor/pedidos',
    module: 'Gestor',
    description: 'Acompanhamento de pedidos da empresa',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  // Auth Module
  {
    id: 'auth-login',
    title: 'Sistema de Login',
    route: '/auth/login',
    module: 'Auth',
    description: 'Sistema de autenticação de usuários',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'auth-register',
    title: 'Cadastro de Usuário',
    route: '/auth/register',
    module: 'Auth',
    description: 'Processo de registro de novos usuários',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  {
    id: 'auth-forgot',
    title: 'Recuperação de Senha',
    route: '/auth/forgot',
    module: 'Auth',
    description: 'Recuperação de credenciais perdidas',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
  },
  // Onboarding
  {
    id: 'onboarding',
    title: 'Processo de Onboarding',
    route: '/onboarding',
    module: 'Onboarding',
    description: 'Processo de primeiro acesso à plataforma',
    status: 'documented',
    lastUpdated: '2 de Setembro, 2025',
    hasScreenshot: false
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

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedModule, setSelectedModule] = useState('all')

  const filteredDocs = documentationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredScreens = screenDocumentation.filter(screen => {
    const matchesSearch = screen.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screen.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === 'all' || screen.module === selectedModule
    return matchesSearch && matchesModule
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Aviso de atualização */}
      <Card className="border-yellow-300 bg-yellow-50">
        <CardContent className="py-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-yellow-900">Documentação pode estar desatualizada</p>
            <p className="text-sm text-yellow-800">Esta listagem é estática. Acesse as páginas de documentação para o conteúdo mais recente.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open('/docs/PLATFORM_OVERVIEW', '_self')}>Abrir Plataforma</Button>
            <Button variant="outline" onClick={() => window.open('/docs/API_REFERENCE', '_self')}>Abrir API</Button>
          </div>
        </CardContent>
      </Card>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="h-12 w-12 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Documentação da Plataforma</h1>
            <p className="text-xl text-gray-600">Yoobe v3.1.0 - Central de Conhecimento</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Star className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Clock className="h-3 w-3 mr-1" />
            Atualizado: 2 de Setembro, 2025
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Users className="h-3 w-3 mr-1" />
            Equipe Yoobe
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar na documentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {['all', 'Admin', 'Store', 'Gestor', 'Auth', 'Onboarding'].map(module => (
              <option key={module} value={module}>
                {module === 'all' ? 'Todos os Módulos' : module}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/documentacao/executar">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Play className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Executar Script</h3>
              <p className="text-sm text-gray-600">Gerar documentação automaticamente</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/documentacao/screenshots">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Camera className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Capturar Screenshots</h3>
              <p className="text-sm text-gray-600">Atualizar imagens das telas</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/documentacao/exportar">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Exportar Docs</h3>
              <p className="text-sm text-gray-600">Baixar documentação completa</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/documentacao/visualizar">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold">Visualizar</h3>
              <p className="text-sm text-gray-600">Ver todas as telas documentadas</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Documentation */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Documentação Principal</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>v{item.version}</span>
                  <span>{item.lastUpdated}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={item.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {item.status === 'active' ? 'Ativo' : item.status}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={item.url}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Acessar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Screen Documentation */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Monitor className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Documentação das Telas</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {screenDocumentation.filter(s => s.status === 'documented').length} de {screenDocumentation.length} documentadas
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScreens.map((screen) => (
            <Card key={screen.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <CardTitle className="text-base">{screen.title}</CardTitle>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(screen.status)}`}>
                    {getStatusIcon(screen.status)} {screen.status === 'documented' ? 'Documentada' : screen.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {screen.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {screen.module}
                  </span>
                  <span>{screen.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono">
                    {screen.route}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={screen.route}>
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Tela
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/documentacao/viva/screens/${screen.id}`}>
                        <FileText className="h-3 w-3 mr-1" />
                        Docs
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚀 Próximos Passos
          </h3>
          <p className="text-gray-600 mb-4">
            Documentação completa da plataforma Yoobe v3.1.0
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" className="bg-white" asChild>
              <Link href="/admin/documentacao/viva/DEVELOPER_GUIDE">
                📚 Ler Guia do Desenvolvedor
              </Link>
            </Button>
            <Button variant="outline" className="bg-white" asChild>
              <Link href="/admin/documentacao/screenshots">
                📸 Capturar Screenshots
              </Link>
            </Button>
            <Button variant="outline" className="bg-white" asChild>
              <Link href="/admin/documentacao/executar">
                ⚡ Executar Script de Automação
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
