"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  Package, 
  Truck, 
  Shield,
  Minus,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url: string
  status: string
  stores: {
    id: string
    name: string
    domain: string
    description: string
    logo_url: string
    primary_color: string
    secondary_color: string
    companies: {
      name: string
    }
  }
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/store/product/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data.product)
        } else {
          toast.error('Produto não encontrado')
          router.push('/store')
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error)
        toast.error('Erro ao carregar produto')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id, router])

  const addToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    
    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          storeId: product.stores.id
        })
      })

      if (response.ok) {
        toast.success('Produto adicionado ao carrinho!')
        // Redirecionar para o carrinho ou checkout
        router.push('/store/cart')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao adicionar ao carrinho')
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      toast.error('Erro ao adicionar ao carrinho')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Produto não encontrado</h2>
          <p className="text-gray-600 mb-4">O produto que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              {product.stores.logo_url && (
                <img 
                  src={product.stores.logo_url} 
                  alt={product.stores.name}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h1 className="text-sm font-medium text-gray-900">{product.stores.name}</h1>
                <p className="text-xs text-gray-500">{product.stores.companies.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.product_categories && (
                <Badge 
                  variant="outline" 
                  className="mb-4"
                  style={{ 
                    borderColor: product.product_categories.color,
                    color: product.product_categories.color 
                  }}
                >
                  {product.product_categories.name}
                </Badge>
              )}
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price and Points */}
            <div className="space-y-4">
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.points_cost > 0 && (
                  <span className="text-lg text-gray-500">
                    ou {product.points_cost} pontos
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>Estoque: {product.stock_quantity} unidades</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Quantidade
              </label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={addToCart}
              disabled={addingToCart || product.stock_quantity === 0}
              className="w-full h-12 text-lg"
              style={{
                backgroundColor: product.stores.primary_color || '#3b82f6',
                borderColor: product.stores.primary_color || '#3b82f6'
              }}
            >
              {addingToCart ? (
                <>
                  <Package className="h-5 w-5 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : product.stock_quantity === 0 ? (
                'Produto indisponível'
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Adicionar ao Carrinho
                </>
              )}
            </Button>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Entrega rápida</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Garantia de qualidade</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Produto original</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Qualidade premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
