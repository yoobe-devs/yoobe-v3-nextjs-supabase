"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Store,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url: string
  status: 'active' | 'inactive'
  category_id: string
  company_id: string
  created_at: string
  updated_at: string
}

interface Store {
  id: string
  name: string
  company_id: string
  company?: {
    name: string
  }
}

export default function StoreProductsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const supabase = createClientComponentClient()

  const statuses = ["all", "active", "inactive"]

  useEffect(() => {
    fetchStore()
    fetchProducts()
  }, [storeId])

  const fetchStore = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          company:companies(name)
        `)
        .eq('id', storeId)
        .single()

      if (error) {
        console.error('Erro ao buscar loja:', error)
        toast.error('Erro ao carregar dados da loja')
        return
      }

      setStore(data)
    } catch (error) {
      console.error('Erro ao buscar loja:', error)
      toast.error('Erro ao carregar dados da loja')
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Primeiro buscar a loja para obter o company_id
      const { data: storeData } = await supabase
        .from('stores')
        .select('company_id')
        .eq('id', storeId)
        .single()

      if (!storeData) {
        toast.error('Loja não encontrada')
        return
      }

      // Buscar produtos da empresa (client_products)
      const { data, error } = await supabase
        .from('client_products')
        .select('*')
        .eq('client_id', storeData.company_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        toast.error('Erro ao carregar produtos')
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/lojas/${storeId}/produtos/${productId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao excluir produto')
      }

      toast.success('Produto excluído com sucesso')
      fetchProducts() // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir produto')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando produtos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Produtos da Loja: {store?.name}
          </h1>
          <p className="text-gray-600">
            Empresa: {store?.company?.name}
          </p>
        </div>
        <Button onClick={() => router.push(`/admin/lojas/${storeId}/produtos/novo`)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === "all" ? "Todos os Status" : 
                 status === "active" ? "Ativo" :
                 status === "inactive" ? "Inativo" : status}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <SafeImage
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(product.status)}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Preço:</span>
                  <span className="font-medium">R$ {product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pontos:</span>
                  <span className="font-medium">{product.points_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estoque:</span>
                  <span className="font-medium">{product.stock_quantity}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/admin/lojas/${storeId}/produtos/${product.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/admin/lojas/${storeId}/produtos/editar/${product.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou criar um novo produto</p>
        </div>
      )}

      {/* Summary */}
      {filteredProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total de Produtos</p>
                <p className="font-semibold">{filteredProducts.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Produtos Ativos</p>
                <p className="font-semibold">{filteredProducts.filter(p => p.status === 'active').length}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor Total</p>
                <p className="font-semibold">R$ {filteredProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Total de Pontos</p>
                <p className="font-semibold">{filteredProducts.reduce((sum, p) => sum + p.points_cost, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
