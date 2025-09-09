'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

export default function LojaBrindesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Buscar dados do usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const companyId = user.user_metadata?.company_id
      if (!companyId) return

      // Buscar produtos da loja
      const { data: productsData, error } = await supabase
        .from('client_products')
        .select(
          `
          id,
          name,
          description,
          price,
          status,
          stock_quantity,
          created_at,
          updated_at,
          final_sku
        `
        )
        .eq('client_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        return
      }

      if (productsData) {
        setProducts(
          productsData.map(product => ({
            id: product.id,
            name: product.name || 'Produto',
            category: 'Brindes',
            price: `R$ ${(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            stock: product.stock_quantity || 0,
            status: product.status === 'active' ? 'ativo' : 'inativo',
            image: '/placeholder.png',
            description: product.description || 'Produto da loja Yoobe',
            sku: product.final_sku || 'SKU-001',
            cost: `R$ ${((product.price || 0) * 0.6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            margin: '40%',
          }))
        )
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos da loja...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loja de Brindes</h1>
          <p className="text-gray-600">
            Gerencie produtos e brindes da sua loja corporativa.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.open('/loja-brindes-preview', '_blank')}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview da Loja
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Brinde
          </Button>
        </div>
      </div>

      {/* Preview Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ExternalLink className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview da Loja de Brindes
                </h3>
                <p className="text-gray-600">
                  Visualize como sua loja aparece para os clientes no sistema de
                  resgate light
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open('/loja-brindes-preview', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Brindes
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                {products.filter(p => p.status === 'ativo').length}
              </span>{' '}
              ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + p.stock, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Unidades disponíveis
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
              R${' '}
              {products
                .reduce((sum, p) => {
                  const price = parseFloat(
                    p.price.replace('R$ ', '').replace(',', '.')
                  )
                  return sum + price * p.stock
                }, 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.stock < 10).length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">
                {products.filter(p => p.stock === 0).length}
              </span>{' '}
              sem estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>
            Encontre produtos específicos rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou categoria..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Categorias</option>
                <option value="Brindes">Brindes</option>
                <option value="Vestuário">Vestuário</option>
                <option value="Acessórios">Acessórios</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Brindes ({filteredProducts.length})</CardTitle>
          <CardDescription>Lista completa de brindes da loja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <Gift className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </span>
                      <span className="text-sm text-gray-500">
                        Categoria: {product.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {product.price}
                    </div>
                    <p className="text-xs text-gray-500">Preço</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {product.stock}
                    </div>
                    <p className="text-xs text-gray-500">Estoque</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        product.status === 'ativo' ? 'default' : 'secondary'
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        alert(`Visualizando produto: ${product.name}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Editando produto: ${product.name}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerenciar brindes e estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                alert('Funcionalidade de adicionar brinde será implementada')
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Brinde
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                alert('Gerenciamento de estoque será implementado')
              }
            >
              <Package className="h-4 w-4 mr-2" />
              Gerenciar Estoque
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => alert('Relatórios serão implementados em breve')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
