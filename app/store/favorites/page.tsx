'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Filter,
  Heart,
  Star,
  ShoppingCart,
  Package,
  Grid,
  List,
  Gift,
  Eye,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface FavoriteProduct {
  id: string
  name: string
  description: string
  points: number
  price: number
  image: string
  category: string
  stock: number
  rating: number
  reviews: number
  is_featured: boolean
  addedAt: string
}

const supa = () => createClientComponentClient()

export default function FavoritesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteProduct[]>(
    []
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('addedAt')
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Empty state quando não há favoritos
  if (!loading && favorites.length === 0) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
            <p className="text-gray-600">
              Produtos que você marcou como favoritos
            </p>
          </div>
        </div>

        {/* Empty State */}
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Você ainda não adicionou nenhum produto aos seus favoritos. Explore o catálogo e marque os produtos que mais gostar!"
          primaryAction={{
            label: 'Explorar Catálogo',
            onClick: () => router.push('/store/catalog'),
            icon: Package,
          }}
          secondaryAction={{
            label: 'Ver Dashboard',
            onClick: () => router.push('/store/dashboard'),
            icon: ShoppingCart,
          }}
        />
      </div>
    )
  }

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true)
      try {
        const client = supa()
        const {
          data: { user },
        } = await client.auth.getUser()
        if (!user) return
        const { data } = await client
          .from('user_favorites')
          .select(
            'created_at, store_product_id, store_products:id ( id, name, description, points_cost, quantity_available, category )'
          )
          .eq('user_id', user.id)
          .limit(100)
        const mapped: FavoriteProduct[] = (data || []).map((row: any) => ({
          id: String(row.store_product_id || row.store_products?.id),
          name: row.store_products?.name || 'Produto',
          description: row.store_products?.description || 'Produto da loja',
          points: Number(row.store_products?.points_cost || 0),
          price: 0,
          image: '/placeholder-product.jpg',
          category: row.store_products?.category || 'Geral',
          stock: Number(row.store_products?.quantity_available || 0),
          rating: 0,
          reviews: 0,
          is_featured: false,
          addedAt: row.created_at || new Date().toISOString(),
        }))
        setFavorites(mapped)
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  useEffect(() => {
    let filtered = favorites.filter(favorite => {
      const matchesSearch =
        favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        favorite.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || favorite.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'points':
          return a.points - b.points
        case 'price':
          return a.price - b.price
        case 'addedAt':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        default:
          return 0
      }
    })

    setFilteredFavorites(filtered)
  }, [favorites, searchTerm, selectedCategory, sortBy])

  const removeFromFavorites = async (productId: string) => {
    try {
      const client = supa()
      const {
        data: { user },
      } = await client.auth.getUser()
      if (!user) return
      await client
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('store_product_id', productId)
      setFavorites(prev => prev.filter(item => item.id !== productId))
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (response.ok) {
        // Remover dos favoritos após adicionar ao carrinho
        await removeFromFavorites(productId)
        router.push('/store/cart')
      } else {
        throw new Error('Erro ao adicionar ao carrinho')
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      alert('Erro ao adicionar ao carrinho. Tente novamente.')
    }
  }

  const addSelectedToCart = async () => {
    if (selectedItems.length === 0) return

    try {
      // Adicionar todos os itens selecionados ao carrinho
      for (const productId of selectedItems) {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            quantity: 1,
          }),
        })
      }

      // Remover todos os itens selecionados dos favoritos
      setFavorites(prev =>
        prev.filter(item => !selectedItems.includes(item.id))
      )
      setSelectedItems([])

      router.push('/store/cart')
    } catch (error) {
      console.error('Erro ao adicionar itens ao carrinho:', error)
      alert('Erro ao adicionar itens ao carrinho. Tente novamente.')
    }
  }

  const toggleItemSelection = (productId: string) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAll = () => {
    setSelectedItems(filteredFavorites.map(item => item.id))
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  const categories = [
    'all',
    ...Array.from(new Set(favorites.map(p => p.category))),
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Meus Favoritos
              </h1>
              <p className="text-gray-600 mt-2">
                Produtos que você salvou para resgatar depois
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {favorites.length}{' '}
                {favorites.length === 1 ? 'favorito' : 'favoritos'}
              </Badge>
              <Button
                onClick={() => router.push('/store/catalog')}
                variant="outline"
              >
                Ver Catálogo
              </Button>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        {selectedItems.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItems.length} item(s) selecionado(s)
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Limpar Seleção
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      selectedItems.forEach(id => removeFromFavorites(id))
                      setSelectedItems([])
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Selecionados
                  </Button>
                  <Button size="sm" onClick={addSelectedToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar nos favoritos..."
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as categorias' : category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="addedAt">Mais recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="points">Menos pontos</option>
                <option value="price">Menor preço</option>
              </select>
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {filteredFavorites.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Selecionar Todos
                </Button>
                <span className="text-sm text-gray-600">
                  {filteredFavorites.length} de {favorites.length} favoritos
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {filteredFavorites.length > 0 ? (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            )}
          >
            {filteredFavorites.map(product => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden relative bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-8 w-8"
                    onClick={() => removeFromFavorites(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(product.id)}
                    onChange={() => toggleItemSelection(product.id)}
                    className="absolute top-2 left-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  {product.is_featured && (
                    <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white">
                      Destaque
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-600" />
                      <span className="text-lg font-bold text-purple-600">
                        {product.points} pts
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.stock} em estoque
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/store/product/${product.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      {product.stock === 0 ? 'Indisponível' : 'Resgatar'}
                    </Button>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Adicionado em{' '}
                    {new Date(product.addedAt).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all'
                ? 'Nenhum favorito encontrado'
                : 'Nenhum favorito ainda'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Tente ajustar os filtros ou termos de busca'
                : 'Adicione produtos aos seus favoritos para encontrá-los aqui'}
            </p>
            <Button onClick={() => router.push('/store/catalog')}>
              Ver Catálogo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
