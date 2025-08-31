'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface BaseProduct {
  id: string
  name: string
  description: string | null
  category_id: string
  base_price: number
  base_points_cost: number
  image_url: string | null
  specifications: any
  status: string
  created_at: string
  product_categories: {
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string | null
  }
}

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

export default function BaseProductsPage() {
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: 0,
    base_points_cost: 0,
    image_url: '',
    specifications: {}
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/base-products'),
        fetch('/api/categories')
      ])

      if (!productsResponse.ok) throw new Error('Erro ao buscar produtos-base')
      if (!categoriesResponse.ok) throw new Error('Erro ao buscar categorias')

      const [productsData, categoriesData] = await Promise.all([
        productsResponse.json(),
        categoriesResponse.json()
      ])

      setBaseProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/base-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erro ao criar produto-base')
      
      toast.success('Produto-base criado com sucesso!')
      setIsDialogOpen(false)
      setFormData({
        name: '',
        description: '',
        category_id: '',
        base_price: 0,
        base_points_cost: 0,
        image_url: '',
        specifications: {}
      })
      fetchData()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao criar produto-base')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando produtos-base...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produtos-Base</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Novo Produto-Base</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Produto-Base</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Preço Base (R$)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="base_points_cost">Custo em Pontos</Label>
                  <Input
                    id="base_points_cost"
                    type="number"
                    value={formData.base_points_cost}
                    onChange={(e) => setFormData({ ...formData, base_points_cost: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Produto-Base</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {baseProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              </div>
              {product.product_categories && (
                <div className="flex items-center gap-2">
                  {product.product_categories.icon && (
                    <span className="text-lg">{product.product_categories.icon}</span>
                  )}
                  <Badge 
                    variant="outline"
                    style={{ borderColor: product.product_categories.color || undefined }}
                  >
                    {product.product_categories.name}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {product.description && (
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Preço Base:</span>
                  <p className="text-green-600">R$ {product.base_price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="font-medium">Pontos:</span>
                  <p className="text-blue-600">{product.base_points_cost}</p>
                </div>
              </div>
              {product.image_url && (
                <div className="mt-4">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
              <div className="text-xs text-gray-500 mt-4">
                Criado em: {new Date(product.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {baseProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum produto-base encontrado</p>
        </div>
      )}
    </div>
  )
}
