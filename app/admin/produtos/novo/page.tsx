"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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

export default function NovoProdutoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
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
    loadCategories()
    loadCompanies()
  }, [])

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
    setFormData(prev => ({
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

    setLoading(true)

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
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Produto criado com sucesso!')
        router.push('/admin/produtos')
      } else {
        throw new Error(result.error || 'Erro ao criar produto')
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Novo Produto
                </CardTitle>
                <CardDescription>
                  Preencha as informações do produto
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

                  {/* Opções */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={false}
                        onCheckedChange={(checked) => {}}
                        disabled
                      />
                      <Label htmlFor="featured">Produto em Destaque (Em breve)</Label>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Criar Produto
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
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
                  Adicione uma imagem para o produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageUpload={(url: string) => handleInputChange('image_url', url)}
                  currentImage={formData.image_url}
                  bucket="products"
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
                <p>• Produtos em destaque aparecem primeiro</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


