'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url: string
  status: string
  category_id: string
  base_product_id: string
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
  base_products: {
    id: string
    name: string
    base_price: number
    base_points_cost: number
  }
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface BaseProduct {
  id: string
  name: string
  base_price: number
  base_points_cost: number
}

export default function ProdutosPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [updatingProduct, setUpdatingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    points_cost: 0,
    stock_quantity: 0,
    image_url: '',
    category_id: '',
    base_product_id: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar produtos
      const productsResponse = await fetch('/api/gestor/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }

      // Carregar categorias
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      // Carregar produtos base
      const baseProductsResponse = await fetch('/api/base-products')
      if (baseProductsResponse.ok) {
        const baseProductsData = await baseProductsResponse.json()
        setBaseProducts(baseProductsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const response = await fetch('/api/gestor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })

      if (response.ok) {
        toast.success('Produto criado com sucesso!')
        setShowCreateDialog(false)
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          points_cost: 0,
          stock_quantity: 0,
          image_url: '',
          category_id: '',
          base_product_id: ''
        })
        loadData()
      } else {
        throw new Error('Erro ao criar produto')
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast.error('Erro ao criar produto')
    }
  }

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return

    try {
      setUpdatingProduct(true)
      
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const price = parseFloat(formData.get('price') as string) || 0
      const points_cost = parseInt(formData.get('points_cost') as string) || 0
      const stock_quantity = parseInt(formData.get('stock_quantity') as string) || 0
      const image_url = formData.get('image_url') as string
      const category_id = formData.get('category_id') as string
      const status = formData.get('status') as string

      // Validações
      if (!name || price <= 0) {
        toast.error('Nome e preço são obrigatórios')
        return
      }

      // Atualizar produto via API
      const response = await fetch(`/api/gestor/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          price,
          points_cost,
          stock_quantity,
          image_url,
          category_id,
          status
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao atualizar produto')
        return
      }

      toast.success('Produto atualizado com sucesso')
      setEditingProduct(null)
      loadData() // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      toast.error('Erro ao atualizar produto')
    } finally {
      setUpdatingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return
    }

    try {
      const response = await fetch(`/api/gestor/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Produto excluído com sucesso')
        loadData() // Recarregar lista
      } else {
        const result = await response.json()
        toast.error(result.error || 'Erro ao excluir produto')
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error('Erro ao excluir produto')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
              <p className="text-gray-600 mt-2">
                Gerencie os produtos da sua loja
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Produto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Descrição do produto"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="points">Custo em Pontos</Label>
                      <Input
                        id="points"
                        type="number"
                        value={newProduct.points_cost}
                        onChange={(e) => setNewProduct({ ...newProduct, points_cost: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock">Estoque</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock_quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">URL da Imagem</Label>
                      <Input
                        id="image"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newProduct.category_id}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
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
                    <div>
                      <Label htmlFor="base-product">Produto Base</Label>
                      <Select
                        value={newProduct.base_product_id}
                        onValueChange={(value) => setNewProduct({ ...newProduct, base_product_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto base" />
                        </SelectTrigger>
                        <SelectContent>
                          {baseProducts.map((baseProduct) => (
                            <SelectItem key={baseProduct.id} value={baseProduct.id}>
                              {baseProduct.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateProduct}>
                      Criar Produto
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {product.image_url && product.image_url !== '' ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${product.image_url && product.image_url !== '' ? 'hidden' : ''}`}>
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`/store/product/${product.id}`, '_blank')}
                      title="Ver na loja"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                      title="Editar produto"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Excluir produto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Preço:</span>
                    <span className="font-medium">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pontos:</span>
                    <span className="font-medium">{product.points_cost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estoque:</span>
                    <span className="font-medium">{product.stock_quantity}</span>
                  </div>
                  {product.product_categories && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Categoria:</span>
                      <Badge variant="outline" className="text-xs">
                        {product.product_categories.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece adicionando seu primeiro produto'
              }
            </p>
          </div>
        )}
      </div>



      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Produto</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateProduct(new FormData(e.currentTarget))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Produto *</label>
                  <Input name="name" defaultValue={editingProduct.name} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <Textarea
                    name="description"
                    defaultValue={editingProduct.description}
                    placeholder="Descrição do produto"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço (R$) *</label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct.price}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Custo em Pontos</label>
                    <Input
                      name="points_cost"
                      type="number"
                      defaultValue={editingProduct.points_cost}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estoque</label>
                    <Input
                      name="stock_quantity"
                      type="number"
                      defaultValue={editingProduct.stock_quantity}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" defaultValue={editingProduct.status} className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="out_of_stock">Sem Estoque</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                  <Input
                    name="image_url"
                    defaultValue={editingProduct.image_url}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select name="category_id" defaultValue={editingProduct.category_id} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingProduct(null)}
                    className="flex-1"
                    disabled={updatingProduct}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1"
                    disabled={updatingProduct}
                  >
                    {updatingProduct ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
