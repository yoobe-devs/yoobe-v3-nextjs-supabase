'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Search, 
  Package,
  Star,
  Heart,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  description: string
  domain: string
  logo_url: string
  banner_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  theme: string
  layout: string
  status: string
  companies: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url: string
  status: string
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

export default function StorePage() {
  const params = useParams()
  const domain = params.domain as string
  
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<{[key: string]: number}>({})
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    loadStoreData()
  }, [domain])

  const loadStoreData = async () => {
    try {
      // Buscar dados da loja
      const storeResponse = await fetch(`/api/store/${domain}`)
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        setStore(storeData)
      }

      // Buscar produtos da loja
      const productsResponse = await fetch(`/api/store/${domain}/products`)
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error)
      toast.error('Erro ao carregar dados da loja')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
    toast.success('Produto adicionado ao carrinho!')
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] > 1) {
        newCart[productId] -= 1
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId)
      return total + (product?.price || 0) * quantity
    }, 0)
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  }

  const handleCheckout = async () => {
    if (getCartItemCount() === 0) {
      toast.error('Carrinho vazio')
      return
    }

    // Se não há informações do usuário, mostrar modal
    if (!guestInfo.name || !guestInfo.email) {
      setShowLoginModal(true)
      return
    }

    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store?.id,
          customer_info: guestInfo,
          items: Object.entries(cart).map(([productId, quantity]) => ({
            product_id: productId,
            quantity
          }))
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Pedido realizado com sucesso!')
        setCart({})
        setShowLoginModal(false)
      } else {
        throw new Error('Erro ao finalizar pedido')
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      toast.error('Erro ao finalizar pedido')
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando loja...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">A loja que você está procurando não existe ou foi desativada.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Loja */}
      <header 
        className="bg-white shadow-sm border-b"
        style={{ 
          '--primary-color': store.primary_color,
          '--secondary-color': store.secondary_color,
          '--accent-color': store.accent_color
        } as React.CSSProperties}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {store.logo_url && (
                <img 
                  src={store.logo_url} 
                  alt={store.name}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h1 className="text-xl font-bold" style={{ color: store.primary_color }}>
                  {store.name}
                </h1>
                <p className="text-sm text-gray-600">{store.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="flex items-center gap-2"
                style={{ backgroundColor: store.primary_color }}
              >
                <ShoppingCart className="h-4 w-4" />
                Carrinho ({getCartItemCount()})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner da Loja */}
      {store.banner_url && (
        <div className="w-full h-64 bg-cover bg-center" style={{ backgroundImage: `url(${store.banner_url})` }}>
          <div className="w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-2">{store.name}</h2>
              <p className="text-xl">{store.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações da Empresa */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sobre {store.companies.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{store.companies.email}</span>
              </div>
              {store.companies.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{store.companies.phone}</span>
                </div>
              )}
              {store.companies.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{store.companies.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Produtos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Produtos</h2>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente ajustar os termos de busca' : 'Esta loja ainda não possui produtos'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status === 'active' ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.points_cost > 0 && (
                          <Badge variant="outline">
                            {product.points_cost} pontos
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Estoque: {product.stock_quantity} unidades
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => addToCart(product.id)}
                        disabled={product.status !== 'active' || product.stock_quantity === 0}
                        style={{ backgroundColor: store.primary_color }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Login/Registro */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Informações para Pedido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                <Input
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowLoginModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCheckout}
                className="flex-1"
                style={{ backgroundColor: store.primary_color }}
              >
                Finalizar Pedido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
