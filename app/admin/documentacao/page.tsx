'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  Code, 
  Database, 
  Globe, 
  Settings,
  ExternalLink,
  Download,
  Search,
  Filter,
  Eye
} from 'lucide-react'

interface DocumentationItem {
  id: string
  title: string
  description: string
  category: 'api' | 'integration' | 'setup' | 'deployment' | 'troubleshooting'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  url?: string
  file?: string
}

const documentation: DocumentationItem[] = [
  {
    id: 'platform-overview',
    title: 'Visão Geral da Plataforma',
    description: 'Documentação completa da arquitetura e funcionalidades da Yoobe Platform',
    category: 'setup',
    difficulty: 'beginner',
    url: '/docs/PLATFORM_OVERVIEW.md'
  },
  {
    id: 'cubbo-integration',
    title: 'Integração Cubbo',
    description: 'Guia completo para configuração e uso da integração com Cubbo',
    category: 'integration',
    difficulty: 'intermediate',
    url: '/docs/CUBBO_INTEGRATION.md'
  },
  {
    id: 'api-reference',
    title: 'Referência da API',
    description: 'Documentação completa de todas as APIs disponíveis',
    category: 'api',
    difficulty: 'intermediate',
    url: '/docs/API_REFERENCE.md'
  },
  {
    id: 'database-schema',
    title: 'Schema do Banco de Dados',
    description: 'Estrutura completa das tabelas e relacionamentos',
    category: 'setup',
    difficulty: 'advanced',
    url: '/docs/DATABASE_SCHEMA.md'
  },
  {
    id: 'deployment-guide',
    title: 'Guia de Deploy',
    description: 'Instruções para deploy em produção',
    category: 'deployment',
    difficulty: 'intermediate',
    url: '/docs/DEPLOYMENT_GUIDE.md'
  },
  {
    id: 'troubleshooting',
    title: 'Solução de Problemas',
    description: 'Guia para resolver problemas comuns',
    category: 'troubleshooting',
    difficulty: 'beginner',
    url: '/docs/TROUBLESHOOTING.md'
  },
  {
    id: 'gamification-integration',
    title: 'Integração Gamificação',
    description: 'Configuração de plataformas de gamificação (Workvivo, Applause, Human)',
    category: 'integration',
    difficulty: 'intermediate',
    url: '/docs/GAMIFICATION_INTEGRATION.md'
  },
  {
    id: 'automation-integration',
    title: 'Integração Automação',
    description: 'Configuração de plataformas de automação (Zapier, Floui, Make)',
    category: 'integration',
    difficulty: 'intermediate',
    url: '/docs/AUTOMATION_INTEGRATION.md'
  },
  {
    id: 'erp-crm-integration',
    title: 'Integração ERP/CRM',
    description: 'Configuração de integrações com SAP, Salesforce, Oracle',
    category: 'integration',
    difficulty: 'advanced',
    url: '/docs/ERP_CRM_INTEGRATION.md'
  }
]

const categoryIcons = {
  api: Code,
  integration: Settings,
  setup: Database,
  deployment: Globe,
  troubleshooting: FileText
}

const categoryColors = {
  api: 'bg-blue-100 text-blue-800',
  integration: 'bg-green-100 text-green-800',
  setup: 'bg-purple-100 text-purple-800',
  deployment: 'bg-orange-100 text-orange-800',
  troubleshooting: 'bg-red-100 text-red-800'
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export default function DocumentacaoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDocs = documentation.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || doc.difficulty === selectedDifficulty
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  const categories = ['all', ...Array.from(new Set(documentation.map(doc => doc.category)))]
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentação</h1>
          <p className="text-gray-600 mt-2">
            Documentação completa da Yoobe Platform
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Tudo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar na documentação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas as categorias' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'Todas as dificuldades' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Documentação ({filteredDocs.length} de {documentation.length})
          </h2>
        </div>

        {filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhuma documentação encontrada para os filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => {
              const CategoryIcon = categoryIcons[doc.category]
              return (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5" />
                        <Badge className={categoryColors[doc.category]}>
                          {doc.category}
                        </Badge>
                      </div>
                      <Badge className={difficultyColors[doc.difficulty]}>
                        {doc.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {doc.description}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {doc.url && (
                          <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')} className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            Markdown
                          </Button>
                        )}
                        {doc.url && (
                          <Button 
                            size="sm" 
                            onClick={() => window.open(`/docs/visual/${doc.url.split('/').pop()?.replace('.md', '')}`, '_blank')}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visual
                          </Button>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download HTML
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Seção de Links Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Configuração</h4>
              <ul className="space-y-1 text-sm">
                <li><a href="/docs/PLATFORM_OVERVIEW.md" className="text-blue-600 hover:underline">Visão Geral</a></li>
                <li><a href="/docs/DATABASE_SCHEMA.md" className="text-blue-600 hover:underline">Schema do Banco</a></li>
                <li><a href="/docs/DEPLOYMENT_GUIDE.md" className="text-blue-600 hover:underline">Guia de Deploy</a></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Integrações</h4>
              <ul className="space-y-1 text-sm">
                <li><a href="/docs/CUBBO_INTEGRATION.md" className="text-blue-600 hover:underline">Cubbo</a></li>
                <li><a href="/docs/GAMIFICATION_INTEGRATION.md" className="text-blue-600 hover:underline">Gamificação</a></li>
                <li><a href="/docs/AUTOMATION_INTEGRATION.md" className="text-blue-600 hover:underline">Automação</a></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
