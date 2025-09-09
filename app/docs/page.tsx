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
}

const documentationItems: DocumentationItem[] = [
  {
    id: 'PLATFORM_OVERVIEW',
    title: 'Visão Geral da Plataforma',
    description:
      'Introdução completa à Yoobe Platform v3.1.0, arquitetura e conceitos fundamentais',
    category: 'Fundamentos',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['introdução', 'arquitetura', 'conceitos', 'v3.1.0'],
    url: '/docs/PLATFORM_OVERVIEW',
    icon: BookOpen,
  },
  {
    id: 'USER_GUIDE',
    title: 'Manual do Usuário',
    description:
      'Guia completo para usuários da plataforma com todas as funcionalidades v3.1.0',
    category: 'Fundamentos',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['usuário', 'manual', 'funcionalidades', 'v3.1.0'],
    url: '/docs/USER_GUIDE',
    icon: BookOpen,
  },
  {
    id: 'API_REFERENCE',
    title: 'Referência da API',
    description:
      'Documentação completa de todos os endpoints da API REST v3.1.0',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['api', 'endpoints', 'rest', 'desenvolvimento', 'v3.1.0'],
    url: '/docs/API_REFERENCE',
    icon: Code,
  },
  {
    id: 'DATABASE_SCHEMA',
    title: 'Schema do Banco de Dados',
    description:
      'Estrutura completa do banco de dados v3.1.0 e relacionamentos',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['database', 'schema', 'tabelas', 'relacionamentos', 'v3.1.0'],
    url: '/docs/DATABASE_SCHEMA',
    icon: Database,
  },
  {
    id: 'RBAC_SYSTEM',
    title: 'Sistema RBAC',
    description:
      'Documentação completa do sistema de controle de acesso baseado em roles',
    category: 'Segurança',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['rbac', 'segurança', 'permissões', 'roles', 'v3.1.0'],
    url: '/docs/RBAC_SYSTEM',
    icon: Shield,
  },
  {
    id: 'SYSTEM_PROTECTION',
    title: 'Sistema de Proteção e Monitoramento',
    description:
      'Sistema abrangente de proteção e monitoramento do middleware e MCPs',
    category: 'Segurança',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: [
      'proteção',
      'monitoramento',
      'middleware',
      'mcp',
      'segurança',
      'v3.1.0',
    ],
    url: '/docs/SYSTEM_PROTECTION',
    icon: Shield,
  },
  {
    id: 'QUOTES_SYSTEM',
    title: 'Sistema de Orçamentos',
    description:
      'Fluxo completo de orçamentos, aprovação e replicação automática',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['orçamentos', 'quotes', 'aprovação', 'replicação', 'v3.1.0'],
    url: '/docs/QUOTES_SYSTEM',
    icon: FileText,
  },
  {
    id: 'CHECKOUT_SYSTEM',
    title: 'Sistema de Checkout',
    description:
      'Checkout avançado com múltiplos métodos de pagamento e validações',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['checkout', 'pagamento', 'carrinho', 'validação', 'v3.1.0'],
    url: '/docs/CHECKOUT_SYSTEM',
    icon: ShoppingCart,
  },
  {
    id: 'MULTITENANCY',
    title: 'Multi-tenancy',
    description: 'Sistema robusto de multi-tenancy com isolamento de dados',
    category: 'Arquitetura',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['multi-tenancy', 'empresas', 'isolamento', 'tenants', 'v3.1.0'],
    url: '/docs/MULTITENANCY',
    icon: Building,
  },
  {
    id: 'WALLET_SYSTEM',
    title: 'Sistema de Carteira',
    description: 'Gestão de pontos, transações e sistema de crédito/debito',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['carteira', 'pontos', 'transações', 'crédito', 'v3.1.0'],
    url: '/docs/WALLET_SYSTEM',
    icon: CreditCard,
  },
  {
    id: 'REPLICATION_SYSTEM',
    title: 'Sistema de Replicação',
    description: 'Replicação automática de produtos após pagamento confirmado',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['replicação', 'produtos', 'automação', 'pagamento', 'v3.1.0'],
    url: '/docs/REPLICATION_SYSTEM',
    icon: Package,
  },
  {
    id: 'USER_MANAGEMENT',
    title: 'Gestão de Usuários',
    description: 'Sistema de convites, roles e gestão de equipes',
    category: 'Administração',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['usuários', 'convites', 'equipes', 'gestão', 'v3.1.0'],
    url: '/docs/USER_MANAGEMENT',
    icon: Users,
  },
  {
    id: 'ADDRESS_MANAGEMENT',
    title: 'Gestão de Endereços',
    description: 'Sistema de endereços múltiplos com validação e padrão único',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['endereços', 'validação', 'cep', 'padrão', 'v3.1.0'],
    url: '/docs/ADDRESS_MANAGEMENT',
    icon: Globe,
  },
  {
    id: 'DASHBOARDS',
    title: 'Dashboards e Métricas',
    description: 'Dashboards em tempo real com métricas e analytics avançados',
    category: 'Funcionalidades',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['dashboards', 'métricas', 'analytics', 'tempo real', 'v3.1.0'],
    url: '/docs/DASHBOARDS',
    icon: BarChart3,
  },
  {
    id: 'DEPLOYMENT_GUIDE',
    title: 'Guia de Deploy',
    description:
      'Guia completo para deploy em desenvolvimento e produção v3.1.0',
    category: 'Operações',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['deploy', 'produção', 'vercel', 'docker', 'v3.1.0'],
    url: '/docs/DEPLOYMENT_GUIDE',
    icon: FileText,
  },
  {
    id: 'WORKVIVO',
    title: 'Workvivo (SSO & Pontos)',
    description: 'Como habilitar o SSO Workvivo e a integração de pontos',
    category: 'Operações',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['workvivo', 'sso', 'pontos', 'integração'],
    url: '/docs/HABILITAR_WORKVIVO_SSO_E_PONTOS',
    icon: BookOpen,
  },
  {
    id: 'SPEC_KIT_INTEGRATION',
    title: 'Spec Kit - Gerenciamento de Especificações',
    description:
      'Sistema integrado de especificações, workflows e documentação automática',
    category: 'Desenvolvimento',
    version: 'v3.1.0',
    lastUpdated: 'Setembro 2025',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['spec-kit', 'especificações', 'workflows', 'documentação', 'mcp'],
    url: '/docs/spec-kit',
    icon: Settings,
  },
]

const categories = [
  { id: 'all', name: 'Todas', icon: BookOpen },
  { id: 'Fundamentos', name: 'Fundamentos', icon: BookOpen },
  { id: 'Funcionalidades', name: 'Funcionalidades', icon: Package },
  { id: 'Desenvolvimento', name: 'Desenvolvimento', icon: Code },
  { id: 'Segurança', name: 'Segurança', icon: Shield },
  { id: 'Arquitetura', name: 'Arquitetura', icon: Building },
  { id: 'Administração', name: 'Administração', icon: Users },
  { id: 'Operações', name: 'Operações', icon: Settings },
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

import DocsNavigation from './components/DocsNavigation'

export default function DocumentationPage() {
  return <DocsNavigation />
}
