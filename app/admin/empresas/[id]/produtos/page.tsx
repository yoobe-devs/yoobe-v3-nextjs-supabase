'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SafeImage } from '@/components/ui/safe-image'
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Loader2,
  DollarSign,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  final_sku: string
  status: string
  created_at: string
  updated_at: string
  image_url?: string
}

interface Company {
  id: string
  name: string
  email: string
}

export default function CompanyProductsPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (id) {
      loadCompanyData()
    }
  }, [id])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies/${id}`)
      const data = await response.json()

      if (response.ok) {
        setCompany(data.company)
        setProducts(data.company.products || [])
      } else {
        toast.error('Erro ao carregar dados da empresa')
        router.push('/admin/empresas')
      }
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
      toast.error('Erro ao carregar dados da empresa')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.final_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || product.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'liberado':
        return <Badge className="bg-blue-100 text-blue-800">Liberado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/clients/${id}/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Produto excluído com sucesso!')
        loadCompanyData() // Recarregar dados
      } else {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao excluir produto')
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir produto'
      )
    }
  }

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `/api/clients/${id}/products/${productId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.ok) {
        toast.success('Status do produto atualizado!')
        loadCompanyData() // Recarregar dados
      } else {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar status'
      )
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando produtos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Empresa não encontrada
          </h2>
          <Button onClick={() => router.push('/admin/empresas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Empresas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/empresas')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Produtos - {company.name}
            </h1>
            <p className="text-gray-600">
              Gerenciar produtos replicados para esta empresa
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/admin/empresas/${id}/produtos/novo`)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Ativos
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Rascunho</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativo</option>
          <option value="draft">Rascunho</option>
          <option value="inactive">Inativo</option>
          <option value="liberado">Liberado</option>
        </select>
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SafeImage
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    fallback={
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    }
                  />
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm">
                      SKU: {product.final_sku}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(product.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">
                  R$ {product.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(product.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/empresas/${id}/produtos/${product.id}`)
                  }
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/admin/empresas/${id}/produtos/${product.id}/edit`
                    )
                  }
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>

              {/* Status Actions */}
              <div className="flex gap-1">
                {product.status !== 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleStatusChange(product.id, 'active')}
                  >
                    Ativar
                  </Button>
                )}
                {product.status !== 'inactive' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusChange(product.id, 'inactive')}
                  >
                    Inativar
                  </Button>
                )}
                {product.status !== 'draft' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    onClick={() => handleStatusChange(product.id, 'draft')}
                  >
                    Rascunho
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Esta empresa ainda não possui produtos replicados'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              onClick={() => router.push(`/admin/empresas/${id}/produtos/novo`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          )}
        </div>
      )}
    </div>
  )
}










