'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GitBranch, 
  Star, 
  Wrench, 
  Shield, 
  Zap,
  Calendar,
  Tag,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Package,
  Globe,
  Database,
  Code,
  BookOpen
} from 'lucide-react'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'performance'
  items: string[]
  impact: 'high' | 'medium' | 'low'
  author: string
  tags: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2024-12-31',
    title: 'Sistema de Integrações Global',
    description: 'Implementação completa do sistema de integrações com Cubbo, gamificação e automação',
    type: 'feature',
    impact: 'high',
    author: 'Equipe Yoobe',
    tags: ['integração', 'cubbo', 'gamificação', 'automação'],
    items: [
      'Integração Cubbo Global para fulfillment centralizado',
      'Sistema de integrações para gestores (ERP, CRM, Gamificação)',
      'Plataformas de gamificação: Workvivo, Applause, Human',
      'Automação: Zapier, Floui, Make',
      'ERPs/CRMs: SAP, Salesforce, Oracle',
      'Gestão de usuários: AD, Google Workspace, M365',
      'Visualização de produtos na loja pública',
      'Modais de edição completos para produtos e funcionários',
      'Sistema de estoque integrado com Cubbo',
      'Interface de gestor completamente funcional'
    ]
  },
  {
    version: '1.5.0',
    date: '2024-12-15',
    title: 'Sistema Básico de Gestão',
    description: 'Implementação do sistema básico de gestão de produtos e usuários',
    type: 'feature',
    impact: 'medium',
    author: 'Equipe Yoobe',
    tags: ['gestão', 'produtos', 'usuários'],
    items: [
      'Sistema básico de gestão de produtos',
      'Autenticação e autorização',
      'Interface básica de gestor',
      'Sistema de pontos'
    ]
  },
  {
    version: '1.0.0',
    date: '2024-12-01',
    title: 'Lançamento Inicial',
    description: 'Versão inicial da plataforma Yoobe',
    type: 'feature',
    impact: 'high',
    author: 'Equipe Yoobe',
    tags: ['lançamento', 'base'],
    items: [
      'Estrutura base da plataforma',
      'Sistema de autenticação',
      'Interface básica',
      'Banco de dados inicial'
    ]
  }
]

const typeIcons = {
  feature: GitBranch,
  improvement: Star,
  fix: Wrench,
  security: Shield,
  performance: Zap
}

const typeColors = {
  feature: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  improvement: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  fix: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
  security: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  performance: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
}

const typeLabels = {
  feature: 'Nova Funcionalidade',
  improvement: 'Melhoria',
  fix: 'Correção',
  security: 'Segurança',
  performance: 'Performance'
}

const impactColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
}

const impactLabels = {
  high: 'Alto Impacto',
  medium: 'Médio Impacto',
  low: 'Baixo Impacto'
}

export default function ChangelogPage() {
  const [filteredChangelog, setFilteredChangelog] = useState<ChangelogEntry[]>(changelog)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedVersion, setSelectedVersion] = useState<string>('all')
  const [selectedImpact, setSelectedImpact] = useState<string>('all')

  useEffect(() => {
    filterChangelog()
  }, [searchTerm, selectedType, selectedVersion, selectedImpact])

  const filterChangelog = () => {
    let filtered = changelog

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType)
    }

    // Filtrar por versão
    if (selectedVersion !== 'all') {
      filtered = filtered.filter(entry => entry.version === selectedVersion)
    }

    // Filtrar por impacto
    if (selectedImpact !== 'all') {
      filtered = filtered.filter(entry => entry.impact === selectedImpact)
    }

    setFilteredChangelog(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const exportChangelog = () => {
    const dataStr = JSON.stringify(filteredChangelog, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `changelog-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getVersions = () => {
    return changelog.map(entry => entry.version)
  }

  const getTypeCount = (type: string) => {
    return changelog.filter(entry => entry.type === type).length
  }

  const getImpactCount = (impact: string) => {
    return changelog.filter(entry => entry.impact === impact).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📋 Changelog da Plataforma</h1>
              <p className="text-blue-100 text-lg">
                Histórico completo de mudanças e atualizações da Yoobe Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/20 text-white border-white/30">
                v2.0.0
              </Badge>
              <div className="text-right">
                <div className="text-sm text-blue-100">Última atualização</div>
                <div className="font-semibold">17 de Janeiro, 2024</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas com cards coloridos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total de Versões</p>
                  <p className="text-3xl font-bold">{changelog.length}</p>
                </div>
                <GitBranch className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Funcionalidades</p>
                  <p className="text-3xl font-bold">{getTypeCount('feature')}</p>
                </div>
                <Star className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Melhorias</p>
                  <p className="text-3xl font-bold">{getTypeCount('improvement')}</p>
                </div>
                <Wrench className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Performance</p>
                  <p className="text-3xl font-bold">{getTypeCount('performance')}</p>
                </div>
                <Zap className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros avançados */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="🔍 Buscar no changelog..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="border-2 focus:border-blue-500">
                  <SelectValue placeholder="📊 Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="feature">Funcionalidades</SelectItem>
                  <SelectItem value="improvement">Melhorias</SelectItem>
                  <SelectItem value="fix">Correções</SelectItem>
                  <SelectItem value="security">Segurança</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="border-2 focus:border-blue-500">
                  <SelectValue placeholder="🏷️ Versão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as versões</SelectItem>
                  {getVersions().map(version => (
                    <SelectItem key={version} value={version}>
                      v{version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                <SelectTrigger className="border-2 focus:border-blue-500">
                  <SelectValue placeholder="⚡ Impacto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os impactos</SelectItem>
                  <SelectItem value="high">Alto Impacto</SelectItem>
                  <SelectItem value="medium">Médio Impacto</SelectItem>
                  <SelectItem value="low">Baixo Impacto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={exportChangelog}
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Changelog
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              📈 Resultados ({filteredChangelog.length} de {changelog.length})
            </h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Atualizado
              </Badge>
            </div>
          </div>

          {filteredChangelog.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">Nenhum resultado encontrado para os filtros aplicados.</p>
                <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou termos de busca.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredChangelog.map((entry, index) => {
                const TypeIcon = typeIcons[entry.type]
                return (
                  <Card key={entry.version} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${typeColors[entry.type]}`}>
                              <TypeIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge className={typeColors[entry.type]}>
                                {typeLabels[entry.type]}
                              </Badge>
                              <Badge className={impactColors[entry.impact]}>
                                {impactLabels[entry.impact]}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <CardTitle className="text-2xl text-gray-800 mb-2">{entry.title}</CardTitle>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Tag className="h-4 w-4" />
                                <span className="font-semibold">v{entry.version}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(entry.date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{entry.author}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        {entry.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {entry.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-500" />
                          Principais mudanças:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {entry.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
