'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Package, 
  Image, 
  DollarSign, 
  Star, 
  Edit, 
  Eye, 
  Plus,
  Camera,
  Trash2,
  Save,
  X
} from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  description: string
  points: number
  price: number
  active: boolean
  created_at: string
  images: string[]
  category?: string
  stock?: number
}

export default function GestorProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    points: 0,
    price: 0,
    active: true
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        sku: 'CAM-001',
        name: 'Camiseta Corporativa TechCorp',
        description: 'Camiseta de algodão com logo da empresa, disponível em várias cores',
        points: 150,
        price: 75.00,
        active: true,
        created_at: '2024-01-15T10:00:00Z',
        images: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
        category: 'Vestuário',
        stock: 50
      },
      {
        id: '2',
        sku: 'MOC-002',
        name: 'Mochila Executiva Premium',
        description: 'Mochila profissional com compartimentos organizados e design moderno',
        points: 300,
        price: 150.00,
        active: true,
        created_at: '2024-01-14T15:00:00Z',
        images: ['/placeholder-3.jpg'],
        category: 'Acessórios',
        stock: 25
      },
      {
        id: '3',
        sku: 'CAN-003',
        name: 'Caneca Personalizada',
        description: 'Caneca de cerâmica com design exclusivo da empresa',
        points: 50,
        price: 25.00,
        active: false,
        created_at: '2024-01-13T09:00:00Z',
        images: ['/placeholder-4.jpg'],
        category: 'Casa',
        stock: 100
      }
    ]

    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
    setLoading(false)
  }, [])

  // Filter products based on search, category and status
  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.active : !product.active
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, categoryFilter, statusFilter])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditForm({
      name: product.name,
      description: product.description,
      points: product.points,
      price: product.price,
      active: product.active
    })
    setEditMode(true)
  }

  const handleSaveProduct = async () => {
    if (!selectedProduct) return

    // Mock API call
    setProducts(prev => prev.map(product => 
      product.id === selectedProduct.id 
        ? { ...product, ...editForm, updated_at: new Date().toISOString() }
        : product
    ))

    setEditMode(false)
    setSelectedProduct(null)
  }

  const handleToggleProductStatus = async (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, active: !product.active }
        : product
    ))
  }

  const handleAddImage = (productId: string) => {
    // Mock image upload
    const newImage = `/placeholder-${Date.now()}.jpg`
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, images: [...product.images, newImage] }
        : product
    ))
  }

  const handleRemoveImage = (productId: string, imageIndex: number) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, images: product.images.filter((_, index) => index !== imageIndex) }
        : product
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos replicados da sua empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Exportar Catálogo
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              No catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível para venda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(products.reduce((sum, p) => sum + p.price, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma dos preços
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + p.points, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pontos disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, SKU ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="Vestuário">Vestuário</SelectItem>
                <SelectItem value="Acessórios">Acessórios</SelectItem>
                <SelectItem value="Casa">Casa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {filteredProducts.length} produto(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Image className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.description.length > 50 
                            ? `${product.description.substring(0, 50)}...` 
                            : product.description
                          }
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.sku}</Badge>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Star className="w-3 h-3 mr-1" />
                      {product.points}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.stock || 0} un
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Produto</DialogTitle>
                            <DialogDescription>
                              {product.name} - {product.sku}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Product Images */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Imagens do Produto</h3>
                              <div className="grid grid-cols-3 gap-4">
                                {product.images.map((image, index) => (
                                  <div key={index} className="relative">
                                    <img 
                                      src={image} 
                                      alt={`${product.name} - Imagem ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 w-6 h-6 p-0"
                                      onClick={() => handleRemoveImage(product.id, index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  className="w-full h-32 border-dashed"
                                  onClick={() => handleAddImage(product.id)}
                                >
                                  <Camera className="w-6 h-6 mr-2" />
                                  Adicionar Imagem
                                </Button>
                              </div>
                            </div>

                            {/* Product Details */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Informações do Produto</h3>
                              {editMode ? (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Nome</label>
                                    <Input
                                      value={editForm.name}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Descrição</label>
                                    <Textarea
                                      value={editForm.description}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Preço (R$)</label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Pontos</label>
                                      <Input
                                        type="number"
                                        value={editForm.points}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="active"
                                      checked={editForm.active}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, active: e.target.checked }))}
                                    />
                                    <label htmlFor="active" className="text-sm font-medium">
                                      Produto ativo
                                    </label>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setEditMode(false)}
                                      className="flex-1"
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      onClick={handleSaveProduct}
                                      className="flex-1"
                                    >
                                      <Save className="w-4 h-4 mr-2" />
                                      Salvar Alterações
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Nome</label>
                                    <p className="text-sm text-muted-foreground">{product.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">SKU</label>
                                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Descrição</label>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Categoria</label>
                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Preço</label>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Pontos</label>
                                    <p className="text-sm text-muted-foreground">{product.points}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="mt-1">
                                      {product.active ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                          Ativo
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                          Inativo
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Estoque</label>
                                    <p className="text-sm text-muted-foreground">{product.stock || 0} unidades</p>
                                  </div>
                                  
                                  <div className="col-span-2">
                                    <Button 
                                      onClick={() => setEditMode(true)}
                                      className="w-full"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar Produto
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleProductStatus(product.id)}
                      >
                        {product.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
