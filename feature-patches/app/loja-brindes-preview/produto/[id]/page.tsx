'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Gift,
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Package,
  Truck,
  Shield,
  Award,
  Minus,
  Plus,
  MapPin,
  CreditCard,
  CheckCircle,
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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true)

      const { data: productData, error } = await supabase
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
        .eq('id', productId)
        .eq('client_id', '550e8400-e29b-41d4-a716-446655440001')
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Erro ao buscar produto:', error)
        return
      }

      if (productData) {
        setProduct({
          ...productData,
          points_cost: Math.floor(productData.price * 10), // 1 real = 10 pontos
        })
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    // Simular adição ao carrinho
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      points_cost: product.points_cost,
      quantity: quantity,
      image: '/placeholder.png',
    }

    // Salvar no localStorage para simular carrinho
    const existingCart = JSON.parse(
      localStorage.getItem('brindes_cart') || '[]'
    )
    const existingItemIndex = existingCart.findIndex(
      (item: any) => item.productId === product.id
    )

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity
    } else {
      existingCart.push(cartItem)
    }

    localStorage.setItem('brindes_cart', JSON.stringify(existingCart))

    // Redirecionar para o carrinho
    router.push('/loja-brindes-preview/carrinho')
  }

  const handleBuyNow = () => {
    if (!product) return

    // Adicionar ao carrinho e ir direto para checkout
    handleAddToCart()
    router.push('/loja-brindes-preview/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Produto não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            O produto que você está procurando não existe ou não está mais
            disponível.
          </p>
          <Button onClick={() => router.push('/loja-brindes-preview')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a loja
          </Button>
        </div>
      </div>
    )
  }

  const mockImages = [
    '/placeholder.png',
    '/placeholder.png',
    '/placeholder.png',
  ]

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
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <Gift className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Loja de Brindes</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Favoritar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Gift className="h-32 w-32 text-white" />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-2">
              {mockImages.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center cursor-pointer border-2 ${
                    selectedImage === index
                      ? 'border-blue-600'
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Gift className="h-8 w-8 text-white" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-green-500">Em Estoque</Badge>
                <Badge className="bg-yellow-500">
                  {product.points_cost} pontos
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            {/* Price and Points */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {product.points_cost} pontos
                  </div>
                  <div className="text-lg text-gray-500">
                    R${' '}
                    {product.price.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Estoque disponível
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {product.stock_quantity}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-medium text-gray-700">
                  Quantidade:
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stock_quantity, quantity + 1)
                      )
                    }
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Comprar Agora ({product.points_cost * quantity} pontos)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Entrega Rápida</h3>
                  <p className="text-xs text-gray-600">24-48 horas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Produto Original</h3>
                  <p className="text-xs text-gray-600">Garantia total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Qualidade</h3>
                  <p className="text-xs text-gray-600">Premium</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Descrição do Produto
                  </h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Informações Técnicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">SKU:</span>
                      <span className="ml-2 font-medium">
                        {product.final_sku}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="ml-2 font-medium capitalize">
                        {product.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Estoque:</span>
                      <span className="ml-2 font-medium">
                        {product.stock_quantity} unidades
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Categoria:</span>
                      <span className="ml-2 font-medium">Brindes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



