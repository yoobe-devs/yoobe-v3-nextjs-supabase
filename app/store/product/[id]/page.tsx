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

interface Product {
  id: string
  name: string
  description: string
  price: number
  points: number
  image: string
  category: string
  stock: number
  rating: number
  reviews: number
  features: string[]
  specifications: Record<string, string>
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
        // Mock product data - em produção viria da API
        const mockProduct: Product = {
          id: params.id as string,
          name: 'Camiseta Corporativa Join Tecnologia',
          description: 'Camiseta de alta qualidade com logo da empresa, feita em 100% algodão. Perfeita para eventos corporativos e uso diário.',
          price: 45.00,
          points: 450,
          image: '/placeholder-product.jpg',
          category: 'Vestuário',
          stock: 25,
          rating: 4.8,
          reviews: 12,
          features: [
            '100% algodão',
            'Logo bordado',
            'Múltiplos tamanhos',
            'Lavagem à máquina',
            'Não encolhe'
          ],
          specifications: {
            'Material': '100% Algodão',
            'Peso': '180g/m²',
            'Tamanhos': 'P, M, G, GG',
            'Cores': 'Azul, Branco, Preto',
            'Cuidados': 'Lavar à máquina 30°C'
          }
        }
        
        setProduct(mockProduct)
      } catch (error) {
        console.error('Erro ao carregar produto:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  const addToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Redirecionar para o carrinho
        router.push('/store/cart')
      } else {
        throw new Error(result.error || 'Erro ao adicionar ao carrinho')
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      alert('Erro ao adicionar ao carrinho. Tente novamente.')
    } finally {
      setAddingToCart(false)
    }
  }

  const updateQuantity = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(product?.stock || 1, quantity + delta))
    setQuantity(newQuantity)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h2>
          <p className="text-gray-600 mb-6">O produto que você está procurando não existe.</p>
          <Button onClick={() => router.push('/store/catalog')}>
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagem do Produto */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border">
              <Package className="h-32 w-32 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <div className="w-20 h-20 bg-gray-100 rounded border-2 border-blue-500 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0 ? 'Em Estoque' : 'Sem Estoque'}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-gray-600">({product.reviews} avaliações)</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Preços */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-gray-900">
                  R$ {product.price.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 text-purple-600">
                  <Star className="h-5 w-5" />
                  <span className="text-xl font-semibold">{product.points} pontos</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ou {product.points} pontos para resgate
              </p>
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {product.stock} disponíveis
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                size="lg"
                onClick={addToCart}
                disabled={addingToCart || product.stock === 0}
              >
                {addingToCart ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adicionando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar ao Carrinho
                  </div>
                )}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Informações de Entrega */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Entrega Gratuita</p>
                      <p className="text-sm text-gray-600">3-5 dias úteis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Garantia</p>
                      <p className="text-sm text-gray-600">30 dias para troca</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Características e Especificações */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Especificações */}
          <Card>
            <CardHeader>
              <CardTitle>Especificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b last:border-b-0">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
