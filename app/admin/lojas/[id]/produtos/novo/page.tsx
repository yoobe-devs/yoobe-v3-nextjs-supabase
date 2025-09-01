'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { ArrowLeft, Package, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  domain: string
  companies: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface ProductForm {
  name: string
  description: string
  price: string
  points_cost: string
  stock_quantity: string
  category_id: string
  image_url: string
}

export default function NovoProdutoLojaPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string

  const [store, setStore] = useState<Store | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    points_cost: '0',
    stock_quantity: '0',
    category_id: '',
    image_url: ''
  })

  // Carregar dados da loja e categorias
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Buscar dados da loja
        const storeResponse = await fetch(`/api/stores/${storeId}`)
        if (storeResponse.ok) {
          const storeData = await storeResponse.json()
          setStore(storeData.store)
        }

        // Buscar categorias
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories || [])
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    if (storeId) {
      fetchData()
    }
  }, [storeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name || !form.price) {
      toast.error('Nome e preço são obrigatórios')
      return
    }

    try {
      setSaving(true)

      const productData = {
        ...form,
        price: parseFloat(form.price),
        points_cost: parseInt(form.points_cost) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        store_id: storeId,
        status: 'active'
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        toast.success('Produto criado com sucesso!')
        router.push(`/admin/lojas/${storeId}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao criar produto')
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast.error('Erro ao criar produto')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setForm(prev => ({ ...prev, image_url: url }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Loja não encontrada</h3>
          <p className="text-gray-600 mb-4">A loja solicitada não foi encontrada.</p>
          <Button onClick={() => router.push('/admin/lojas')}>
            Voltar para Lojas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/lojas/${storeId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Produto</h1>
            <p className="text-gray-600 mt-2">
              Adicionar produto à loja: {store.name}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(value) => setForm(prev => ({ ...prev, category_id: value }))}
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

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o produto..."
                rows={4}
              />
            </div>

            {/* Preços e estoque */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="points_cost">Custo em Pontos</Label>
                <Input
                  id="points_cost"
                  type="number"
                  min="0"
                  value={form.points_cost}
                  onChange={(e) => setForm(prev => ({ ...prev, points_cost: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) => setForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Upload de imagem */}
            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={form.image_url}
                bucket="products"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Salvando...' : 'Criar Produto'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/lojas/${storeId}`)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Informações da loja */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Nome da Loja</Label>
              <p className="text-lg">{store.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Domínio</Label>
              <p className="text-lg">{store.domain}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Empresa</Label>
              <p className="text-lg">{store.companies?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
