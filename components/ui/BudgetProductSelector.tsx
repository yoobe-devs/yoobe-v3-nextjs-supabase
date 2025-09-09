import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Minus,
  ShoppingCart,
  Package,
  DollarSign,
  Search,
  Filter,
  X,
} from 'lucide-react'
import { ProductGrid } from './ProductGrid'
import { ProductFilters } from './ProductFilters'

interface BudgetProductSelectorProps {
  budgetId?: string
  onItemsAdd?: (items: BudgetItem[]) => void
  onClose?: () => void
  className?: string
}

interface BaseProduct {
  id: string
  name: string
  description: string
  description_long?: string
  base_price: number
  base_points_cost: number
  images: string[]
  specifications: Record<string, any>
  features: string[]
  available_colors: string[]
  available_sizes: string[]
  customization_options: Record<string, any>
  lead_time_days: number
  min_quantity: number
  max_quantity: number
  is_featured: boolean
  tags: string[]
  status: string
  category_id: string
  product_categories?: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  }
}

interface BudgetItem {
  base_product_id: string
  quantity: number
  unit_price: number
  total_price: number
  selected_color?: string
  selected_size?: string
  customization_notes?: string
  product: BaseProduct
}

export function BudgetProductSelector({
  budgetId,
  onItemsAdd,
  onClose,
  className = '',
}: BudgetProductSelectorProps) {
  const [products, setProducts] = useState<BaseProduct[]>([])
  const [selectedItems, setSelectedItems] = useState<Map<string, BudgetItem>>(
    new Map()
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCart, setShowCart] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('q', searchTerm)
      if (categoryFilter !== 'all') params.append('category_id', categoryFilter)

      const response = await fetch(`/api/base-products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products || [])
      } else {
        setError(data.error?.message || 'Erro ao carregar produtos')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, categoryFilter])

  const addToCart = (product: BaseProduct) => {
    const existingItem = selectedItems.get(product.id)

    if (existingItem) {
      // Atualizar quantidade
      const newQuantity = Math.min(
        existingItem.quantity + 1,
        product.max_quantity
      )
      const updatedItem = {
        ...existingItem,
        quantity: newQuantity,
        total_price: newQuantity * existingItem.unit_price,
      }
      setSelectedItems(new Map(selectedItems.set(product.id, updatedItem)))
    } else {
      // Adicionar novo item
      const newItem: BudgetItem = {
        base_product_id: product.id,
        quantity: Math.max(1, product.min_quantity),
        unit_price: product.base_price,
        total_price: product.base_price * Math.max(1, product.min_quantity),
        product,
      }
      setSelectedItems(new Map(selectedItems.set(product.id, newItem)))
    }
  }

  const removeFromCart = (productId: string) => {
    const newItems = new Map(selectedItems)
    newItems.delete(productId)
    setSelectedItems(newItems)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = selectedItems.get(productId)
    if (item) {
      const product = item.product
      const newQuantity = Math.max(
        product.min_quantity,
        Math.min(quantity, product.max_quantity)
      )
      const updatedItem = {
        ...item,
        quantity: newQuantity,
        total_price: newQuantity * item.unit_price,
      }
      setSelectedItems(new Map(selectedItems.set(productId, updatedItem)))
    }
  }

  const updateItemDetails = (
    productId: string,
    updates: Partial<BudgetItem>
  ) => {
    const item = selectedItems.get(productId)
    if (item) {
      const updatedItem = { ...item, ...updates }
      setSelectedItems(new Map(selectedItems.set(productId, updatedItem)))
    }
  }

  const addItemsToBudget = () => {
    const items = Array.from(selectedItems.values())
    onItemsAdd?.(items)
    setSelectedItems(new Map())
    setShowCart(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const getTotalValue = () => {
    return Array.from(selectedItems.values()).reduce(
      (total, item) => total + item.total_price,
      0
    )
  }

  const getTotalItems = () => {
    return Array.from(selectedItems.values()).reduce(
      (total, item) => total + item.quantity,
      0
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Selecionar Produtos para Orçamento
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCart(!showCart)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Buscar produtos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="camisetas">Camisetas</SelectItem>
                  <SelectItem value="canecas">Canecas</SelectItem>
                  <SelectItem value="adesivos">Adesivos</SelectItem>
                  <SelectItem value="posters">Posters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid de produtos */}
          <ProductGrid
            products={products}
            onProductSelect={addToCart}
            showAddButton={true}
            className="mb-6"
          />

          {/* Carrinho lateral */}
          {showCart && (
            <Card className="fixed right-4 top-1/2 transform -translate-y-1/2 w-96 max-h-96 overflow-y-auto z-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Carrinho</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCart(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItems.size === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Carrinho vazio</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from(selectedItems.values()).map(item => (
                      <div
                        key={item.base_product_id}
                        className="border rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">
                            {item.product.name}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.base_product_id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Controles de quantidade */}
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(
                                item.base_product_id,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= item.product.min_quantity
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(
                                item.base_product_id,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >= item.product.max_quantity
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Opções de personalização */}
                        {item.product.available_colors.length > 0 && (
                          <div className="mb-2">
                            <Label className="text-xs">Cor</Label>
                            <Select
                              value={item.selected_color || ''}
                              onValueChange={value =>
                                updateItemDetails(item.base_product_id, {
                                  selected_color: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecionar cor" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.product.available_colors.map(color => (
                                  <SelectItem key={color} value={color}>
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {item.product.available_sizes.length > 0 && (
                          <div className="mb-2">
                            <Label className="text-xs">Tamanho</Label>
                            <Select
                              value={item.selected_size || ''}
                              onValueChange={value =>
                                updateItemDetails(item.base_product_id, {
                                  selected_size: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecionar tamanho" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.product.available_sizes.map(size => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {formatCurrency(item.unit_price)} cada
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(item.total_price)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between items-center font-semibold">
                      <span>Total ({getTotalItems()} itens):</span>
                      <span>{formatCurrency(getTotalValue())}</span>
                    </div>

                    <Button
                      onClick={addItemsToBudget}
                      className="w-full"
                      disabled={selectedItems.size === 0}
                    >
                      Adicionar ao Orçamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

