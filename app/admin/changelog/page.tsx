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
  RefreshCw
} from 'lucide-react'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'performance'
  items: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2024-12-31',
    title: 'Sistema de Integrações Global',
    description: 'Implementação completa do sistema de integrações com Cubbo, gamificação e automação',
    type: 'feature',
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
  feature: 'bg-blue-100 text-blue-800 border-blue-200',
  improvement: 'bg-green-100 text-green-800 border-green-200',
  fix: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  security: 'bg-red-100 text-red-800 border-red-200',
  performance: 'bg-purple-100 text-purple-800 border-purple-200'
}

const typeLabels = {
  feature: 'Nova Funcionalidade',
  improvement: 'Melhoria',
  fix: 'Correção',
  security: 'Segurança',
  performance: 'Performance'
}

export default function ChangelogPage() {
  const [filteredChangelog, setFilteredChangelog] = useState<ChangelogEntry[]>(changelog)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedVersion, setSelectedVersion] = useState<string>('all')

  useEffect(() => {
    filterChangelog()
  }, [searchTerm, selectedType, selectedVersion])

  const filterChangelog = () => {
    let filtered = changelog

    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType)
    }

    if (selectedVersion !== 'all') {
      filtered = filtered.filter(entry => entry.version === selectedVersion)
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
    link.click()
    URL.revokeObjectURL(url)
  }

  const getVersions = () => {
    return changelog.map(entry => entry.version)
  }

  const getTypeCount = (type: string) => {
    return changelog.filter(entry => entry.type === type).length
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Changelog da Plataforma</h1>
          <p className="text-gray-600 mt-2">
            Histórico completo de mudanças e atualizações da Yoobe Platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            v2.0.0
          </Badge>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Versões</p>
                <p className="text-2xl font-bold">{changelog.length}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Funcionalidades</p>
                <p className="text-2xl font-bold">{getTypeCount('feature')}</p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Melhorias</p>
                <p className="text-2xl font-bold">{getTypeCount('improvement')}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Correções</p>
                <p className="text-2xl font-bold">{getTypeCount('fix')}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-2xl font-bold">{getTypeCount('performance')}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar no changelog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
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
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Versão" />
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
            <Button variant="outline" onClick={exportChangelog}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Resultados ({filteredChangelog.length} de {changelog.length})
          </h2>
        </div>

        {filteredChangelog.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum resultado encontrado para os filtros aplicados.</p>
            </Card>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredChangelog.map((entry, index) => {
              const TypeIcon = typeIcons[entry.type]
              return (
                <Card key={entry.version} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-6 w-6" />
                          <Badge className={typeColors[entry.type]}>
                            {typeLabels[entry.type]}
                          </Badge>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{entry.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span>v{entry.version}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(entry.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {entry.description}
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Principais mudanças:</h4>
                      <ul className="space-y-2">
                        {entry.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
