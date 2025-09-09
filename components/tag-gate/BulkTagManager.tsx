'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tag,
  Users,
  Package,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: string
  name: string
  color: string
  description?: string
}

interface BulkTagManagerProps {
  type: 'users' | 'products'
  items: Array<{
    id: string
    name: string
    currentTags?: Tag[]
  }>
  onUpdate?: () => void
}

export function BulkTagManager({ type, items, onUpdate }: BulkTagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
    }
  }

  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleTagSelect = (tagId: string, checked: boolean) => {
    const newSelected = new Set(selectedTags)
    if (checked) {
      newSelected.add(tagId)
    } else {
      newSelected.delete(tagId)
    }
    setSelectedTags(newSelected)
  }

  const handleBulkAssign = async () => {
    if (selectedItems.size === 0 || selectedTags.size === 0) {
      toast.error('Selecione pelo menos um item e uma tag')
      return
    }

    try {
      setLoading(true)

      const endpoint =
        type === 'users'
          ? '/api/v2/gestor/user-tags/bulk-assign'
          : '/api/v2/gestor/product-tags/bulk-assign'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`${type.slice(0, -1)}_ids`]: Array.from(selectedItems),
          tag_ids: Array.from(selectedTags),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(
          `Tags atribuídas com sucesso! ${data.summary.success} itens atualizados`
        )

        // Reset selections
        setSelectedItems(new Set())
        setSelectedTags(new Set())
        setIsOpen(false)

        // Callback para atualizar a lista
        if (onUpdate) {
          onUpdate()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atribuir tags')
      }
    } catch (error) {
      console.error('Erro ao atribuir tags:', error)
      toast.error('Erro ao atribuir tags')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Atribuir Tags em Massa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Atribuir Tags em Massa
          </DialogTitle>
          <DialogDescription>
            Selecione {type === 'users' ? 'usuários' : 'produtos'} e tags para
            atribuição em lote
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {type === 'users' ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Selecionar {type === 'users' ? 'Usuários' : 'Produtos'}
                <Badge variant="secondary">
                  {selectedItems.size} selecionados
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedItems.size === items.length && items.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">Selecionar todos</Label>
              </div>

              <Input
                placeholder={`Buscar ${type === 'users' ? 'usuários' : 'produtos'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={checked =>
                        handleItemSelect(item.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`item-${item.id}`} className="flex-1">
                      {item.name}
                    </Label>
                    {item.currentTags && item.currentTags.length > 0 && (
                      <div className="flex gap-1">
                        {item.currentTags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            style={{ borderColor: tag.color, color: tag.color }}
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {item.currentTags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.currentTags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Selecionar Tags
                <Badge variant="secondary">
                  {selectedTags.size} selecionadas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Buscar tags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.has(tag.id)}
                      onCheckedChange={checked =>
                        handleTagSelect(tag.id, checked as boolean)
                      }
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="flex-1">
                      {tag.name}
                    </Label>
                    {tag.description && (
                      <span className="text-sm text-gray-500">
                        {tag.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={
                loading || selectedItems.size === 0 || selectedTags.size === 0
              }
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atribuindo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Atribuir Tags
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

