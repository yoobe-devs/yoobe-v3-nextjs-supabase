"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Store,
  DollarSign,
  Star,
  Tag,
  Image as ImageIcon
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { 
  getCompanyProducts, 
  createCompanyProduct, 
  updateCompanyProduct, 
  deleteCompanyProduct,
  type CompanyProduct 
} from "@/lib/queries/gestor"

export default function GestorProdutosPage() {
  const [products, setProducts] = useState<CompanyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CompanyProduct | null>(null)
  const { user, signOut } = useAuth()

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    points_cost: 0,
    category: "",
    stock: 0,
    image_url: ""
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getCompanyProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const newProduct = await createCompanyProduct({
        ...formData,
        status: 'active',
        company_id: 'default', // TODO: Get from user context
        created_at: new Date().toISOString()
      })
      
      if (newProduct) {
        setProducts(prev => [newProduct, ...prev])
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    
    try {
      const updatedProduct = await updateCompanyProduct(editingProduct.id, formData)
      
      if (updatedProduct) {
        setProducts(prev => 
          prev.map(prod => prod.id === updatedProduct.id ? updatedProduct : prod)
        )
        setEditingProduct(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteCompanyProduct(id)
        setProducts(prev => prev.filter(prod => prod.id !== id))
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      points_cost: 0,
      category: "",
      stock: 0,
      image_url: ""
    })
  }

  const openEditModal = (product: CompanyProduct) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      points_cost: product.points_cost,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Sem Estoque</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos da Empresa</h1>
            <p className="text-gray-600">Gerencie os produtos disponíveis para seus funcionários</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
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
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">{product.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    {getStatusBadge(product.status)}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    {product.category}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{product.points_cost} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{product.stock} un</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(product)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </CardTitle>
              <CardDescription>
                {editingProduct ? 'Atualize as informações do produto' : 'Adicione um novo produto à empresa'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrição detalhada do produto"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="points">Custo em Pontos</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points_cost}
                    onChange={(e) => setFormData({...formData, points_cost: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Vestuário, Eletrônicos, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe vazio para usar imagem padrão
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                >
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
