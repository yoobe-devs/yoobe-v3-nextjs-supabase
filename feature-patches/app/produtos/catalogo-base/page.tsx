'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Eye,
  Trash2,
  Package,
  Tag,
  DollarSign,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { TagsManager } from '@/components/ui/tags-manager'

interface BaseProduct {
  id: string
  name: string
  description: string
  base_price: number
  base_points_cost: number
  sku: string
  ncm: string
  stock_quantity: number
  production_time: string
  material: string
  producer: string
  image_url: string
  status_fluxo: string
  created_at: string
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export default function CatalogoBasePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [products, setProducts] = useState<BaseProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importPage, setImportPage] = useState(1)
  const [importProgress, setImportProgress] = useState(0)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [clientQuery, setClientQuery] = useState('')
  const [replicateModal, setReplicateModal] = useState<{
    open: boolean
    product?: BaseProduct
  }>({ open: false })
  const [replicateMargin, setReplicateMargin] = useState<number>(0)
  const [replicateRounding, setReplicateRounding] = useState<
    'none' | 'ceil-0.50' | 'ceil-1.00'
  >('none')
  const [replicateCopyImages, setReplicateCopyImages] = useState<boolean>(true)
  const [replicating, setReplicating] = useState<boolean>(false)
  const [replicatedMap, setReplicatedMap] = useState<Record<string, boolean>>(
    {}
  )
  const [selectedBaseIds, setSelectedBaseIds] = useState<Set<string>>(new Set())
  const [batchMargin, setBatchMargin] = useState<number>(0)
  const [batchRounding, setBatchRounding] = useState<
    'none' | 'ceil-0.50' | 'ceil-1.00'
  >('none')
  const [batchCopyImages, setBatchCopyImages] = useState<boolean>(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagsManager, setShowTagsManager] = useState(false)
  const [editingProductTags, setEditingProductTags] = useState<string>('')

  // Carregar tags de um produto
  const fetchProductTags = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/tags`)
      if (response.ok) {
        const tags = await response.json()
        return tags.map((tag: any) => tag.id)
      }
    } catch (error) {
      console.error('Erro ao carregar tags do produto:', error)
    }
    return []
  }

  // Salvar tags de um produto
  const saveProductTags = async (productId: string, tagIds: string[]) => {
    try {
      const response = await fetch(`/api/products/${productId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds }),
      })
      if (response.ok) {
        toast.success('Tags salvas com sucesso!')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao salvar tags')
        return false
      }
    } catch (error) {
      console.error('Erro ao salvar tags:', error)
      toast.error('Erro ao salvar tags')
      return false
    }
  }

  // Buscar produtos base
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/base-products')
      if (!response.ok) throw new Error('Erro ao buscar produtos')

      const data = await response.json()
      setProducts(Array.isArray(data) ? data : data.products || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  // Buscar categorias
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Erro ao buscar categorias')

      const data = await response.json()
      setCategories(Array.isArray(data) ? data : data.categories || [])
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    }
  }

  // Buscar clientes (companies) para replicação
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')
      if (error) throw error
      setClients(data || [])
    } catch (e) {
      console.error('Erro ao buscar clientes:', e)
    }
  }

  // Buscar status de replicação para o cliente selecionado
  const fetchReplicationStatus = async (clientId: string) => {
    if (!clientId || products.length === 0) return
    try {
      const { data, error } = await supabase
        .from('client_products')
        .select('base_product_id')
        .eq('client_id', clientId)
      if (error) throw error
      const setIds = new Set((data || []).map((r: any) => r.base_product_id))
      const map: Record<string, boolean> = {}
      products.forEach(p => {
        map[p.id] = setIds.has(p.id)
      })
      setReplicatedMap(map)
    } catch (e) {
      console.error('Erro ao buscar status de replicação:', e)
      setReplicatedMap({})
    }
  }

  // Importar produtos do catálogo externo
  const importProducts = async () => {
    if (!importPage || importPage < 1) {
      toast.error('Página inválida')
      return
    }

    setImportLoading(true)
    setImportProgress(0)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Usuário não autenticado')

      const response = await fetch('/api/scraping/import-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          page: importPage,
          limit: 50,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro na importação')
      }

      const data = await response.json()
      toast.success(
        data.message ||
          `Importação concluída! ${data.imported ?? 0} produtos importados`
      )

      // Recarregar produtos
      await fetchProducts()
      setImportDialogOpen(false)
      setImportPage(1)
    } catch (error) {
      console.error('Erro na importação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro na importação')
    } finally {
      setImportLoading(false)
      setImportProgress(0)
    }
  }

  // Carregamento inicial
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Atualiza o status de replicação quando muda cliente ou lista de produtos
  useEffect(() => {
    if (selectedClient) fetchReplicationStatus(selectedClient)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, products])

  const openReplicate = (product: BaseProduct) => {
    if (!selectedClient) {
      toast.error('Selecione um cliente antes de replicar')
      return
    }
    // Usar os valores padrão do lote
    setReplicateMargin(batchMargin)
    setReplicateRounding(batchRounding)
    setReplicateCopyImages(batchCopyImages)
    setReplicateModal({ open: true, product })
  }

  const confirmReplicate = async () => {
    if (!replicateModal.product || !selectedClient) return
    try {
      setReplicating(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch(
        `/api/clients/${selectedClient}/replicate-product/${replicateModal.product.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            margin_pct: replicateMargin,
            rounding_rule: replicateRounding,
            copy_images: replicateCopyImages,
          }),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Erro ao replicar produto')
      }
      toast.success('Produto replicado com sucesso')
      setReplicateModal({ open: false })
      fetchReplicationStatus(selectedClient)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Falha ao replicar')
    } finally {
      setReplicating(false)
    }
  }

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const name = (product.name || '').toLowerCase()
    const desc = (product.description || '').toLowerCase()
    const sku = (
      (product as any).sku ||
      (product as any).specifications?.sku ||
      ''
    ).toLowerCase()
    const term = (searchTerm || '').toLowerCase()
    const matchesSearch =
      name.includes(term) || desc.includes(term) || sku.includes(term)

    const matchesCategory =
      selectedCategory === 'all' ||
      product.product_categories?.id === selectedCategory

    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Disponível
          </Badge>
        )
      case 'orcamento_aprovado':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Orçamento Aprovado
          </Badge>
        )
      case 'em_producao':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Em Produção
          </Badge>
        )
      case 'enviado_logistica':
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Enviado Logística
          </Badge>
        )
      case 'disponivel':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Disponível
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catálogo Base de Produtos
          </h1>
          <p className="text-gray-600">
            Gerencie o catálogo base de produtos disponíveis para orçamentos
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Cliente:</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar cliente..."
                value={clientQuery}
                onChange={e => setClientQuery(e.target.value)}
                className="h-9 w-48"
              />
              <select
                className="px-3 py-2 border rounded-md"
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
              >
                <option value="">Selecione um cliente</option>
                {clients
                  .filter(
                    c =>
                      !clientQuery ||
                      c.name.toLowerCase().includes(clientQuery.toLowerCase())
                  )
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar do Catálogo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importar Produtos</DialogTitle>
                <DialogDescription>
                  Importe produtos do catálogo externo (catalogo.yoobe.co)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="page">Página para importar</Label>
                  <Input
                    id="page"
                    type="number"
                    min="1"
                    value={importPage}
                    onChange={e => setImportPage(parseInt(e.target.value) || 1)}
                    placeholder="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Cada página contém até 50 produtos
                  </p>
                </div>
                <Button
                  onClick={importProducts}
                  disabled={importLoading}
                  className="w-full"
                >
                  {importLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Importar Produtos
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {selectedClient && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/clientes/${selectedClient}/produtos`)
              }
            >
              Ver replicados
            </Button>
          )}

          <Button
            onClick={() => router.push('/admin/produtos/novo')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Produtos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>
              <Tag className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R${' '}
                  {products
                    .reduce((sum, p) => sum + p.base_price, 0)
                    .toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    products.filter(
                      p =>
                        (p as any).status === 'active' ||
                        (p as any).status_fluxo === 'disponivel'
                    ).length
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory
                  ? 'Nenhum produto encontrado'
                  : 'Nenhum produto no catálogo'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece importando produtos do catálogo externo ou criando produtos manualmente.'}
              </p>
              {!searchTerm && !selectedCategory && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setImportDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Produtos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/produtos/novo')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Produto
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      SKU:{' '}
                      {(product as any).sku ||
                        (product as any).specifications?.sku ||
                        '—'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    {selectedClient && (
                      <Badge
                        variant={
                          replicatedMap[product.id] ? 'default' : 'secondary'
                        }
                      >
                        {replicatedMap[product.id]
                          ? 'Replicado'
                          : 'Não replicado'}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/produtos/${product.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/produtos/editar/${product.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        setEditingProductTags(product.id)
                        const tags = await fetchProductTags(product.id)
                        setSelectedTags(tags)
                        setShowTagsManager(true)
                      }}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openReplicate(product)}
                      disabled={!selectedClient}
                      title={
                        !selectedClient
                          ? 'Selecione um cliente'
                          : 'Replicar para cliente'
                      }
                    >
                      Replicar
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {product.image_url && (
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      R$ {product.base_price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.base_points_cost} pts
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {product.product_categories?.name || 'Sem categoria'}
                    </Badge>
                    {getStatusBadge(
                      (product as any).status ||
                        (product as any).status_fluxo ||
                        'active'
                    )}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Estoque: {product.stock_quantity}</div>
                    <div>Produção: {product.production_time}</div>
                    <div>Material: {product.material}</div>
                    <div>Fabricante: {product.producer}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ações em lote */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Selecionados: {selectedBaseIds.size}
        </div>
        <div className="flex gap-2">
          {selectedClient && (
            <Button
              variant="default"
              disabled={selectedBaseIds.size === 0}
              onClick={async () => {
                try {
                  const {
                    data: { session },
                  } = await supabase.auth.getSession()
                  const res = await fetch(
                    `/api/clients/${selectedClient}/replicate-products`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(session?.access_token
                          ? { Authorization: `Bearer ${session.access_token}` }
                          : {}),
                      },
                      body: JSON.stringify({
                        base_product_ids: Array.from(selectedBaseIds),
                        margin_pct: batchMargin,
                        rounding_rule: batchRounding,
                        copy_images: batchCopyImages,
                      }),
                    }
                  )
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok)
                    throw new Error(data?.error || 'Falha ao replicar em lote')
                  toast.success(
                    `Replicação em lote: ${data?.summary?.created || 0} criados, ${data?.summary?.existed || 0} existentes`
                  )
                  setSelectedBaseIds(new Set())
                  fetchReplicationStatus(selectedClient)
                } catch (e) {
                  console.error(e)
                  toast.error(
                    e instanceof Error
                      ? e.message
                      : 'Erro na replicação em lote'
                  )
                }
              }}
            >
              Replicar em lote
            </Button>
          )}
          {selectedClient && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/clientes/${selectedClient}/produtos`)
              }
            >
              Ver replicados
            </Button>
          )}
        </div>
      </div>

      {/* Parâmetros de replicação em lote */}
      {selectedClient && (
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <Label>Margem (%)</Label>
            <Input
              type="number"
              className="w-28"
              value={batchMargin}
              onChange={e => setBatchMargin(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Arredondamento</Label>
            <select
              className="px-3 py-2 border rounded-md"
              value={batchRounding}
              onChange={e => setBatchRounding(e.target.value as any)}
            >
              <option value="none">Sem arred.</option>
              <option value="ceil-0.50">Para 0,50</option>
              <option value="ceil-1.00">Para 1,00</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="batchCopy"
              type="checkbox"
              checked={batchCopyImages}
              onChange={e => setBatchCopyImages(e.target.checked)}
            />
            <Label htmlFor="batchCopy">Copiar imagens</Label>
          </div>
        </div>
      )}

      {/* Modal de Replicação */}
      <Dialog
        open={replicateModal.open}
        onOpenChange={open => setReplicateModal({ open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replicar produto</DialogTitle>
            <DialogDescription>
              Cliente: {clients.find(c => c.id === selectedClient)?.name || '—'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Margem (%)</Label>
              <Input
                type="number"
                value={replicateMargin}
                onChange={e => setReplicateMargin(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Arredondamento</Label>
              <select
                className="px-3 py-2 border rounded-md w-full"
                value={replicateRounding}
                onChange={e => setReplicateRounding(e.target.value as any)}
              >
                <option value="none">Sem arredondamento</option>
                <option value="ceil-0.50">Arredondar para 0,50</option>
                <option value="ceil-1.00">Arredondar para 1,00</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="copyImages"
                type="checkbox"
                checked={replicateCopyImages}
                onChange={e => setReplicateCopyImages(e.target.checked)}
              />
              <Label htmlFor="copyImages">Copiar imagens</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReplicateModal({ open: false })}
              >
                Cancelar
              </Button>
              <Button onClick={confirmReplicate} disabled={replicating}>
                {replicating ? 'Replicando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para gerenciar tags */}
      <Dialog open={showTagsManager} onOpenChange={setShowTagsManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Tags do Produto</DialogTitle>
            <DialogDescription>
              Selecione as tags que se aplicam a este produto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <TagsManager
              mode="select"
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTagsManager(false)
                  setSelectedTags([])
                  setEditingProductTags('')
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (editingProductTags) {
                    const success = await saveProductTags(
                      editingProductTags,
                      selectedTags
                    )
                    if (success) {
                      setShowTagsManager(false)
                      setSelectedTags([])
                      setEditingProductTags('')
                    }
                  }
                }}
              >
                Salvar Tags
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
