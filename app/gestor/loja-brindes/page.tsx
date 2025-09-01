"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface GiftProduct {
  id: string
  name: string
  description: string
  price: number
  points: number
  stock: number
  status: 'active' | 'inactive' | 'out_of_stock'
  image: string
  category: string
}

export default function LojaBrindesPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<GiftProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    // Simular carregamento de produtos
    const loadProducts = async () => {
      try {
        // Aqui você faria a chamada real para a API
        // const response = await fetch('/api/gestor/gift-products')
        // const data = await response.json()
        
        // Dados mockados para demonstração
        const mockProducts: GiftProduct[] = [
          {
            id: '1',
            name: 'Camiseta Corporativa',
            description: 'Camiseta com logo da empresa',
            price: 45.00,
            points: 450,
            stock: 25,
            status: 'active',
            image: '/placeholder-product.jpg',
            category: 'Vestuário'
          },
          {
            id: '2',
            name: 'Caneca Personalizada',
            description: 'Caneca com design exclusivo',
            price: 25.00,
            points: 250,
            stock: 50,
            status: 'active',
            image: '/placeholder-product.jpg',
            category: 'Acessórios'
          },
          {
            id: '3',
            name: 'Mochila Corporativa',
            description: 'Mochila resistente para trabalho',
            price: 120.00,
            points: 1200,
            stock: 0,
            status: 'out_of_stock',
            image: '/placeholder-product.jpg',
            category: 'Bolsas'
          },
          {
            id: '4',
            name: 'Garrafa Térmica',
            description: 'Garrafa para manter bebidas quentes/frias',
            price: 35.00,
            points: 350,
            stock: 15,
            status: 'active',
            image: '/placeholder-product.jpg',
            category: 'Acessórios'
          },
          {
            id: '5',
            name: 'Boné da Empresa',
            description: 'Boné com bordado do logo',
            price: 30.00,
            points: 300,
            stock: 30,
            status: 'active',
            image: '/placeholder-product.jpg',
            category: 'Vestuário'
          }
        ]
        
        setProducts(mockProducts)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'out_of_stock':
        return <Badge variant="destructive">Sem Estoque</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Loja de Brindes</h1>
              <p className="text-gray-600 mt-2">
                Gerencie os produtos da sua loja de brindes corporativos
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.open('/store/catalog', '_blank')}
              >
                <Eye className="h-4 w-4" />
                Visualizar Loja
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.status === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Estoque</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.stock > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.stock === 0).length} sem estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor em estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.length - 1}
              </div>
              <p className="text-xs text-muted-foreground">
                Categorias ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
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
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  {getStatusBadge(product.status)}
                </div>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço:</span>
                    <span className="font-medium">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pontos:</span>
                    <span className="font-medium">{product.points}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estoque:</span>
                    <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : ''}`}>
                      {product.stock} un
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou adicionar novos produtos
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
