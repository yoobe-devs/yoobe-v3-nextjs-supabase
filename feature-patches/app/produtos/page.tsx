'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  Loader2,
  AlertCircle,
  Download,
  RefreshCw,
  Database,
  Settings,
  Import,
  Grid3X3,
  List,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function ProdutosPage() {
  const router = useRouter()
  const pathname = usePathname()
  const urlParams = useSearchParams()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [importing, setImporting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showImportModal, setShowImportModal] = useState(false)
  const [page, setPage] = useState<number>(() =>
    parseInt(urlParams.get('page') || '1')
  )
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const fromQs = Number(urlParams.get('limit') || 0)
      const v =
        fromQs ||
        Number(localStorage.getItem('admin_base_products_page_size') || '12')
      return [12, 24, 48].includes(v) ? v : 12
    }
    return 12
  })
  const [sort, setSort] = useState<
    'relevance' | 'name' | 'price_asc' | 'price_desc' | 'newest'
  >(() => {
    const fromQs = (urlParams.get('sort') as any) || null
    if (fromQs) return fromQs
    if (typeof window !== 'undefined') {
      return (
        (localStorage.getItem('admin_base_products_sort') as any) || 'relevance'
      )
    }
    return 'relevance'
  })

  // Verificar se é admin (aceita admin, admin_global, superadmin)
  useEffect(() => {
    const role = user?.user_metadata?.role
    const allowed = ['admin', 'admin_global', 'superadmin']
    if (user && (!role || !allowed.includes(role))) {
      router.push('/admin/dashboard')
      toast.error(
        'Acesso negado - Apenas administradores podem acessar esta página'
      )
    }
  }, [user, router])

  // Carregar produtos
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/base-products')
      const data = await response.json()

      if (response.ok) {
        setProducts(data)
      } else {
        throw new Error(data.error || 'Erro ao carregar produtos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleImportCatalog = async (
    importAllCategories = false,
    category?: string
  ) => {
    try {
      setImporting(true)

      // Obter sessão atual
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Usuário não autenticado')
      }

      const response = await fetch('/api/scraping/import-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          page: 1,
          limit: 50,
          category,
          importAllCategories,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        await fetchProducts() // Recarregar produtos
        setShowImportModal(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erro na importação:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao importar catálogo'
      )
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return

    try {
      const response = await fetch(`/api/base-products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Produto excluído com sucesso')
        await fetchProducts() // Recarregar produtos
      } else {
        throw new Error('Erro ao excluir produto')
      }
    } catch (error) {
      toast.error('Erro ao excluir produto')
    }
  }

  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      if (
        !product.name.toLowerCase().includes(searchLower) &&
        !product.description?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    if (filterCategory && product.category_id) {
      const category = product.product_categories
      if (!category || category.name !== filterCategory) return false
    }

    return true
  })

  const categories = Array.from(
    new Set(products.map(p => p.product_categories?.name).filter(Boolean))
  )

  // sorting
  const sorted = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '')
      case 'price_asc':
        return (a.base_price || 0) - (b.base_price || 0)
      case 'price_desc':
        return (b.base_price || 0) - (a.base_price || 0)
      case 'newest':
        return (
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
        )
      default:
        return 0
    }
  })

  const total = sorted.length
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(total, page * pageSize)
  const pageItems = sorted.slice(startIndex, endIndex)

  // Sync URL when sort/page/limit change
  useEffect(() => {
    const params = new URLSearchParams(urlParams.toString())
    params.set('page', String(page))
    params.set('limit', String(pageSize))
    if (sort) params.set('sort', sort)
    else params.delete('sort')
    router.replace(`${pathname}?${params.toString()}`)
  }, [page, pageSize, sort])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Carregando produtos...</p>
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
            <Button onClick={fetchProducts} className="mt-4">
              Tentar novamente
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
        <div>
          <h1 className="text-3xl font-bold">Catálogo Base de Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o repositório central de produtos disponíveis para todas as
            lojas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/produtos/catalogo-base')}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Catálogo Base
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            disabled={importing}
            className="flex items-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Import className="h-4 w-4" />
                Importar Catálogo
              </>
            )}
          </Button>
          <Button
            onClick={() => router.push('/admin/produtos/novo')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total de Produtos
                </p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Importados</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.specifications?.sku).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={fetchProducts} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="min-w-[11rem]">
                <Select
                  value={sort}
                  onValueChange={v => {
                    const val = v as any
                    setSort(val)
                    setPage(1)
                    if (typeof window !== 'undefined')
                      localStorage.setItem('admin_base_products_sort', val)
                  }}
                >
                  <SelectTrigger className="px-3 py-2 text-sm">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Lista</SelectItem>
                    <SelectItem value="name">🔤 Nome (A–Z)</SelectItem>
                    <SelectItem value="price_asc">⬆️ Preço</SelectItem>
                    <SelectItem value="price_desc">⬇️ Preço</SelectItem>
                    <SelectItem value="newest">🕒 Recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <SafeImage
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      product.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">
                        R$ {product.base_price?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-muted-foreground">
                        {product.base_points_cost || 0} pts
                      </p>
                    </div>
                    {product.product_categories && (
                      <Badge variant="outline" className="text-xs">
                        {product.product_categories.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/produtos/${product.id}`)
                      }
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/produtos/editar/${product.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {pageItems.map(product => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 relative">
                    <SafeImage
                      src={product.image_url}
                      alt={product.name}
                      className="object-cover w-full h-full rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.product_categories?.name || 'Sem categoria'}
                      </Badge>
                      <Badge
                        variant={
                          product.status === 'active' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {product.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {product.base_price?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.base_points_cost || 0} pts
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/produtos/${product.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/produtos/editar/${product.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          {total === 0
            ? '0 resultados'
            : `Exibindo ${startIndex + 1}–${endIndex} de ${total} resultados`}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 hidden sm:inline">
              Itens por página
            </span>
            <select
              className="border rounded px-2 py-1"
              value={pageSize}
              onChange={e => {
                const v = Number(e.target.value)
                setPageSize(v)
                if (typeof window !== 'undefined')
                  localStorage.setItem(
                    'admin_base_products_page_size',
                    String(v)
                  )
                setPage(1)
              }}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
          {(() => {
            const last = Math.max(1, Math.ceil(total / pageSize))
            return (
              <div className="flex items-center gap-3">
                <button
                  className="underline disabled:text-gray-400"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                >
                  Primeira
                </button>
                <button
                  className="underline disabled:text-gray-400"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {last}
                </span>
                <button
                  className="underline disabled:text-gray-400"
                  disabled={page >= last}
                  onClick={() => setPage(p => Math.min(last, p + 1))}
                >
                  Próxima
                </button>
                <button
                  className="underline disabled:text-gray-400"
                  disabled={page >= last}
                  onClick={() => setPage(last)}
                >
                  Última
                </button>
              </div>
            )
          })()}
        </div>
      </div>

      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterCategory
                ? 'Tente ajustar os filtros de busca'
                : 'Comece importando produtos do catálogo externo'}
            </p>
            {!searchQuery && !filterCategory && (
              <Button onClick={() => setShowImportModal(true)}>
                <Import className="h-4 w-4 mr-2" />
                Importar Catálogo
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Importar Catálogo</CardTitle>
              <CardDescription>
                Escolha como deseja importar os produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleImportCatalog(true)}
                disabled={importing}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar Todas as Categorias
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ou importe uma categoria específica:
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleImportCatalog(false, '10')}
                  disabled={importing}
                  size="sm"
                >
                  Escritório
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImportCatalog(false, '4')}
                  disabled={importing}
                  size="sm"
                >
                  Cool Swag
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImportCatalog(false, '101')}
                  disabled={importing}
                  size="sm"
                >
                  Canecas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImportCatalog(false, '83')}
                  disabled={importing}
                  size="sm"
                >
                  Mochilas
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowImportModal(false)}
                disabled={importing}
                className="w-full"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
