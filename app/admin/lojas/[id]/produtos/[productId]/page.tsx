"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SafeImage } from '@/components/ui/safe-image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, Package, Loader2, Tag, DollarSign, Boxes } from 'lucide-react'
import { toast } from 'sonner'

interface StoreLite { id: string; name: string; company_id: string }
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  points_cost: number | null
  stock_quantity: number | null
  image_url: string | null
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

export default function ViewStoreProductPage() {
  const params = useParams() as { id?: string; productId?: string }
  const router = useRouter()
  const supabase = createClientComponentClient()
  const storeId = params?.id as string
  const productId = params?.productId as string

  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<StoreLite | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!storeId || !productId) return
    load()
  }, [storeId, productId])

  const load = async () => {
    try {
      setLoading(true)
      const { data: s } = await supabase
        .from('stores')
        .select('id, name, company_id')
        .eq('id', storeId)
        .single()
      if (!s) {
        toast.error('Loja não encontrada')
        router.back()
        return
      }
      setStore(s as StoreLite)

      const { data: p, error: perr } = await supabase
        .from('client_products')
        .select('*')
        .eq('id', productId)
        .eq('client_id', s.company_id)
        .single()
      if (perr || !p) {
        toast.error('Produto não encontrado para esta loja')
        return
      }
      setProduct(p as unknown as Product)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar produto')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando produto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product || !store) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p>Produto não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          {getStatusBadge(product.status)}
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/lojas/${storeId}/produtos/editar/${product.id}`)}
          >
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagem</CardTitle>
          </CardHeader>
          <CardContent>
            <SafeImage
              src={product.image_url}
              alt={product.name}
              size={600}
              className="aspect-square w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Loja</div>
              <div className="font-medium">{store.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Nome</div>
              <div className="font-semibold">{product.name}</div>
            </div>
            {product.description && (
              <div>
                <div className="text-sm text-gray-500">Descrição</div>
                <div className="text-gray-700">{product.description}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">R$ {product.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Pontos: {product.points_cost ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Estoque: {product.stock_quantity ?? 0}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

