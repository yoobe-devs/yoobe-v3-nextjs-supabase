'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tag,
  Plus,
  X,
  Edit,
  Trash2,
  Search,
  Palette,
  Sparkles,
  TrendingUp,
  Leaf,
  Crown,
  Clock,
  Palette as PaletteIcon,
  Cpu,
} from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: string
  name: string
  description?: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TagsManagerProps {
  selectedTags?: string[]
  onTagsChange?: (tags: string[]) => void
  mode?: 'select' | 'manage'
  storeId?: string
  productId?: string
}

const tagIcons = {
  tag: Tag,
  sparkles: Sparkles,
  'trending-up': TrendingUp,
  leaf: Leaf,
  crown: Crown,
  clock: Clock,
  palette: PaletteIcon,
  cpu: Cpu,
}

const defaultColors = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280',
  '#059669',
  '#DC2626',
  '#7C3AED',
  '#2563EB',
  '#F97316',
]

export function TagsManager({
  selectedTags = [],
  onTagsChange,
  mode = 'select',
  storeId,
  productId,
}: TagsManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  })

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
      toast.error('Erro ao carregar tags')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da tag é obrigatório')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setTags(prev => [...prev, data.tag])
        setFormData({ name: '', description: '', color: '#3B82F6' })
        setShowCreateForm(false)
        toast.success('Tag criada com sucesso!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao criar tag')
      }
    } catch (error) {
      console.error('Erro ao criar tag:', error)
      toast.error('Erro ao criar tag')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !formData.name.trim()) {
      toast.error('Nome da tag é obrigatório')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setTags(prev =>
          prev.map(tag => (tag.id === editingTag.id ? data.tag : tag))
        )
        setEditingTag(null)
        setFormData({ name: '', description: '', color: '#3B82F6' })
        toast.success('Tag atualizada com sucesso!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar tag')
      }
    } catch (error) {
      console.error('Erro ao atualizar tag:', error)
      toast.error('Erro ao atualizar tag')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTags(prev => prev.filter(tag => tag.id !== tagId))
        toast.success('Tag excluída com sucesso!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao excluir tag')
      }
    } catch (error) {
      console.error('Erro ao excluir tag:', error)
      toast.error('Erro ao excluir tag')
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    if (!onTagsChange) return

    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]

    onTagsChange(newSelectedTags)
  }

  const filteredTags = tags.filter(
    tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) && tag.is_active
  )

  if (mode === 'select') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar tags..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredTags.map(tag => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-opacity-80"
              style={{
                backgroundColor: selectedTags.includes(tag.id)
                  ? tag.color
                  : undefined,
                borderColor: tag.color,
                color: selectedTags.includes(tag.id) ? 'white' : tag.color,
              }}
              onClick={() => handleTagToggle(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>

        {selectedTags.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-medium">Tags selecionadas:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId)
                return tag ? (
                  <Badge
                    key={tagId}
                    variant="default"
                    className="cursor-pointer"
                    style={{ backgroundColor: tag.color }}
                    onClick={() => handleTagToggle(tagId)}
                  >
                    {tag.name} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerenciar Tags</h3>
          <p className="text-sm text-gray-600">
            Crie e gerencie tags para organizar produtos
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tag
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar tags..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map(tag => (
          <Card key={tag.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <CardTitle className="text-base">{tag.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTag(tag)
                      setFormData({
                        name: tag.name,
                        description: tag.description || '',
                        color: tag.color,
                      })
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tag.description && (
                <CardDescription className="text-sm">
                  {tag.description}
                </CardDescription>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Criada em: {new Date(tag.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingTag) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTag ? 'Editar Tag' : 'Nova Tag'}</CardTitle>
            <CardDescription>
              {editingTag
                ? 'Atualize as informações da tag'
                : 'Crie uma nova tag para organizar produtos'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Tag *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Promoção, Novidade, Premium..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descrição opcional da tag..."
              />
            </div>

            <div>
              <Label>Cor da Tag</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-8 rounded border"
                />
                <Input
                  value={formData.color}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {defaultColors.map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingTag ? handleUpdateTag : handleCreateTag}
                disabled={loading}
              >
                {loading ? 'Salvando...' : editingTag ? 'Atualizar' : 'Criar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingTag(null)
                  setFormData({ name: '', description: '', color: '#3B82F6' })
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

