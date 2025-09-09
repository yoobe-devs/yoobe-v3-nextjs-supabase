'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Gift,
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from 'lucide-react'

interface CartItem {
  productId: string
  name: string
  price: number
  points_cost: number
  quantity: number
  image: string
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('brindes_cart') || '[]')
      setCartItems(cart)
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    const updatedCart = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('brindes_cart', JSON.stringify(updatedCart))
  }

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId)
    setCartItems(updatedCart)
    localStorage.setItem('brindes_cart', JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('brindes_cart')
  }

  const getTotalPoints = () => {
    return cartItems.reduce(
      (total, item) => total + item.points_cost * item.quantity,
      0
    )
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
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
                  onClick={() => router.push('/loja-brindes-preview')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold">Carrinho</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-8">
              Adicione alguns produtos incríveis para começar seu resgate!
            </p>
            <Button
              onClick={() => router.push('/loja-brindes-preview')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Gift className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </div>
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
                onClick={() => router.push('/loja-brindes-preview')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">
                  Carrinho ({getTotalItems()})
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Carrinho
            </Button>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Itens no Carrinho
            </h2>

            {cartItems.map(item => (
              <Card key={item.productId}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="h-10 w-10 text-white" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.points_cost} pontos • R${' '}
                        {item.price.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Qtd:</span>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 mb-2">
                        {item.points_cost * item.quantity} pontos
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Itens ({getTotalItems()})</span>
                    <span>{getTotalPoints()} pontos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Entrega</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">
                        {getTotalPoints()} pontos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/loja-brindes-preview/checkout')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finalizar Pedido
                </Button>

                {/* Continue Shopping */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/loja-brindes-preview')}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Continuar Comprando
                </Button>

                {/* Shipping Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      Entrega Grátis
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Entrega em 24-48 horas para todo o Brasil
                  </p>
                </div>

                {/* Security Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">
                      Compra Segura
                    </span>
                  </div>
                  <p className="text-sm text-green-800">
                    Seus pontos são processados com segurança
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}










