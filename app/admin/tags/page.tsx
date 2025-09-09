'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TagsManager } from '@/components/ui/tags-manager'
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
import {
  Tag,
  Search,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  Plus,
} from 'lucide-react'

interface TagStats {
  totalTags: number
  activeTags: number
  tagsWithProducts: number
  mostUsedTag: string
}

export default function TagsAdminPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tagStats, setTagStats] = useState<TagStats>({
    totalTags: 0,
    activeTags: 0,
    tagsWithProducts: 0,
    mostUsedTag: '',
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadTagStats()
  }, [])

  const loadTagStats = async () => {
    try {
      setLoading(true)

      // Buscar estatísticas das tags
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name, is_active')
        .eq('is_active', true)

      const { data: productTags } = await supabase
        .from('product_tags')
        .select('tag_id, tags(name)')

      // Calcular estatísticas
      const totalTags = tags?.length || 0
      const activeTags = tags?.filter(tag => tag.is_active).length || 0

      // Contar tags com produtos
      const tagUsageCount: Record<string, number> = {}
      productTags?.forEach(pt => {
        const tagName = (pt.tags as any)?.name
        if (tagName) {
          tagUsageCount[tagName] = (tagUsageCount[tagName] || 0) + 1
        }
      })

      const tagsWithProducts = Object.keys(tagUsageCount).length
      const mostUsedTag =
        Object.entries(tagUsageCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        'Nenhuma'

      setTagStats({
        totalTags,
        activeTags,
        tagsWithProducts,
        mostUsedTag,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Tag className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Carregando estatísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Tags</h1>
          <p className="text-gray-600">
            Organize produtos com tags para facilitar a busca e categorização
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Tag className="h-3 w-3 mr-1" />
            {tagStats.totalTags} tags ativas
          </Badge>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tagStats.totalTags}</div>
            <p className="text-xs text-muted-foreground">
              Tags criadas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tagStats.activeTags}</div>
            <p className="text-xs text-muted-foreground">
              Tags disponíveis para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags em Uso</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tagStats.tagsWithProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Tags vinculadas a produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Usada</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {tagStats.mostUsedTag}
            </div>
            <p className="text-xs text-muted-foreground">Tag mais utilizada</p>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciador de Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gerenciar Tags
          </CardTitle>
          <CardDescription>
            Crie, edite e organize tags para categorizar produtos. As tags
            ajudam os usuários a encontrar produtos mais facilmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagsManager mode="manage" />
        </CardContent>
      </Card>

      {/* Dicas de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Como Usar Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Para Administradores:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • Crie tags descritivas (ex: &quot;Promoção&quot;,
                  &quot;Novidade&quot;)
                </li>
                <li>• Use cores para categorizar visualmente</li>
                <li>• Mantenha nomes curtos e claros</li>
                <li>• Evite tags duplicadas ou similares</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Para Usuários:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tags aparecem como badges coloridos</li>
                <li>• Facilita a busca por características</li>
                <li>• Melhora a experiência de navegação</li>
                <li>• Ajuda a identificar produtos especiais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
