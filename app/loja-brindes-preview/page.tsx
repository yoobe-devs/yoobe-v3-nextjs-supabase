'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Gift,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Search,
  Filter,
  Package,
  Truck,
  Shield,
  Award,
  Users,
  Clock,
  Eye,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  status: string
  final_sku: string
}

export default function LojaBrindesPreviewPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Buscar produtos da empresa Yoobe
      const { data: productsData, error } = await supabase
        .from('client_products')
        .select(
          `
          id,
          name,
          description,
          price,
          stock_quantity,
          status,
          final_sku
        `
        )
        .eq('client_id', '550e8400-e29b-41d4-a716-446655440001')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        return
      }

      if (productsData) {
        setProducts(
          productsData.map(product => ({
            ...product,
            points_cost: Math.floor(product.price * 10), // 1 real = 10 pontos
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
    return matchesSearch
  })

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      points_cost: product.points_cost,
      quantity: 1,
      image: '/placeholder.png',
    }

    // Salvar no localStorage
    const existingCart = JSON.parse(
      localStorage.getItem('brindes_cart') || '[]'
    )
    const existingItemIndex = existingCart.findIndex(
      (item: any) => item.productId === product.id
    )

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1
    } else {
      existingCart.push(cartItem)
    }

    localStorage.setItem('brindes_cart', JSON.stringify(existingCart))

    // Atualizar estado local
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))

    // Redirecionar para o carrinho
    router.push('/loja-brindes-preview/carrinho')
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId)
      return total + (product ? product.points_cost * quantity : 0)
    }, 0)
  }

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando loja de brindes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.close()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <Gift className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Loja de Brindes
                  </h1>
                  <p className="text-sm text-gray-600">Yoobe - Resgate Light</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Resgate seus Pontos por Brindes Incríveis
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Transforme seus pontos em produtos exclusivos da Yoobe
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{products.length}</div>
              <div className="text-blue-100">Produtos Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {products.reduce((sum, p) => sum + p.stock_quantity, 0)}
              </div>
              <div className="text-blue-100">Unidades em Estoque</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24h</div>
              <div className="text-blue-100">Entrega Rápida</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-blue-100">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar brindes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                <option value="brindes">Brindes</option>
                <option value="vestuario">Vestuário</option>
                <option value="acessorios">Acessórios</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
                      <Gift className="h-16 w-16 text-white" />
                    </div>

                    {/* Stock Badge */}
                    {product.stock_quantity > 0 && (
                      <Badge className="absolute top-2 left-2 bg-green-500">
                        Em Estoque
                      </Badge>
                    )}

                    {/* Points Badge */}
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      {product.points_cost} pts
                    </Badge>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price and Points */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {product.points_cost} pontos
                        </div>
                        <div className="text-sm text-gray-500">
                          R${' '}
                          {product.price.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Estoque</div>
                        <div className="font-medium">
                          {product.stock_quantity}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stock_quantity === 0
                          ? 'Sem Estoque'
                          : 'Adicionar ao Carrinho'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          router.push(
                            `/loja-brindes-preview/produto/${product.id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart */}
      {getCartItemsCount() > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full shadow-lg"
            onClick={() => router.push('/loja-brindes-preview/carrinho')}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {getCartItemsCount()} itens
            <Badge className="ml-2 bg-white text-blue-600">
              {getCartTotal()} pts
            </Badge>
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="h-6 w-6" />
                <span className="font-bold">Loja de Brindes</span>
              </div>
              <p className="text-gray-400">
                Transforme seus pontos em produtos incríveis
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Como Resgatar</li>
                <li>Política de Troca</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entrega</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Entrega Rápida
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Produtos Originais
                </li>
                <li className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Qualidade Garantida
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contato@yoobe.com</li>
                <li>(11) 99999-9999</li>
                <li>Seg-Sex: 9h-18h</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Yoobe. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
