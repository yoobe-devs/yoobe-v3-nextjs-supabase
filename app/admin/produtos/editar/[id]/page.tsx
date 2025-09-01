"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Package,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface Company {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url?: string
  status: string
  category_id?: string
  company_id: string
  created_at: string
}

export default function EditProductPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [companies, setCompanies] = useState<Company[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    points_cost: '',
    stock_quantity: '',
    category_id: '',
    company_id: '',
    image_url: '',
    status: 'active'
  })

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    loadProduct()
    loadCategories()
    loadCompanies()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        const product = data.product
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '0',
          points_cost: product.points_cost?.toString() || '0',
          stock_quantity: product.stock_quantity?.toString() || '0',
          category_id: product.category_id || '',
          company_id: product.company_id || '',
          image_url: product.image_url || '',
          status: product.status || 'active'
        })
      } else {
        throw new Error('Produto não encontrado')
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
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
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
    
    if (!formData.name || !formData.description || !formData.company_id) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        points_cost: parseInt(formData.points_cost) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: formData.category_id || null,
        company_id: formData.company_id,
        image_url: formData.image_url || null,
        status: formData.status
      }

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Produto atualizado com sucesso!')
        router.push('/admin/produtos')
      } else {
        throw new Error(result.error || 'Erro ao atualizar produto')
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar produto')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando produto...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/produtos')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Produtos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Editar Produto
                </CardTitle>
                <CardDescription>
                  Atualize as informações do produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Camiseta Corporativa"
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
                      placeholder="Descreva o produto..."
                      rows={3}
                      required
                    />
                  </div>

                  {/* Preço e Pontos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="points_cost">Pontos</Label>
                      <Input
                        id="points_cost"
                        type="number"
                        min="0"
                        value={formData.points_cost}
                        onChange={(e) => handleInputChange('points_cost', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Estoque e Categoria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">Estoque</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => handleInputChange('category_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Select
                      value={formData.company_id}
                      onValueChange={(value) => handleInputChange('company_id', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin/produtos')}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Image Upload */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Imagem do Produto</CardTitle>
                <CardDescription>
                  Atualize a imagem do produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageUpload={async (file: File) => {
                    const objectUrl = URL.createObjectURL(file)
                    handleInputChange('image_url', objectUrl)
                  }}
                  currentImage={formData.image_url}
                />
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Campos marcados com * são obrigatórios</p>
                <p>• Preço e pontos podem ser 0</p>
                <p>• Imagem é opcional</p>
                <p>• Clique em "Salvar" para aplicar as mudanças</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


