"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Star,
  Package,
  Truck,
  CreditCard,
  QrCode,
  Coins,
  User,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useProducts } from "@/hooks/useProducts"

interface CartItem {
  product: {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string | null
    claim_methods: ("credit_card" | "points" | "boleto" | "pix" | "free")[] | null
    country: string | null
    created_at: string
    updated_at: string
    sku: string | null
    status: string | null
  }
  quantity: number
  claimMethod: 'points' | 'credit_card' | 'pix' | 'boleto' | 'free'
}

export default function LojaBrindesHome() {
  const { products, loading } = useProducts()
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [showFilters, setShowFilters] = useState(false)
  const [userPoints, setUserPoints] = useState(1250)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return Number(a.price) - Number(b.price)
      case "name":
        return a.name.localeCompare(b.name)
      case "popularity":
        return 0 // Implementar lógica de popularidade
      default:
        return 0
    }
  })

  const addToCart = (product: any, claimMethod: CartItem['claimMethod'] = 'points') => {
    // Garantir que o produto tem todos os campos necessários
    const safeProduct = {
      ...product,
      category_id: product.category_id || null,
      claim_methods: product.claim_methods || null,
      country: product.country || null,
      description: product.description || null,
      image_url: product.image_url || null,
      sku: product.sku || null,
      status: product.status || null
    }
    
    const existingItem = cart.find(item => item.product.id === safeProduct.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === safeProduct.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product: safeProduct, quantity: 1, claimMethod }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const cartTotal = cart.reduce((total, item) => {
    const price = Number(item.product.price)
    return total + (price * item.quantity)
  }, 0)

  const cartTotalPoints = cart.reduce((total, item) => {
    if (item.claimMethod === 'points') {
      const price = Number(item.product.price)
      // Converter preço para pontos (exemplo: R$ 1 = 10 pontos)
      return total + (price * item.quantity * 10)
    }
    return total
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Yoobe Store</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Points Display */}
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {userPoints.toLocaleString()} pts
                </span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Filtros
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="bones">Bonés</SelectItem>
                      <SelectItem value="camisetas">Camisetas</SelectItem>
                      <SelectItem value="canecas">Canecas</SelectItem>
                      <SelectItem value="acessorios">Acessórios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter */}
                <div className="space-y-2">
                  <Label>Ordenar por</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="price">Preço</SelectItem>
                      <SelectItem value="popularity">Popularidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Faixa de Preço</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Mín" />
                    <Input placeholder="Máx" />
                  </div>
                </div>

                {/* Claim Methods */}
                <div className="space-y-2">
                  <Label>Método de Resgate</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Pontos</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Cartão de Crédito</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">PIX</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Boleto</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Produtos Disponíveis
                </h2>
                <p className="text-gray-600">
                  {sortedProducts.length} produto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="w-full h-48 bg-gray-200 rounded-lg" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <img
                          src={product.image_url || "/placeholder.svg?height=200&width=200"}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="space-y-3">
                        {/* Price Display */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            R$ {Number(product.price).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {(Number(product.price) * 10).toLocaleString()} pts
                          </span>
                        </div>

                        {/* Claim Methods */}
                        <div className="flex flex-wrap gap-2">
                          {product.claim_methods?.includes('points') && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Coins className="h-3 w-3 mr-1" />
                              Pontos
                            </span>
                          )}
                          {product.claim_methods?.includes('credit_card') && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Cartão
                            </span>
                          )}
                          {product.claim_methods?.includes('pix') && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <QrCode className="h-3 w-3 mr-1" />
                              PIX
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button 
                          className="w-full"
                          onClick={() => addToCart(product, 'points')}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Adicionar ao Carrinho
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && sortedProducts.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar os filtros ou buscar por outro termo.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Carrinho</h2>
                <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.product.image_url || "/placeholder.svg?height=60&width=60"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        R$ {Number(item.product.price).toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Pontos necessários:</span>
                  <span>{cartTotalPoints.toLocaleString()} pts</span>
                </div>
                <Button className="w-full">
                  Finalizar Compra
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


