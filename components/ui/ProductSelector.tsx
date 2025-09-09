'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Package,
  Plus,
  Minus,
  X,
  Loader2,
  Filter,
  Grid,
  List,
} from 'lucide-react'
import { toast } from 'sonner'

interface BaseProduct {
  id: string
  name: string
  base_price: number
  base_points_cost?: number
  description?: string
  image_url?: string
  category_id?: string
  product_categories?: {
    name: string
  }
}

interface SelectedProduct {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
}

interface ProductSelectorProps {
  onProductsChange: (products: SelectedProduct[]) => void
  selectedProducts: SelectedProduct[]
  disabled?: boolean
}

export function ProductSelector({
  onProductsChange,
  selectedProducts,
  disabled = false,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<BaseProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/catalog/base-products?pageSize=100')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.items || [])
      } else {
        console.error('Erro ao carregar produtos')
        toast.error('Erro ao carregar produtos')
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || product.category_id === categoryFilter
    const matchesPrice = (() => {
      if (priceRange === 'all') return true
      const price = product.base_price
      switch (priceRange) {
        case '0-50':
          return price >= 0 && price <= 50
        case '50-100':
          return price > 50 && price <= 100
        case '100-200':
          return price > 100 && price <= 200
        case '200+':
          return price > 200
        default:
          return true
      }
    })()
    return matchesSearch && matchesCategory && matchesPrice
  })

  const addProduct = (product: BaseProduct) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id)
    if (existingProduct) {
      updateQuantity(product.id, existingProduct.quantity + 1)
    } else {
      const newProduct: SelectedProduct = {
        id: product.id,
        name: product.name,
        price: product.base_price,
        image: product.image_url || undefined,
        quantity: 1,
      }
      onProductsChange([...selectedProducts, newProduct])
    }
  }

  const removeProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter(p => p.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }
    onProductsChange(
      selectedProducts.map(p => (p.id === productId ? { ...p, quantity } : p))
    )
  }

  const getTotalPrice = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    )
  }

  const renderProductCard = (product: BaseProduct) => (
    <Card key={product.id} className="h-full">
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-blue-600">
                R$ {product.base_price.toLocaleString('pt-BR')}
              </span>
              {product.product_categories && (
                <Badge variant="outline" className="text-xs">
                  {product.product_categories.name}
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => addProduct(product)}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderProductList = (product: BaseProduct) => (
    <div
      key={product.id}
      className="flex items-center justify-between p-3 border rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="h-4 w-4" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm">{product.name}</h3>
          <p className="text-xs text-gray-600">
            R$ {product.base_price.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
      <Button size="sm" onClick={() => addProduct(product)} disabled={disabled}>
        <Plus className="h-4 w-4 mr-1" />
        Adicionar
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-600">
                        R$ {product.price.toLocaleString('pt-BR')} cada
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(product.id, product.quantity - 1)
                      }
                      disabled={disabled}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {product.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(product.id, product.quantity + 1)
                      }
                      disabled={disabled}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeProduct(product.id)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    R$ {getTotalPrice().toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button disabled={disabled}>
            <Plus className="h-4 w-4 mr-2" />
            {selectedProducts.length > 0
              ? `Adicionar Mais Produtos (${selectedProducts.length} selecionados)`
              : 'Selecionar Produtos'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Selecionar Produtos</DialogTitle>
            <DialogDescription>
              Escolha os produtos para incluir no orçamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {/* TODO: Add category options */}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="0-50">R$ 0 - 50</SelectItem>
                  <SelectItem value="50-100">R$ 50 - 100</SelectItem>
                  <SelectItem value="100-200">R$ 100 - 200</SelectItem>
                  <SelectItem value="200+">R$ 200+</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-lg">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-2'
                  }
                >
                  {filteredProducts.map(product =>
                    viewMode === 'grid'
                      ? renderProductCard(product)
                      : renderProductList(product)
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

