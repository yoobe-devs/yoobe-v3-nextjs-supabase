'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  Plus,
  Search,
  Filter,
  Tag,
  DollarSign,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Star,
  ShoppingCart,
  Settings,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge as UIBadge } from '@/components/ui/badge'
import { useEffect as useEffect2, useState as useState2 } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProdutosPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sourceBudgetFilter = searchParams?.get('sourceBudgetId') || ''
  const [onlyThisBudget, setOnlyThisBudget] = useState(!!sourceBudgetFilter)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [sort, setSort] = useState<
    'created_desc' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  >('created_desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [addItems, setAddItems] = useState<
    Array<{
      id: string
      base_product_id: string
      name: string
      quantity: number
      notes?: string
    }>
  >([])
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null)

  const handleViewProduct = (productId: string) => {
    // Implementar visualização do produto
    console.log('Visualizar produto:', productId)
    // Aqui você pode abrir um modal ou navegar para uma página de detalhes
    alert(`Visualizando produto: ${productId}`)
  }

  const handleEditProduct = (productId: string) => {
    // Implementar edição do produto
    console.log('Editar produto:', productId)
    // Aqui você pode abrir um modal de edição ou navegar para uma página de edição
    alert(`Editando produto: ${productId}`)
  }

  const load = async () => {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      // Buscar produtos replicados da empresa do gestor
      const { data: user } = await supabase.auth.getUser()
      const clientId = user?.user?.user_metadata?.company_id
      if (!clientId) {
        setProducts([])
        setLoading(false)
        return
      }

      // Consulta simplificada sem JOINs problemáticos
      const { data, error } = await supabase
        .from('client_products')
        .select(
          '*, base_products ( id, name, base_price, base_points_cost, image_url )'
        )
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      let enriched = data || []

      // Enriquecer dados com informações básicas
      enriched = enriched.map((product: any) => ({
        ...product,
        product_categories: { id: null, name: '—' }, // Campo não existe na tabela
        is_active: product.status === 'active', // Mapear status para is_active
        stock: product.stock_quantity || 0, // Mapear stock_quantity para stock
        sales: 0, // Campo não existe, definir como 0
        isReplicated: !!product.base_product_id, // Determinar se é replicado
      }))

      setProducts(enriched)
    } catch (e) {
      console.error(e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])
  useEffect(() => {
    if (typeof window !== 'undefined')
      setCurrentBudgetId(
        window.localStorage.getItem('gestor.current_budget_id')
      )
  }, [])

  const filteredProducts = useMemo(() => {
    const term = (searchTerm || '').toLowerCase()
    return (products || []).filter((p: any) => {
      const name = (p.name || p.base_products?.name || '').toLowerCase()
      const cat = (p.product_categories?.name || '').toLowerCase()
      const matchesSearch = !term || name.includes(term) || cat.includes(term)
      const matchesCategory =
        selectedCategory === 'all' ||
        p.product_categories?.name === selectedCategory
      const status = p.is_active ? 'ativo' : 'inativo'
      const matchesStatus =
        selectedStatus === 'all' || status === selectedStatus
      const matchesSource =
        !sourceBudgetFilter ||
        !onlyThisBudget ||
        p.source_budget_id === sourceBudgetFilter
      return matchesSearch && matchesCategory && matchesStatus && matchesSource
    })
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStatus,
    sourceBudgetFilter,
    onlyThisBudget,
  ])

  const sorted = useMemo(() => {
    const arr = [...filteredProducts]
    switch (sort) {
      case 'name_asc':
        arr.sort((a: any, b: any) =>
          (a.name || a.base_products?.name || '').localeCompare(
            b.name || b.base_products?.name || ''
          )
        )
        break
      case 'name_desc':
        arr.sort((a: any, b: any) =>
          (b.name || b.base_products?.name || '').localeCompare(
            a.name || a.base_products?.name || ''
          )
        )
        break
      case 'price_asc':
        arr.sort(
          (a: any, b: any) =>
            (a.price || a.base_products?.base_price || 0) -
            (b.price || b.base_products?.base_price || 0)
        )
        break
      case 'price_desc':
        arr.sort(
          (a: any, b: any) =>
            (b.price || b.base_products?.base_price || 0) -
            (a.price || a.base_products?.base_price || 0)
        )
        break
      default:
        arr.sort(
          (a: any, b: any) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        )
    }
    return arr
  }, [filteredProducts, sort])

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return sorted.slice(start, start + perPage)
  }, [sorted, page, perPage])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'inativo':
        return 'bg-red-100 text-red-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4" />
      case 'inativo':
        return <XCircle className="h-4 w-4" />
      case 'pendente':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock < 20) return 'text-orange-600'
    return 'text-green-600'
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p: any) => {
      if (p.product_categories?.name) set.add(p.product_categories.name)
    })
    return Array.from(set)
  }, [products])

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openAddToBudget = () => {
    const list = products
      .filter((p: any) => selectedIds.has(p.id))
      .map((p: any) => ({
        id: p.id,
        base_product_id: p.base_product_id,
        name: p.name || p.base_products?.name || 'Produto',
        quantity: 1,
      }))
    setAddItems(list)
    setAddOpen(true)
  }

  const addToCurrentBudget = async () => {
    try {
      if (!addItems.length) {
        setAddOpen(false)
        return
      }
      const items = addItems.map(it => ({
        base_product_id: it.base_product_id,
        quantity: it.quantity,
      }))
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const headers: any = {
        'Content-Type': 'application/json',
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
      }
      const currentId =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('gestor.current_budget_id')
          : null
      if (currentId) {
        // merge with existing items
        const getRes = await fetch(`/api/gestor/orcamentos/${currentId}`)
        const getJs = await getRes.json().catch(() => ({}))
        if (getRes.ok && getJs?.budget) {
          const existing = (getJs.budget.budget_items || []).map((it: any) => ({
            base_product_id: it.base_product_id,
            quantity: it.quantity,
            custom_price: it.custom_price ?? undefined,
            custom_points_cost: it.custom_points_cost ?? undefined,
          }))
          const merged = existing.concat(items)
          const patchRes = await fetch(`/api/gestor/orcamentos/${currentId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ items: merged }),
          })
          if (!patchRes.ok)
            throw new Error('Falha ao adicionar ao orçamento atual')
          setCurrentBudgetId(currentId)
          window.location.href = `/gestor/orcamentos/${currentId}`
        } else {
          // fallback: create new
          const postRes = await fetch('/api/gestor/orcamentos', {
            method: 'POST',
            headers,
            body: JSON.stringify({ title: 'Orçamento atual', items }),
          })
          const postJs = await postRes.json().catch(() => ({}))
          if (!postRes.ok) throw new Error('Falha ao criar orçamento')
          if (postJs?.data?.budget?.id) {
            window.localStorage.setItem(
              'gestor.current_budget_id',
              postJs.data.budget.id
            )
            setCurrentBudgetId(postJs.data.budget.id)
            window.location.href = `/gestor/orcamentos/${postJs.data.budget.id}`
          }
        }
      } else {
        const postRes = await fetch('/api/gestor/orcamentos', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: 'Orçamento atual', items }),
        })
        const postJs = await postRes.json().catch(() => ({}))
        if (!postRes.ok) throw new Error('Falha ao criar orçamento')
        if (postJs?.data?.budget?.id) {
          window.localStorage.setItem(
            'gestor.current_budget_id',
            postJs.data.budget.id
          )
          setCurrentBudgetId(postJs.data.budget.id)
          window.location.href = `/gestor/orcamentos/${postJs.data.budget.id}`
        }
      }
      setAddOpen(false)
      setSelectedIds(new Set())
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Produtos da Empresa
          </h1>
          <p className="text-gray-600">
            Gerencie produtos replicados e ative-os para a loja.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Resgate v2 Preview Badge (somente leitura) */}
          <ResgateV2PreviewBadge />
          <Link href="/gestor/base-products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Fazer Orçamento
            </Button>
          </Link>
        </div>
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar ao orçamento atual</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {addItems.length === 0 && (
              <div className="text-sm text-gray-500">
                Nenhum produto selecionado.
              </div>
            )}
            {addItems.map((it, idx) => (
              <div
                key={it.id}
                className="grid grid-cols-6 items-center gap-2 text-sm"
              >
                <div className="col-span-3 truncate">{it.name}</div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={e => {
                      const x = [...addItems]
                      x[idx].quantity = Math.max(1, Number(e.target.value || 1))
                      setAddItems(x)
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Observações (opcional)"
                    onChange={e => {
                      const x = [...addItems]
                      x[idx].notes = e.target.value
                      setAddItems(x)
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={addToCurrentBudget}
                disabled={addItems.length === 0}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestão de Produtos
          </h1>
          <p className="text-gray-600">
            Gerencie produtos, estoque e preços da sua loja.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                {products.filter(p => p.status === 'active').length}
              </span>{' '}
              ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Replicados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.isReplicated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (products.filter(p => p.isReplicated).length /
                  products.length) *
                  100
              )}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + (p.sales || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média:{' '}
              {products.length > 0
                ? Math.round(
                    products.reduce((sum, p) => sum + (p.sales || 0), 0) /
                      products.length
                  )
                : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => (p.stock_quantity || 0) < 20).length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">
                {products.filter(p => (p.stock_quantity || 0) === 0).length}
              </span>{' '}
              sem estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>
            Encontre produtos específicos rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou categoria..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
          {(sourceBudgetFilter || currentBudgetId) && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-gray-600">
                Filtro do orçamento atual
              </span>
              <Button
                size="sm"
                variant={onlyThisBudget ? 'default' : 'outline'}
                onClick={() => {
                  setOnlyThisBudget(true)
                  const bid = sourceBudgetFilter || currentBudgetId || ''
                  if (bid) {
                    const params = new URLSearchParams(searchParams?.toString())
                    params.set('sourceBudgetId', bid)
                    router.push(`?${params.toString()}`)
                  }
                }}
              >
                Apenas deste orçamento
              </Button>
              <Button
                size="sm"
                variant={!onlyThisBudget ? 'default' : 'outline'}
                onClick={() => {
                  setOnlyThisBudget(false)
                  const params = new URLSearchParams(searchParams?.toString())
                  params.delete('sourceBudgetId')
                  const qs = params.toString()
                  router.push(qs ? `?${qs}` : '?')
                }}
              >
                Todos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos ({filteredProducts.length})</CardTitle>
          <CardDescription>Lista completa de produtos da loja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paged.map((product: any) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleSelected(product.id)}
                  />
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        product.image_url ||
                        product.base_products?.image_url ||
                        ''
                      }
                      alt={
                        product.name || product.base_products?.name || 'Produto'
                      }
                      className="w-full h-full object-cover"
                      onError={e => {
                        ;(e.currentTarget as HTMLImageElement).style.display =
                          'none'
                      }}
                    />
                    {!product.image_url &&
                      !product.base_products?.image_url && (
                        <Package className="h-8 w-8 text-blue-600" />
                      )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {product.name || product.base_products?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.product_categories?.name || '—'}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs text-gray-500">
                        <Tag className="h-3 w-3 mr-1" />
                        {product.base_products ? 'Replicado' : 'Original'}
                      </span>
                      {product.source_budget_id && (
                        <span className="flex items-center text-xs text-gray-500">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {product.source_budget_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      R${' '}
                      {(
                        product.price ||
                        product.base_products?.base_price ||
                        0
                      ).toLocaleString('pt-BR')}
                    </div>
                    <p className="text-xs text-gray-500">
                      {product.points_cost ||
                        product.base_products?.base_points_cost ||
                        0}{' '}
                      pontos
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${getStockColor(product.stock_quantity || 0)}`}
                    >
                      {product.stock_quantity || 0} unidades
                    </div>
                    <p className="text-xs text-gray-500">
                      Atualizado em{' '}
                      {new Date(
                        product.updated_at || product.created_at || Date.now()
                      ).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getStatusColor(
                          product.is_active ? 'ativo' : 'inativo'
                        )}
                      >
                        {getStatusIcon(product.is_active ? 'ativo' : 'inativo')}
                        {product.is_active ? 'ativo' : 'inativo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {product.id}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <p className="text-sm">Visualizar produto</p>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <p className="text-sm">Configurar produto</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selection Bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Selecionados: {selectedIds.size}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!currentBudgetId}
            onClick={() =>
              currentBudgetId &&
              (window.location.href = `/gestor/orcamentos/${currentBudgetId}`)
            }
          >
            Ver orçamento atual
          </Button>
          <Button
            variant="outline"
            disabled={selectedIds.size === 0}
            onClick={openAddToBudget}
          >
            Adicionar ao orçamento atual
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerenciar produtos e estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() =>
                alert('Funcionalidade de adicionar produto será implementada')
              }
            >
              <Plus className="h-6 w-6 mb-2" />
              <span>Adicionar Produto</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() =>
                (window.location.href = '/admin/produtos/catalogo-base')
              }
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Replicar Produtos</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => alert('Relatórios serão implementados em breve')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Relatórios</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => (window.location.href = '/gestor/configuracoes')}
            >
              <Settings className="h-6 w-6 mb-2" />
              <span>Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ResgateV2PreviewBadge() {
  const [enabled, setEnabled] = useState2<boolean | null>(null)
  useEffect2(() => {
    fetch('/api/gestor/store-flags/resgate-v2')
      .then(r => r.json())
      .then(j => setEnabled(Boolean(j?.data?.any_enabled)))
      .catch(() => setEnabled(null))
  }, [])
  if (enabled === null) return null
  return (
    <UIBadge
      variant={enabled ? 'default' : 'secondary'}
      title="Resgate v2 (preview)"
    >
      Resgate v2: {enabled ? 'Ativo' : 'Inativo'}
    </UIBadge>
  )
}
