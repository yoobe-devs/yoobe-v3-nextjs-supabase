'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CatalogToolbar,
  type CatalogQuery,
} from '@/components/gestor/catalog/CatalogToolbar'
import {
  CatalogGrid,
  type BaseProductListItem,
} from '@/components/gestor/catalog/CatalogGrid'
import { ProductSelectSheet } from '@/components/gestor/catalog/ProductSelectSheet'
import {
  Plus,
  Edit,
  Trash2,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface BudgetItem {
  id?: string
  base_product_id: string
  quantity: number
  unit_price: number
  custom_price?: number
  custom_points_cost?: number
  notes?: string
  base_products?: {
    id: string
    name: string
    base_price: number
  }
}

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  submitted_at?: string
  budget_items: BudgetItem[]
}

interface Product {
  id: string
  name: string
  base_price: number
  base_points_cost?: number
  description?: string
  image_url?: string
  category_id?: string
  product_categories?: {
    name: string
  }
}

export default function GestorOrcamentosPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [replicationStatus, setReplicationStatus] = useState<
    Record<
      string,
      { total: number; replicated: number; activated: number; drafted: number }
    >
  >({})
  const [checkoutV2Enabled, setCheckoutV2Enabled] = useState(false)
  const [activeTab, setActiveTab] = useState<'budgets' | 'catalog'>('budgets')
  const [catLoading, setCatLoading] = useState(false)

  // Nova experiência: Galeria do Catálogo Base (pré-seleção)
  const [catQuery, setCatQuery] = useState<CatalogQuery>({ sort: 'relevance' })
  const [catPage, setCatPage] = useState(1)
  const [catPageSize, setCatPageSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = Number(localStorage.getItem('gestor_catalog_page_size') || '24')
      return [12, 24, 48].includes(v) ? v : 24
    }
    return 24
  })
  const [catData, setCatData] = useState<{
    items: BaseProductListItem[]
    total: number
  } | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selId, setSelId] = useState<string | null>(null)
  const [selected, setSelected] = useState<
    Record<
      string,
      {
        id: string
        name: string
        price: number
        image?: string | null
        qty: number
      }
    >
  >({})
  const [newTitle, setNewTitle] = useState('Orçamento (Catálogo Base)')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData()
      fetchCheckoutSettings()
    }, 100)
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('Timeout de segurança - forçando carregamento')
        setLoading(false)
      }
    }, 10000)
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(safetyTimeout)
    }
  }, [])

  const fetchCheckoutSettings = async () => {
    try {
      const response = await fetch('/api/gestor/settings/checkout')
      if (response.ok) {
        const data = await response.json()
        setCheckoutV2Enabled(data.checkout_v2_enabled)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do checkout:', error)
    }
  }

  // Carregar catálogo base (lista paginada para galeria)
  useEffect(() => {
    (async () => {
      const params = new URLSearchParams()
      if (catQuery.q) params.set('q', catQuery.q)
      if (catQuery.minPrice) params.set('minPrice', String(catQuery.minPrice))
      if (catQuery.maxPrice) params.set('maxPrice', String(catQuery.maxPrice))
      if (catQuery.hasPoints) params.set('hasPoints', '1')
      if (catQuery.category) params.set('category', catQuery.category)
      if (catQuery.tag) params.set('tag', catQuery.tag)
      if (catQuery.sort) params.set('sort', catQuery.sort)
      params.set('page', String(catPage))
      params.set('pageSize', String(catPageSize))
      try {
        const r = await fetch(`/api/catalog/base-products?${params.toString()}`)
        const j = await r.json()
        setCatData({ items: j?.items || [], total: j?.total || 0 })
      } catch (e) {
        console.error('Falha ao carregar catálogo base', e)
        setCatData({ items: [], total: 0 })
      }
    })()
  }, [JSON.stringify(catQuery), catPage, catPageSize])

  const loadData = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Usuário não autenticado')
        setLoading(false)
        return
      }
      const companyId = user.user_metadata?.company_id
      if (!companyId) {
        toast.error('ID da empresa não encontrado')
        setLoading(false)
        return
      }
      try {
        const budgetsResponse = await fetch('/api/gestor/budgets')
        if (budgetsResponse.ok) {
          const budgetsData = await budgetsResponse.json()
          setBudgets(budgetsData.data || [])
        } else {
          console.error('Erro ao carregar orçamentos:', budgetsResponse.status)
          setBudgets([])
        }
      } catch (error) {
        console.error('Erro ao carregar orçamentos:', error)
        setBudgets([])
      }
      try {
        const productsResponse = await supabase
          .from('base_products')
          .select(
            `
            id, 
            name, 
            base_price, 
            base_points_cost,
            description,
            image_url,
            category_id,
            product_categories (name)
          `
          )
          .order('name')
          .limit(50)
        if (productsResponse.data) {
          setProducts(productsResponse.data as unknown as Product[])
        } else {
          console.error('Erro ao carregar produtos:', productsResponse.error)
          setProducts([])
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        setProducts([])
      }
      setTimeout(async () => {
        try {
          const arr = budgets
          const statuses: Record<
            string,
            {
              total: number
              replicated: number
              activated: number
              drafted: number
            }
          > = {}
          const limitedBudgets = arr.slice(0, 5)
          await Promise.all(
            limitedBudgets.map(async b => {
              try {
                const r = await fetch(`/api/gestor/orcamentos/${b.id}/status`)
                const j = await r.json().catch(() => ({}))
                if (r.ok) {
                  statuses[b.id] = {
                    total: j.total || 0,
                    replicated: j.replicated || 0,
                    activated: j.activated || 0,
                    drafted: j.drafted || 0,
                  }
                }
              } catch {
                // Ignore errors
              }
            })
          )
          setReplicationStatus(statuses)
        } catch (error) {
          console.error('Erro ao carregar status de replicação:', error)
        }
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      (statusFilter || 'all') === 'all' || budget.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const submitBudget = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/gestor/budgets/${budgetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'submitted' }),
      })
      if (response.ok) {
        toast.success('Orçamento enviado com sucesso!')
        loadData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao enviar orçamento')
      }
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error)
      toast.error('Erro ao enviar orçamento')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const openCreateModal = () => {
    const el = document.getElementById('novo-orcamento-galeria')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteBudget = async (budget: Budget) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return
    try {
      const response = await fetch(`/api/gestor/budgets/${budget.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success('Orçamento excluído com sucesso')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao excluir orçamento')
      }
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)
      toast.error('Erro ao excluir orçamento')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando orçamentos...</p>
            <p className="text-sm text-gray-500 mt-2">
              Se esta tela persistir, tente recarregar a página
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header simplificado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">
            Gerencie seus orçamentos e solicitações
          </p>
        </div>
        <div className="flex items-center gap-4">
          {checkoutV2Enabled && (
            <Badge className="bg-green-100 text-green-800">
              Checkout v2 Ativo
            </Badge>
          )}
          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'budgets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Orçamentos
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'catalog'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Catálogo
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'budgets' && (
        <>
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter || 'all'}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map(budget => (
          <Card key={budget.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {budget.title}
                  {(() => {
                    const st = replicationStatus[budget.id]
                    if (st && st.total > 0 && st.replicated === st.total) {
                      return (
                        <Badge className="bg-blue-100 text-blue-800">
                          Replicado
                        </Badge>
                      )
                    }
                    return null
                  })()}
                </CardTitle>
                {getStatusBadge(budget.status)}
              </div>
              <CardDescription>
                {budget.description || 'Sem descrição'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>
                  R${' '}
                  {(budget.total_amount || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{budget.budget_items.length} itens</span>
              </div>
              {(() => {
                const st = replicationStatus[budget.id]
                if (!st) return null
                return (
                  <div className="text-xs text-gray-700 flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Replicados: {st.replicated}/{st.total}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Ativos: {st.activated}
                    </span>
                    {st.drafted > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        Rascunhos: {st.drafted}
                      </span>
                    )}
                  </div>
                )
              })()}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(budget.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                {budget.status === 'draft' && (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => submitBudget(budget.id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Submeter
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60">
                        <p className="text-sm">
                          Enviar orçamento para aprovação
                        </p>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBudget(budget)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <p className="text-sm">Excluir orçamento</p>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
                {budget.status === 'approved' && (
                  <>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          const r = await fetch(
                            `/api/gestor/orcamentos/${budget.id}/replicate`,
                            { method: 'POST' }
                          )
                          const j = await r.json().catch(() => ({}))
                          if (!r.ok)
                            throw new Error(j?.error || 'Falha na replicação')
                          toast.success(
                            `Replicação: ${j.created || 0} criados, ${
                              j.existed || 0
                            } já existiam`
                          )
                          const s = await fetch(
                            `/api/gestor/orcamentos/${budget.id}/status`
                          )
                          const sj = await s.json().catch(() => ({}))
                          if (s.ok)
                            setReplicationStatus(prev => ({
                              ...prev,
                              [budget.id]: {
                                total: sj.total || 0,
                                replicated: sj.replicated || 0,
                                activated: sj.activated || 0,
                                drafted: sj.drafted || 0,
                              },
                            }))
                        } catch (e: any) {
                          toast.error(e?.message || 'Erro ao replicar')
                        }
                      }}
                    >
                      Replicar p/ Loja
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={
                        (replicationStatus[budget.id]?.drafted || 0) === 0
                      }
                      onClick={async () => {
                        try {
                          const r = await fetch(
                            `/api/gestor/orcamentos/${budget.id}/activate`,
                            { method: 'POST' }
                          )
                          const j = await r.json().catch(() => ({}))
                          if (!r.ok)
                            throw new Error(j?.error || 'Falha ao ativar')
                          toast.success(`Produtos ativados: ${j.updated || 0}`)
                          const s = await fetch(
                            `/api/gestor/orcamentos/${budget.id}/status`
                          )
                          const sj = await s.json().catch(() => ({}))
                          if (s.ok)
                            setReplicationStatus(prev => ({
                              ...prev,
                              [budget.id]: {
                                total: sj.total || 0,
                                replicated: sj.replicated || 0,
                                activated: sj.activated || 0,
                                drafted: sj.drafted || 0,
                              },
                            }))
                        } catch (e: any) {
                          toast.error(e?.message || 'Erro ao ativar')
                        }
                      }}
                    >
                      Ativar Replicados
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/gestor/produtos?sourceBudgetId=${budget.id}`
                        )
                      }
                    >
                      Ver apenas replicados
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/gestor/produtos')}
                    >
                      Revisar Produtos
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBudgets.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum orçamento encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando seu primeiro orçamento'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Orçamento
            </Button>
          )}
        </div>
      )}

      {/* Nova seção: criar orçamento via Galeria do Catálogo Base */}
      <Card id="novo-orcamento-galeria">
        <CardHeader>
          <CardTitle>Criar Orçamento — Galeria do Catálogo Base</CardTitle>
          <CardDescription>
            Selecione produtos do catálogo base e crie um orçamento com a
            pré-seleção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna esquerda: Galeria */}
            <div className="lg:col-span-2 space-y-4">
              <CatalogToolbar
                value={catQuery}
                onChange={v => {
                  setCatPage(1)
                  setCatQuery(v)
                }}
              />
              <CatalogGrid
                items={(catData?.items || []) as any}
                onSelect={pid => {
                  setSelId(pid)
                  setSheetOpen(true)
                }}
              />
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  {(() => {
                    const total = catData?.total || 0
                    const perPage = catPageSize
                    if (total === 0) return '0 resultados'
                    const start = (catPage - 1) * perPage + 1
                    const end = Math.min(total, catPage * perPage)
                    return `Exibindo ${start}–${end} de ${total} resultados`
                  })()}
                </div>
                <div className="flex items-center gap-4">
                  {/* Page size */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 hidden sm:inline">
                      Itens por página
                    </span>
                    <select
                      className="border rounded px-2 py-1"
                      value={catPageSize}
                      onChange={e => {
                        const v = Number(e.target.value)
                        setCatPageSize(v)
                        if (typeof window !== 'undefined')
                          localStorage.setItem(
                            'gestor_catalog_page_size',
                            String(v)
                          )
                        setCatPage(1)
                      }}
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                  {/* Pagination controls */}
                  {(() => {
                    const total = catData?.total || 0
                    const perPage = catPageSize
                    const last = Math.max(1, Math.ceil(total / perPage))
                    return (
                      <div className="flex items-center gap-3">
                        <button
                          className="underline disabled:text-gray-400"
                          disabled={catPage <= 1}
                          onClick={() => setCatPage(1)}
                        >
                          Primeira
                        </button>
                        <button
                          className="underline disabled:text-gray-400"
                          disabled={catPage <= 1}
                          onClick={() => setCatPage(p => Math.max(1, p - 1))}
                        >
                          Anterior
                        </button>
                        <span>
                          Página {catPage} de {last}
                        </span>
                        <button
                          className="underline disabled:text-gray-400"
                          disabled={catPage >= last}
                          onClick={() => setCatPage(p => Math.min(last, p + 1))}
                        >
                          Próxima
                        </button>
                        <button
                          className="underline disabled:text-gray-400"
                          disabled={catPage >= last}
                          onClick={() => setCatPage(last)}
                        >
                          Última
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Coluna direita: Seleção/Criação */}
            <div className="lg:col-span-1 space-y-3">
              <div>
                <Label className="text-sm">Título</Label>
                <Input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Descrição</Label>
                <Textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                Selecionados: {Object.keys(selected).length}
              </div>
              <div className="space-y-2 max-h-72 overflow-auto border rounded p-2">
                {Object.values(selected).length === 0 && (
                  <div className="text-xs text-gray-500">
                    Nenhum produto selecionado ainda
                  </div>
                )}
                {Object.values(selected).map(it => (
                  <div
                    key={it.id}
                    className="flex items-center gap-2 border rounded p-2"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="truncate text-sm font-medium"
                        title={it.name}
                      >
                        {it.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        R$ {it.price.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      className="w-16"
                      value={it.qty}
                      onChange={e => {
                        const qty = Math.max(1, parseInt(e.target.value || '1'))
                        setSelected(prev => ({
                          ...prev,
                          [it.id]: { ...prev[it.id], qty },
                        }))
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(prev => {
                          const n = { ...prev }
                          delete n[it.id]
                          return n
                        })
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-right">
                Total R$:{' '}
                {Object.values(selected)
                  .reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <Button
                onClick={async () => {
                  if (!newTitle.trim()) {
                    toast.error('Informe um título')
                    return
                  }
                  const items = Object.values(selected).map(it => ({
                    product_id: it.id,
                    quantity: it.qty,
                    unit_price: it.price,
                  }))
                  if (items.length === 0) {
                    toast.error('Selecione pelo menos um produto')
                    return
                  }
                  try {
                    const r = await fetch('/api/gestor/budgets', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({
                        title: newTitle,
                        description: newDesc,
                        items,
                      }),
                    })
                    const j = await r.json().catch(() => ({}))
                    if (!r.ok)
                      throw new Error(j?.error || 'Falha ao criar orçamento')
                    toast.success('Orçamento criado!')
                    setSelected({})
                    setNewDesc('')
                    setNewTitle('Orçamento (Catálogo Base)')
                    await loadData()
                  } catch (e: any) {
                    toast.error(e?.message || 'Erro ao criar orçamento')
                  }
                }}
              >
                Criar Orçamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductSelectSheet
        productId={selId}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={({ baseProductId, qty, unitPrice }) => {
          const prod = (catData?.items || []).find(i => i.id === baseProductId)
          const name = prod?.name || 'Produto'
          const price = unitPrice || prod?.priceFrom || 0
          const image = (prod as any)?.thumbnail || undefined
          setSelected(prev => ({
            ...prev,
            [baseProductId]: {
              id: baseProductId,
              name,
              price: Number(price) || 0,
              image,
              qty: Math.max(1, qty || 1),
            },
          }))
        }}
      />

      {activeTab === 'catalog' && (
        <div className="mt-6">
          <CatalogToolbar value={catQuery} onChange={setCatQuery} />
          <CatalogGrid
            items={(catData?.items || []) as any}
            onSelect={id => {
              setSelId(id)
              setSheetOpen(true)
            }}
          />
        </div>
      )}

      {/* Modal removido - usando apenas galeria para criação */}
    </div>
  )
}
