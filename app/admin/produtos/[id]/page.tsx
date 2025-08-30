"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package,
  Building,
  Tag,
  DollarSign,
  Award,
  Calendar,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url?: string
  status: string
  created_at: string
  companies?: { name: string }
  categories?: { name: string }
}

export default function ProductViewPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      } else {
        throw new Error('Produto não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
      toast.error('Erro ao carregar produto')
      router.push('/admin/produtos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Produto excluído com sucesso!')
        router.push('/admin/produtos')
      } else {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao excluir produto')
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir produto')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Sem Estoque</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando produto...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Produto não encontrado
            </h3>
            <Button onClick={() => router.push('/admin/produtos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Produtos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/produtos')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Produtos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Imagem do Produto */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://ui-avatars.com/api/?name=Produto&background=1e40af&color=ffffff&size=400'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src="https://ui-avatars.com/api/?name=Produto&background=1e40af&color=ffffff&size=400"
                      alt="Placeholder"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <CardDescription>
                      {product.companies?.name || 'Empresa não definida'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Preço</p>
                      <p className="font-semibold text-green-600">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pontos</p>
                      <p className="font-semibold text-purple-600">{product.points_cost} pts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Estoque</p>
                      <p className="font-semibold text-blue-600">{product.stock_quantity} unidades</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Categoria</p>
                      <p className="font-semibold text-orange-600">
                        {product.categories?.name || 'Sem categoria'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`/admin/produtos/editar/${product.id}`)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Produto
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
