'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  Trash2,
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProductBase {
  id: string
  sku: string
  title: string
  description: string
  price_cash: number
  price_points: number
  category: string
  active: boolean
  tenant_id: string
  media: string[]
  variations: any[]
  created_at: string
  updated_at: string
}

interface ProductEditModalProps {
  product: ProductBase
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProduct: Partial<ProductBase>) => Promise<void>
}

const categories = ['Tecnologia', 'Vestuário', 'Acessórios', 'Papelaria', 'Alimentação', 'Outros']

export function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSave
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<ProductBase>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newVariation, setNewVariation] = useState({ name: '', value: '' })
  
  const { toast } = useToast()

  // Inicializar form data quando o modal abre
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        title: product.title,
        description: product.description,
        price_cash: product.price_cash,
        price_points: product.price_points,
        category: product.category,
        active: product.active,
        media: [...(product.media || [])],
        variations: [...(product.variations || [])]
      })
      setErrors({})
    }
  }, [isOpen, product])

  // Validação dos campos
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.sku?.trim()) {
      newErrors.sku = 'SKU é obrigatório'
    }

    if (formData.price_cash !== undefined && formData.price_cash < 0) {
      newErrors.price_cash = 'Preço em dinheiro deve ser maior ou igual a zero'
    }

    if (formData.price_points !== undefined && formData.price_points < 0) {
      newErrors.price_points = 'Preço em pontos deve ser maior ou igual a zero'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Salvar alterações
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await onSave(formData)
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar variação
  const addVariation = () => {
    if (newVariation.name.trim() && newVariation.value.trim()) {
      setFormData(prev => ({
        ...prev,
        variations: [...(prev.variations || []), { ...newVariation }]
      }))
      setNewVariation({ name: '', value: '' })
    }
  }

  // Remover variação
  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations?.filter((_, i) => i !== index) || []
    }))
  }

  // Adicionar mídia
  const addMedia = () => {
    const url = prompt('Digite a URL da imagem:')
    if (url?.trim()) {
      setFormData(prev => ({
        ...prev,
        media: [...(prev.media || []), url.trim()]
      }))
    }
  }

  // Remover mídia
  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media?.filter((_, i) => i !== index) || []
    }))
  }

  // Atualizar campo
  const updateField = (field: keyof ProductBase, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Editar Produto</span>
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do produto {product?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais do produto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                    placeholder="Nome do produto"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku || product?.sku || ''}
                    onChange={(e) => updateField('sku', e.target.value)}
                    className={errors.sku ? 'border-red-500' : ''}
                    placeholder="Código do produto"
                    disabled
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500 mt-1">{errors.sku}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descrição detalhada do produto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active || false}
                    onChange={(e) => updateField('active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="active">Produto ativo</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preços */}
          <Card>
            <CardHeader>
              <CardTitle>Preços e Pontos</CardTitle>
              <CardDescription>
                Configure os valores para dinheiro e pontos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_cash">Preço em Dinheiro (R$)</Label>
                  <Input
                    id="price_cash"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_cash || 0}
                    onChange={(e) => updateField('price_cash', parseFloat(e.target.value) || 0)}
                    className={errors.price_cash ? 'border-red-500' : ''}
                    placeholder="0.00"
                  />
                  {errors.price_cash && (
                    <p className="text-sm text-red-500 mt-1">{errors.price_cash}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price_points">Preço em Pontos</Label>
                  <Input
                    id="price_points"
                    type="number"
                    min="0"
                    value={formData.price_points || 0}
                    onChange={(e) => updateField('price_points', parseInt(e.target.value) || 0)}
                    className={errors.price_points ? 'border-red-500' : ''}
                    placeholder="0"
                  />
                  {errors.price_points && (
                    <p className="text-sm text-red-500 mt-1">{errors.price_points}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variações */}
          <Card>
            <CardHeader>
              <CardTitle>Variações do Produto</CardTitle>
              <CardDescription>
                Adicione variações como tamanho, cor, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nome da variação (ex: Tamanho)"
                  value={newVariation.name}
                  onChange={(e) => setNewVariation(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Valor (ex: M)"
                  value={newVariation.value}
                  onChange={(e) => setNewVariation(prev => ({ ...prev, value: e.target.value }))}
                />
                <Button onClick={addVariation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.variations && formData.variations.length > 0 && (
                <div className="space-y-2">
                  {formData.variations.map((variation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{variation.name}</span>
                        <Badge variant="outline">{variation.value}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mídia */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens e Mídia</CardTitle>
              <CardDescription>
                URLs das imagens do produto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addMedia} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Imagem
              </Button>

              {formData.media && formData.media.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.media.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
