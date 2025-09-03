'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Gift, 
  Package, 
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Tag,
  DollarSign,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export default function LojaBrindesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const [products] = useState([
    {
      id: 1,
      name: 'Camiseta Join Tech',
      category: 'Vestuário',
      price: 'R$ 89,90',
      stock: 45,
      status: 'ativo',
      image: '/placeholder.png',
      description: 'Camiseta 100% algodão com logo da empresa',
      sku: 'CAM-001',
      cost: 'R$ 35,00',
      margin: '156%'
    },
    {
      id: 2,
      name: 'Mochila Corporativa',
      category: 'Acessórios',
      price: 'R$ 129,90',
      stock: 23,
      status: 'ativo',
      image: '/placeholder.png',
      description: 'Mochila resistente para uso corporativo',
      sku: 'MOC-001',
      cost: 'R$ 45,00',
      margin: '188%'
    },
    {
      id: 3,
      name: 'Caneca Personalizada',
      category: 'Casa',
      price: 'R$ 29,90',
      stock: 67,
      status: 'ativo',
      image: '/placeholder.png',
      description: 'Caneca de cerâmica com design personalizado',
      sku: 'CAN-001',
      cost: 'R$ 12,00',
      margin: '149%'
    },
    {
      id: 4,
      name: 'Garrafa Térmica',
      category: 'Casa',
      price: 'R$ 79,90',
      stock: 12,
      status: 'ativo',
      image: '/placeholder.png',
      description: 'Garrafa térmica de aço inox 500ml',
      sku: 'GAR-001',
      cost: 'R$ 28,00',
      margin: '185%'
    },
    {
      id: 5,
      name: 'Mouse Pad',
      category: 'Tecnologia',
      price: 'R$ 19,90',
      stock: 89,
      status: 'ativo',
      image: '/placeholder.png',
      description: 'Mouse pad com logo da empresa',
      sku: 'MOU-001',
      cost: 'R$ 8,00',
      margin: '149%'
    },
    {
      id: 6,
      name: 'Post-it Personalizado',
      category: 'Escritório',
      price: 'R$ 15,90',
      stock: 0,
      status: 'sem-estoque',
      image: '/placeholder.png',
      description: 'Bloco de post-it com logo da empresa',
      sku: 'POS-001',
      cost: 'R$ 6,00',
      margin: '165%'
    }
  ])

  const [stats] = useState({
    totalProducts: 89,
    activeProducts: 85,
    lowStockProducts: 8,
    totalValue: 'R$ 8.945,00',
    categories: 6,
    averagePrice: 'R$ 100,50'
  })

  const categories = ['all', 'Vestuário', 'Acessórios', 'Casa', 'Tecnologia', 'Escritório']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'inativo': return 'bg-gray-100 text-gray-800'
      case 'sem-estoque': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'inativo': return 'Inativo'
      case 'sem-estoque': return 'Sem Estoque'
      default: return 'Desconhecido'
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock <= 10) return 'text-orange-600'
    return 'text-green-600'
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loja de Brindes</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos de brindes corporativos</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeProducts}</span> ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue}</div>
            <p className="text-xs text-muted-foreground">
              Em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes tipos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePrice}</div>
            <p className="text-xs text-muted-foreground">
              Por produto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos por nome, descrição ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as Categorias' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(product.status)}>
                  {getStatusText(product.status)}
                </Badge>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Product Image Placeholder */}
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Gift className="h-8 w-8 text-gray-400" />
              </div>
              
              {/* Product Info */}
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
              
              {/* Product Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Categoria:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Preço:</span>
                  <span className="font-bold text-lg">{product.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estoque:</span>
                  <span className={`font-medium ${getStockColor(product.stock)}`}>
                    {product.stock} unidades
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Margem:</span>
                  <span className="font-medium text-green-600">{product.margin}</span>
                </div>
              </div>
              
              {/* Stock Warning */}
              {product.stock <= 10 && product.stock > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">Estoque baixo</span>
                </div>
              )}
              
              {product.stock === 0 && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">Sem estoque</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou criar um novo produto
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie seu catálogo de brindes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
            <Button variant="outline" className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Gerenciar Estoque
            </Button>
            <Button variant="outline" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
