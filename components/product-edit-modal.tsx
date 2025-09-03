'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { X, Plus, Image as ImageIcon, Tag, Edit, Save, Eye } from 'lucide-react'

interface ProductEditModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
  onSave: (updatedProduct: any) => void
}

export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [newImage, setNewImage] = useState({
    url: '',
    alt: '',
    is_primary: false,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        advanced_description: product.advanced_description || '',
        price: product.price || 0,
        stock_quantity: product.stock_quantity || 0,
        margin_pct: product.margin_pct || 0,
        custom_sku: product.custom_sku || product.final_sku || '',
        tags: product.tags || [],
        images: product.images || [],
        is_active: product.is_active !== false,
        deactivation_reason: product.deactivation_reason || '',
      })
    }
  }, [product])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.price) {
        toast.error('Nome e preço são obrigatórios')
        return
      }

      // Gerar EAN-13 se SKU foi alterado
      if (formData.custom_sku !== product.custom_sku) {
        const response = await fetch('/api/products/generate-ean13', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: formData.custom_sku,
            productId: product.id,
          }),
        })

        if (!response.ok) {
          toast.error('Erro ao gerar EAN-13')
          return
        }
      }

      // Atualizar produto
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          current_sku: product.custom_sku || product.final_sku,
          status: formData.is_active ? 'active' : 'inactive',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Erro ao salvar produto')
        return
      }

      const result = await response.json()
      toast.success('Produto atualizado com sucesso!')
      onSave(result.product)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove),
    })
  }

  const addImage = () => {
    if (newImage.url.trim()) {
      const images = [...formData.images]
      if (newImage.is_primary) {
        images.forEach(img => (img.is_primary = false))
      }
      images.push({ ...newImage })

      setFormData({ ...formData, images })
      setNewImage({ url: '', alt: '', is_primary: false })
    }
  }

  const removeImage = (index: number) => {
    const images = formData.images.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, images })
  }

  const setPrimaryImage = (index: number) => {
    const images = formData.images.map((img: any, i: number) => ({
      ...img,
      is_primary: i === index,
    }))
    setFormData({ ...formData, images })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Produto: {product?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome do produto"
              />
            </div>
            <div>
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || 0}
                onChange={e =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Descrições */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição Simples</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição básica do produto"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="advanced_description">Descrição Avançada</Label>
              <Textarea
                id="advanced_description"
                value={formData.advanced_description || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    advanced_description: e.target.value,
                  })
                }
                placeholder="Descrição detalhada com formatação"
                rows={5}
              />
            </div>
          </div>

          {/* SKU e Estoque */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="custom_sku">SKU Personalizado</Label>
              <Input
                id="custom_sku"
                value={formData.custom_sku || ''}
                onChange={e =>
                  setFormData({ ...formData, custom_sku: e.target.value })
                }
                placeholder="SKU único"
              />
            </div>
            <div>
              <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity || 0}
                onChange={e =>
                  setFormData({
                    ...formData,
                    stock_quantity: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="margin_pct">Margem de Lucro (%)</Label>
              <Input
                id="margin_pct"
                type="number"
                step="0.01"
                value={formData.margin_pct || 0}
                onChange={e =>
                  setFormData({
                    ...formData,
                    margin_pct: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Nova tag"
                onKeyPress={e => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Imagens */}
          <div>
            <Label>Imagens</Label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Input
                value={newImage.url}
                onChange={e =>
                  setNewImage({ ...newImage, url: e.target.value })
                }
                placeholder="URL da imagem"
              />
              <Input
                value={newImage.alt}
                onChange={e =>
                  setNewImage({ ...newImage, alt: e.target.value })
                }
                placeholder="Texto alternativo"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={newImage.is_primary}
                  onCheckedChange={checked =>
                    setNewImage({ ...newImage, is_primary: checked })
                  }
                />
                <Label>Principal</Label>
              </div>
            </div>
            <Button onClick={addImage} size="sm" className="mb-2">
              <ImageIcon className="h-4 w-4 mr-2" />
              Adicionar Imagem
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {formData.images?.map((img: any, index: number) => (
                <div key={index} className="border rounded p-2 relative">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-20 object-cover rounded"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    {img.is_primary ? (
                      <Badge variant="default" className="text-xs">
                        Principal
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrimaryImage(index)}
                        className="h-6 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                      className="h-6 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Produto Ativo</Label>
              <p className="text-sm text-gray-600">
                Produtos inativos não aparecem na loja
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={checked =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          {!formData.is_active && (
            <div>
              <Label htmlFor="deactivation_reason">Motivo da Inativação</Label>
              <Textarea
                id="deactivation_reason"
                value={formData.deactivation_reason || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    deactivation_reason: e.target.value,
                  })
                }
                placeholder="Motivo da inativação (opcional)"
                rows={2}
              />
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
