"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package,
  Tag,
  DollarSign,
  Award,
  FileText,
  Settings,
  Loader2,
  AlertCircle,
  Clock,
  Factory,
  Box,
  Minus,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import BulkPricingEditor from '@/components/ui/bulk-pricing-editor'
import { Input } from '@/components/ui/input'

export default function ProdutoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const productId = params.id as string

  // Verificar se é admin
  useEffect(() => {
    if (user && user.user_metadata?.role !== 'admin') {
      router.push('/admin/dashboard')
      toast.error('Acesso negado - Apenas administradores podem acessar esta página')
    }
  }, [user, router])

  // Carregar produto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/base-products/${productId}`)
        const data = await response.json()
        
        if (response.ok) {
          setProduct(data)
        } else {
          throw new Error(data.error || 'Erro ao carregar produto')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao carregar produto:', err)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${product.name}"?`)) return

    try {
      const response = await fetch(`/api/base-products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Produto excluído com sucesso')
        router.push('/admin/produtos')
      } else {
        throw new Error('Erro ao excluir produto')
      }
    } catch (error) {
      toast.error('Erro ao excluir produto')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Carregando produto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
            <p className="mt-2 text-sm text-red-600">Erro: {error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Voltar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-8 w-8 mx-auto text-gray-600" />
            <p className="mt-2 text-sm text-gray-600">Produto não encontrado</p>
            <Button onClick={() => router.back()} className="mt-4">
              Voltar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">
              Detalhes completos do produto base
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/admin/produtos/${productId}/editar`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Imagem e Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Imagem */}
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              <SafeImage
                src={product.image_url}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                {product.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              {product.product_categories && (
                <Badge variant="outline">
                  {product.product_categories.name}
                </Badge>
              )}
            </div>

            {/* Descrição */}
            <div>
              <h3 className="font-medium mb-2">Descrição</h3>
              <p className="text-muted-foreground">
                {product.description || 'Nenhuma descrição disponível'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SKU e NCM */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
                <p className="font-mono text-lg">{product.specifications?.sku || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">NCM</Label>
                <p className="font-mono text-lg">{product.specifications?.ncm || 'N/A'}</p>
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Preço Unitário
                </Label>
                <p className="text-2xl font-bold text-green-600">
                  R$ {product.base_price?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Pontos
                </Label>
                <p className="text-2xl font-bold text-blue-600">
                  {product.base_points_cost || 0} pts
                </p>
              </div>
            </div>

            {/* Preço por Quantidade */}
            {product.specifications?.price_quantity && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Preço por Quantidade
                </Label>
                <p className="text-lg font-semibold">
                  R$ {product.base_price?.toFixed(2) || '0.00'} por {product.specifications.price_quantity} unidades
                </p>
              </div>
            )}

            {/* Quantidade Mínima */}
            {product.specifications?.min_quantity && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Minus className="h-3 w-3" />
                  Quantidade Mínima
                </Label>
                <p className="text-lg font-semibold">
                  {product.specifications.min_quantity} unidades
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações de Produção e Estoque */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Estoque e Produção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estoque Disponível */}
            {product.specifications?.stock_available !== undefined && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estoque Disponível</Label>
                <p className="text-2xl font-bold text-blue-600">
                  {product.specifications.stock_available} unidades
                </p>
              </div>
            )}

            {/* Tempo de Produção */}
            {product.specifications?.production_time && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tempo de Produção
                </Label>
                <p className="text-lg font-semibold">
                  {product.specifications.production_time}
                </p>
              </div>
            )}

            {/* Material */}
            {product.specifications?.material && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Material</Label>
                <p className="text-lg font-semibold">
                  {product.specifications.material}
                </p>
              </div>
            )}

            {/* Fabricante */}
            {product.specifications?.manufacturer && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Factory className="h-3 w-3" />
                  Fabricante
                </Label>
                <p className="text-lg font-semibold">
                  {product.specifications.manufacturer}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Pricing (Faixas) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Preços por Quantidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BulkPricingEditor baseProductId={productId} />
          </CardContent>
        </Card>

        {/* Especificações Detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Especificações Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => {
                  // Pular campos já mostrados em outras seções
                  const skipKeys = ['sku', 'ncm', 'price_quantity', 'min_quantity', 'stock_available', 'production_time', 'material', 'manufacturer', 'original_status']
                  if (skipKeys.includes(key)) return null
                  
                  return (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma especificação detalhada disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">ID do Produto</Label>
              <p className="font-mono text-sm">{product.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
              <p className="text-sm">
                {new Date(product.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Última atualização</Label>
              <p className="text-sm">
                {new Date(product.updated_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
