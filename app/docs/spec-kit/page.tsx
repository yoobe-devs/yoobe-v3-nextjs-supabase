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
  Monitor,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Activity,
  ChevronRight,
  Home,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface SpecKitItem {
  id: string
  title: string
  description: string
  category: string
  status: 'online' | 'offline' | 'warning'
  url: string
  icon: React.ComponentType<any>
  type: 'dashboard' | 'api' | 'documentation' | 'command'
  featured?: boolean
}

const specKitItems: SpecKitItem[] = [
  {
    id: 'dashboard-main',
    title: 'Dashboard Principal',
    description:
      'Interface web completa para gerenciar especificações e workflows',
    category: 'Interface',
    status: 'warning',
    url: 'http://localhost:3456',
    icon: Monitor,
    type: 'dashboard',
    featured: true,
  },
  {
    id: 'status-simple',
    title: 'Status Simples',
    description:
      'Relatório de diagnóstico rápido do sistema com informações essenciais',
    category: 'Documentação',
    status: 'online',
    url: 'http://localhost:8080/spec-kit-status-simple.html',
    icon: Activity,
    type: 'documentation',
    featured: true,
  },
  {
    id: 'monitoring-report',
    title: 'Relatório de Monitoramento',
    description: 'Status completo em tempo real com métricas detalhadas',
    category: 'Documentação',
    status: 'online',
    url: 'http://localhost:8080/spec-kit-monitoring-report.html',
    icon: BarChart3,
    type: 'documentation',
    featured: true,
  },
  {
    id: 'api-specs',
    title: 'API Especificações',
    description: 'Endpoint REST para acessar e gerenciar especificações',
    category: 'API',
    status: 'online',
    url: 'http://localhost:3456/api/specs',
    icon: Code,
    type: 'api',
  },
  {
    id: 'dashboard-diagnostic',
    title: 'Diagnóstico do Dashboard',
    description: 'Análise detalhada de problemas e soluções do dashboard',
    category: 'Documentação',
    status: 'online',
    url: 'http://localhost:8080/spec-kit-dashboard-diagnostic.html',
    icon: Wrench,
    type: 'documentation',
  },
  {
    id: 'troubleshooting',
    title: 'Guia de Solução de Problemas',
    description: 'Soluções passo a passo para problemas comuns',
    category: 'Documentação',
    status: 'online',
    url: 'http://localhost:8080/spec-kit-troubleshooting.html',
    icon: AlertTriangle,
    type: 'documentation',
  },
  {
    id: 'dashboard-status',
    title: 'Status do Dashboard',
    description: 'Diagnóstico completo do dashboard web com soluções',
    category: 'Documentação',
    status: 'online',
    url: 'http://localhost:8080/spec-kit-dashboard-status.html',
    icon: Activity,
    type: 'documentation',
  },
]

const commands = [
  {
    command: '/spec create',
    description: 'Criar nova especificação',
    category: 'Criação',
  },
  {
    command: '/spec track',
    description: 'Rastrear progresso de especificações',
    category: 'Monitoramento',
  },
  {
    command: '/spec approve',
    description: 'Gerenciar aprovações de especificações',
    category: 'Aprovação',
  },
  {
    command: '/spec bug',
    description: 'Relatórios de bugs e resoluções',
    category: 'Bugs',
  },
  {
    command: '/spec docs',
    description: 'Atualizar documentação',
    category: 'Documentação',
  },
]

const categories = [
  { id: 'all', name: 'Todos', icon: BookOpen },
  { id: 'Interface', name: 'Interface', icon: Monitor },
  { id: 'API', name: 'API', icon: Code },
  { id: 'Documentação', name: 'Documentação', icon: FileText },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'offline':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return '✅'
    case 'offline':
      return '❌'
    case 'warning':
      return '⚠️'
    default:
      return '❓'
  }
}

export default function SpecKitPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredItems = specKitItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const featuredItems = specKitItems.filter(item => item.featured)
  const regularItems = filteredItems.filter(item => !item.featured)

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Spec Kit - Gerenciamento de Especificações
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sistema integrado de especificações, workflows e documentação
          automática para a plataforma Yoobe v3
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <FileText className="h-3 w-3 mr-1" />
            {specKitItems.length} Recursos
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Star className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
        </div>
      </div>

      {/* Spec Kit Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900">
            🔧 Spec Kit - Sistema de Especificações
          </CardTitle>
          <CardDescription className="text-blue-700">
            O Spec Kit transforma a forma como você gerencia especificações,
            workflows e documentação na plataforma Yoobe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-1 text-blue-900">
              <li>✅ Especificações estruturadas</li>
              <li>✅ Workflows organizados</li>
              <li>✅ Documentação automática</li>
              <li>✅ Rastreamento de progresso</li>
              <li>✅ Sistema de aprovação</li>
            </ul>
            <div>
              <p className="font-semibold text-blue-900 mb-2">Status Atual</p>
              <ul className="space-y-1 text-blue-900">
                <li>🟢 Servidor MCP: Online</li>
                <li>🟢 API REST: Funcionando</li>
                <li>🟡 Dashboard Web: Problema de Interface</li>
                <li>🟢 Documentação: Disponível</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <a
              href="http://localhost:3456"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Acessar Dashboard
              </Button>
            </a>
            <a
              href="http://localhost:8080/spec-kit-status-simple.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Status Simples</Button>
            </a>
            <a
              href="http://localhost:8080/spec-kit/index.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Índice Completo</Button>
            </a>
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
                placeholder="Buscar recursos do Spec Kit..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
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

      {/* Featured Resources */}
      {featuredItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Recursos em Destaque
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 border-2 border-blue-100 hover:border-blue-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <item.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {item.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={getStatusColor(item.status)}
                          >
                            {getStatusIcon(item.status)} {item.status}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.category}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* All Resources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Todos os Recursos
          </h2>
          <div className="text-sm text-gray-500">
            {filteredItems.length} de {specKitItems.length} recursos
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularItems.map(item => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="h-full hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <item.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {item.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={getStatusColor(item.status)}
                        >
                          {getStatusIcon(item.status)} {item.status}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-gray-600 mb-3">
                    {item.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.category}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {regularItems.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum recurso encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termos de busca
            </p>
          </div>
        )}
      </div>

      {/* Commands Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-green-600" />
            Comandos MCP Disponíveis
          </CardTitle>
          <CardDescription>
            Comandos para usar o Spec Kit diretamente no Cursor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commands.map((cmd, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {cmd.category}
                  </Badge>
                </div>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded block mb-2">
                  {cmd.command}
                </code>
                <p className="text-sm text-gray-600">{cmd.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            <a
              href="http://localhost:3456"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full justify-start">
                <Monitor className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </a>
            <a
              href="http://localhost:8080/spec-kit-status-simple.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Status Simples
              </Button>
            </a>
            <a
              href="http://localhost:8080/spec-kit/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Índice Completo
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
