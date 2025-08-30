"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  ArrowLeft,
  ShoppingCart, 
  Heart, 
  Star,

  Share2,
  Truck,
  CreditCard,
  QrCode,
  Coins,
  Package,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Product } from "@/types/supabase"
import { useProduct } from "@/hooks/useProducts"

interface ProductReview {
  id: string
  user_name: string
  rating: number
  title: string
  comment: string
  date: string
}

const mockReviews: ProductReview[] = [
  {
    id: "1",
    user_name: "João Silva",
    rating: 5,
    title: "Excelente qualidade!",
    comment: "O produto chegou antes do prazo e a qualidade é excepcional. Recomendo muito!",
    date: "2024-01-15"
  },
  {
    id: "2",
    user_name: "Maria Santos",
    rating: 4,
    title: "Muito bom",
    comment: "Produto de boa qualidade, entrega rápida. Só não dei 5 estrelas porque o tamanho ficou um pouco pequeno.",
    date: "2024-01-10"
  },
  {
    id: "3",
    user_name: "Carlos Oliveira",
    rating: 5,
    title: "Perfeito!",
    comment: "Exatamente como descrito, entrega super rápida e produto de excelente qualidade.",
    date: "2024-01-05"
  }
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const { product, loading } = useProduct(productId)
  const [quantity, setQuantity] = useState(1)
  const [selectedClaimMethod, setSelectedClaimMethod] = useState<'points' | 'credit_card' | 'pix' | 'boleto' | 'free'>('points')
  const [showShippingInfo, setShowShippingInfo] = useState(false)
  const [userPoints, setUserPoints] = useState(1250)

  const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
  const totalReviews = mockReviews.length

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const addToCart = () => {
    // Implementar lógica do carrinho
    console.log('Adicionando ao carrinho:', {
      product,
      quantity,
      claimMethod: selectedClaimMethod
    })
  }

  const getClaimMethodIcon = (method: string) => {
    switch (method) {
      case 'points':
        return <Coins className="h-4 w-4" />
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />
      case 'pix':
        return <QrCode className="h-4 w-4" />
      case 'boleto':
        return <Package className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getClaimMethodLabel = (method: string) => {
    switch (method) {
      case 'points':
        return 'Pontos'
      case 'credit_card':
        return 'Cartão de Crédito'
      case 'pix':
        return 'PIX'
      case 'boleto':
        return 'Boleto'
      case 'free':
        return 'Grátis'
      default:
        return method
    }
  }

  const getClaimMethodColor = (method: string) => {
    switch (method) {
      case 'points':
        return 'bg-yellow-100 text-yellow-800'
      case 'credit_card':
        return 'bg-blue-100 text-blue-800'
      case 'pix':
        return 'bg-green-100 text-green-800'
      case 'boleto':
        return 'bg-orange-100 text-orange-800'
      case 'free':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Produto não encontrado</h2>
          <p className="text-gray-600 mb-4">O produto que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => router.push('/loja-brindes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Loja
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.push('/loja-brindes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Loja
            </Button>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg?height=400&width=400"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={product.image_url || "/placeholder.svg?height=100&width=100"}
                    alt={`${product.name} ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({totalReviews} avaliações)
                </span>
              </div>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Price and Points */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  R$ {Number(product.price).toFixed(2)}
                </span>
                <span className="text-lg text-gray-600">
                  {(Number(product.price) * 10).toLocaleString()} pts
                </span>
              </div>

              {/* Available Claim Methods */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Métodos de Resgate Disponíveis
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {product.claim_methods?.map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedClaimMethod(method as any)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                        selectedClaimMethod === method
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {getClaimMethodIcon(method)}
                      <span className="text-sm font-medium">{getClaimMethodLabel(method)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantidade
                </Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button 
                className="w-full"
                size="lg"
                onClick={addToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  Informações de Entrega
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShippingInfo(!showShippingInfo)}
                  >
                    {showShippingInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showShippingInfo && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Prazo de Entrega:</span>
                      <p className="text-gray-600">5-7 dias úteis</p>
                    </div>
                    <div>
                      <span className="font-medium">Frete:</span>
                      <p className="text-gray-600">Grátis para pedidos acima de R$ 50</p>
                    </div>
                    <div>
                      <span className="font-medium">Rastreamento:</span>
                      <p className="text-gray-600">Disponível após envio</p>
                    </div>
                    <div>
                      <span className="font-medium">Devolução:</span>
                      <p className="text-gray-600">30 dias após recebimento</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="specifications">Especificações</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              <TabsTrigger value="shipping">Entrega</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || 'Descrição detalhada do produto será exibida aqui.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Material:</span>
                      <p className="text-gray-600">Algodão 100%</p>
                    </div>
                    <div>
                      <span className="font-medium">Peso:</span>
                      <p className="text-gray-600">150g</p>
                    </div>
                    <div>
                      <span className="font-medium">Dimensões:</span>
                      <p className="text-gray-600">30 x 20 x 5 cm</p>
                    </div>
                    <div>
                      <span className="font-medium">Origem:</span>
                      <p className="text-gray-600">{product.country || 'Brasil'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{review.title}</h4>
                            <p className="text-sm text-gray-600">{review.user_name}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">{review.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Informações de Entrega</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Entrega em 5-7 dias úteis</li>
                        <li>• Frete grátis para pedidos acima de R$ 50</li>
                        <li>• Rastreamento disponível após envio</li>
                        <li>• Entrega em todo o Brasil</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Política de Devolução</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• 30 dias para devolução</li>
                        <li>• Produto deve estar em perfeito estado</li>
                        <li>• Frete de devolução por conta do cliente</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


