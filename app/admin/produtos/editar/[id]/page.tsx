"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Package,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-provider-simple'

interface BaseProduct {
  id: string
  name: string
  description: string
  category_id: string
  base_price: number
  base_points_cost: number
  image_url: string
  specifications: any
  status: string
  product_categories?: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export default function EditProductPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const { user, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<BaseProduct | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    points_cost: '',
    stock_quantity: '',
    category_id: '',
    image_url: '',
    status: 'active'
  })

  useEffect(() => {
    if (!authLoading && user && id) {
      loadProduct()
      loadCategories()
    } else if (!authLoading && !user) {
      // Usuário não autenticado será tratado pelo ProtectedRoute
      setLoading(false)
    }
  }, [id, user, authLoading])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/base-products/${id}`)
      
      if (response.ok) {
        const productData: BaseProduct = await response.json()
        setProduct(productData)
        
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.base_price?.toString() || '0',
          points_cost: productData.base_points_cost?.toString() || '0',
          stock_quantity: productData.specifications?.stock_available?.toString() || '0',
          category_id: productData.category_id || '',
          image_url: productData.image_url || '',
          status: productData.status || 'active'
        })
      } else if (response.status === 404) {
        toast.error('Produto não encontrado')
        router.push('/admin/produtos')
      } else {
        throw new Error('Erro ao carregar produto')
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
      toast.error('Erro ao carregar produto')
      router.push('/admin/produtos')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.price) || 0,
        base_points_cost: parseInt(formData.points_cost) || 0,
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        status: formData.status,
        specifications: {
          ...product?.specifications,
          stock_available: parseInt(formData.stock_quantity) || 0
        }
      }

      const response = await fetch(`/api/base-products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        toast.success('Produto atualizado com sucesso!')
        router.push('/admin/produtos')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar produto')
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      toast.error('Erro ao atualizar produto')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">
              {authLoading ? 'Verificando autenticação...' : 'Carregando produto...'}
            </p>
            <p className="mt-1 text-xs text-gray-500">ID: {id}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
            <p className="mt-2 text-sm text-gray-600">Acesso não autorizado</p>
            <p className="mt-1 text-xs text-gray-500">ID: {id}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-orange-600" />
            <p className="mt-2 text-sm text-gray-600">Produto não encontrado</p>
            <p className="mt-1 text-xs text-gray-500">ID: {id}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Produto Base</h1>
          <p className="text-muted-foreground">
            Edite as informações do produto base
          </p>
          <p className="text-xs text-gray-500">ID: {id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Digite a descrição do produto"
                  rows={4}
                  required
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id || 'none'}
                  onValueChange={(value) => handleInputChange('category_id', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preços e Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>Preços e Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preço */}
              <div className="space-y-2">
                <Label htmlFor="price">Preço Base (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Pontos */}
              <div className="space-y-2">
                <Label htmlFor="points">Pontos Base</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={formData.points_cost}
                  onChange={(e) => handleInputChange('points_cost', e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Estoque */}
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque Disponível</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Imagem */}
        <Card>
          <CardHeader>
            <CardTitle>Imagem do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            {formData.image_url && (
              <div className="mt-4">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-lg border"
                  onError={() => {
                    console.log('Erro ao carregar imagem')
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}


