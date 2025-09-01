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
  User
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
    description: 'Introdução completa à Yoobe Platform, arquitetura e conceitos fundamentais',
    category: 'Fundamentos',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['introdução', 'arquitetura', 'conceitos'],
    url: '/docs/visual/PLATFORM_OVERVIEW',
    icon: BookOpen
  },
  {
    id: 'API_REFERENCE',
    title: 'Referência da API',
    description: 'Documentação completa de todos os endpoints da API REST',
    category: 'Desenvolvimento',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['api', 'endpoints', 'rest', 'desenvolvimento'],
    url: '/docs/visual/API_REFERENCE',
    icon: Code
  },
  {
    id: 'DATABASE_SCHEMA',
    title: 'Schema do Banco de Dados',
    description: 'Estrutura completa do banco de dados e relacionamentos',
    category: 'Desenvolvimento',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['database', 'schema', 'tabelas', 'relacionamentos'],
    url: '/docs/visual/DATABASE_SCHEMA',
    icon: Database
  },
  {
    id: 'CUBBO_INTEGRATION',
    title: 'Integração Cubbo',
    description: 'Guia completo para integração com Cubbo para fulfillment',
    category: 'Integrações',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['cubbo', 'fulfillment', 'integração', 'logística'],
    url: '/docs/visual/CUBBO_INTEGRATION',
    icon: Globe
  },
  {
    id: 'GAMIFICATION_INTEGRATION',
    title: 'Integração Gamificação',
    description: 'Integração com plataformas de gamificação (Workvivo, Applause, Human)',
    category: 'Integrações',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['gamificação', 'workvivo', 'applause', 'human', 'pontos'],
    url: '/docs/visual/GAMIFICATION_INTEGRATION',
    icon: Star
  },
  {
    id: 'AUTOMATION_INTEGRATION',
    title: 'Integração Automação',
    description: 'Integração com plataformas de automação (Zapier, Floui, Make)',
    category: 'Integrações',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['automação', 'zapier', 'floui', 'make', 'workflows'],
    url: '/docs/visual/AUTOMATION_INTEGRATION',
    icon: Zap
  },
  {
    id: 'ERP_CRM_INTEGRATION',
    title: 'Integração ERP/CRM',
    description: 'Integração com sistemas ERP e CRM (SAP, Salesforce, Oracle)',
    category: 'Integrações',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['erp', 'crm', 'sap', 'salesforce', 'oracle'],
    url: '/docs/visual/ERP_CRM_INTEGRATION',
    icon: Settings
  },
  {
    id: 'DEPLOYMENT_GUIDE',
    title: 'Guia de Deploy',
    description: 'Guia completo para deploy em desenvolvimento e produção',
    category: 'Operações',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    author: 'Equipe Yoobe',
    status: 'active',
    tags: ['deploy', 'produção', 'docker', 'nginx', 'pm2'],
    url: '/docs/visual/DEPLOYMENT_GUIDE',
    icon: FileText
  }
]

const categories = [
  { id: 'all', name: 'Todas', icon: BookOpen },
  { id: 'Fundamentos', name: 'Fundamentos', icon: BookOpen },
  { id: 'Desenvolvimento', name: 'Desenvolvimento', icon: Code },
  { id: 'Integrações', name: 'Integrações', icon: Zap },
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

export default function DocumentacaoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredDocs = documentationItems.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Documentação
          </h1>
          <p className="text-gray-600 mt-2">
            Documentação completa da plataforma Yoobe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="h-3 w-3 mr-1" />
            {documentationItems.length} Documentos
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Atualizada
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="🔍 Buscar na documentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total</p>
                <p className="text-2xl font-bold">{documentationItems.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Ativas</p>
                <p className="text-2xl font-bold">
                  {documentationItems.filter(doc => doc.status === 'active').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Categorias</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Atualizada</p>
                <p className="text-2xl font-bold">Hoje</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Documentação */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Documentação ({filteredDocs.length} de {documentationItems.length})
          </h2>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {filteredDocs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou termos de busca.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => {
              const IconComponent = doc.icon
              return (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <Badge className={getStatusColor(doc.status)}>
                            {getStatusIcon(doc.status)} {doc.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {doc.lastUpdated}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="text-xs">
                          v{doc.version}
                        </Badge>
                        <Link href={doc.url}>
                          <Button size="sm" className="group-hover:bg-blue-600 transition-colors">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📚 Precisa de ajuda?
          </h3>
          <p className="text-gray-600 mb-4">
            Nossa documentação está sempre sendo atualizada
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" className="bg-white">
              📧 Contato
            </Button>
            <Button variant="outline" className="bg-white">
              💬 Suporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
