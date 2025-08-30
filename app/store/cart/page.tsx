"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Star,
  Package,
  Truck,
  CreditCard,
  ArrowRight,
  X,
  Coins,
  Wallet
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { usePoints } from "@/hooks/usePoints"

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  points: number
  quantity: number
  image: string
  size?: string
  color?: string
}

const mockCartItems: CartItem[] = [
  {
    id: "1",
    name: "Camiseta Corporativa",
    description: "Camiseta 100% algodão com logo da empresa",
    price: 89.90,
    points: 150,
    quantity: 2,
    image: "https://via.placeholder.com/100x100/1e40af/ffffff?text=CC",
    size: "M",
    color: "Azul"
  },
  {
    id: "2",
    name: "Caneca Personalizada",
    description: "Caneca de cerâmica com design exclusivo",
    price: 45.00,
    points: 75,
    quantity: 1,
    image: "https://via.placeholder.com/100x100/3b82f6/ffffff?text=CP"
  }
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems)
  const [loading, setLoading] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'money' | 'mixed'>('points')
  
  // Mock company ID - em produção viria do contexto/estado
  const mockCompanyId = '550e8400-e29b-41d4-a716-446655440001'
  const { balance, loading: pointsLoading } = usePoints(mockCompanyId)

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const totalPoints = cartItems.reduce((sum, item) => sum + (item.points * item.quantity), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  
  // Calcular valores baseado no uso de pontos
  const maxPointsToUse = Math.min(balance, totalPoints)
  const pointsValue = pointsToUse * 0.1 // 1 ponto = R$ 0,10
  const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const finalValue = Math.max(0, totalValue - pointsValue)

  const handleCheckout = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: '550e8400-e29b-41d4-a716-446655440002', // Mock store ID
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price
          })),
          usePoints: pointsToUse,
          currency: 'BRL'
        }),
      })

      const result = await response.json()
      
      if (result.checkoutUrl) {
        // Redirecionar para Stripe
        window.location.href = result.checkoutUrl
      } else if (result.amountDue === 0) {
        // Pedido pago 100% com pontos
        window.location.href = `/store/orders/${result.orderId}/confirmed`
      } else {
        throw new Error('Erro no checkout')
      }
    } catch (error) {
      console.error('Erro no checkout:', error)
      alert('Erro ao processar checkout. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-6">Adicione produtos para começar seus resgates</p>
            <Button onClick={() => window.location.href = '/store/catalog'}>
              Ver Catálogo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <YoobeLogo size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carrinho de Resgates</h1>
              <p className="text-gray-600">Revise seus itens antes de finalizar</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                          {item.size && (
                            <p className="text-sm text-gray-500 mt-1">
                              Tamanho: {item.size}
                            </p>
                          )}
                          {item.color && (
                            <p className="text-sm text-gray-500">
                              Cor: {item.color}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-purple-600 font-semibold">
                            <Star className="h-4 w-4" />
                            <span>{item.points * item.quantity} pts</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.points} pts cada
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saldo de Pontos */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">Seus Pontos</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {pointsLoading ? '...' : balance}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Disponível para uso: {maxPointsToUse} pontos
                  </p>
                </div>

                {/* Itens do Carrinho */}
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-purple-600">
                          <Star className="h-3 w-3" />
                          {item.points * item.quantity}
                        </div>
                        <div className="text-xs text-gray-500">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Uso de Pontos */}
                {maxPointsToUse > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Usar Pontos</span>
                        <span className="text-sm text-purple-600">
                          {pointsToUse} / {maxPointsToUse}
                        </span>
                      </div>
                      <Slider
                        value={[pointsToUse]}
                        onValueChange={(value) => setPointsToUse(value[0])}
                        max={maxPointsToUse}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        Valor dos pontos: R$ {pointsValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Resumo Final */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {totalValue.toFixed(2)}</span>
                  </div>
                  {pointsToUse > 0 && (
                    <div className="flex justify-between text-sm text-purple-600">
                      <span>Desconto Pontos</span>
                      <span>- R$ {pointsValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                    <span>Total a Pagar</span>
                    <span className="flex items-center gap-1">
                      {finalValue === 0 ? (
                        <>
                          <Star className="h-5 w-5 text-purple-600" />
                          {pointsToUse}
                        </>
                      ) : (
                        <>
                          <Wallet className="h-5 w-5 text-green-600" />
                          R$ {finalValue.toFixed(2)}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Entrega gratuita</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Entrega em 3-5 dias úteis</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading || pointsLoading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {finalValue === 0 ? (
                        <>
                          <Star className="h-4 w-4" />
                          Resgatar com Pontos
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Finalizar Compra
                        </>
                      )}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/store/catalog'}
                >
                  Continuar Comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


