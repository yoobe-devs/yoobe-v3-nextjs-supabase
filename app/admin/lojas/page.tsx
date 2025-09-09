'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
import { SafeImage } from '@/components/ui/safe-image'
import {
  Store,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  Package,
  ShoppingCart,
  Globe,
  Loader2,
  List,
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign,
} from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  domain: string
  status: 'active' | 'inactive' | 'maintenance'
  logo_url?: string
  created_at: string
  companies: { id: string; name: string }
  users_count: number
  products_count: number
  orders_count: number
  revenue: number
}

export default function AdminLojasPage() {
  const router = useRouter()
  const pathname = usePathname()
  const urlParams = useSearchParams()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>(
    () => urlParams.get('search') || ''
  )
  const [status, setStatus] = useState<string>(
    () => urlParams.get('status') || ''
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = Number(localStorage.getItem('admin_stores_page_size') || '12')
      return [12, 24, 48].includes(v) ? v : 12
    }
    return 12
  })
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState<string>(() => {
    const fromQs = urlParams.get('sort')
    if (fromQs) return fromQs
    if (typeof window !== 'undefined')
      return localStorage.getItem('admin_stores_sort') || 'created_at_desc'
    return 'created_at_desc'
  })

  // Carregar lojas apenas uma vez
  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams(urlParams.toString())
    params.set('page', String(page))
    params.set('limit', String(pageSize))
    if (search) params.set('search', search)
    else params.delete('search')
    if (status) params.set('status', status)
    else params.delete('status')
    router.replace(`${pathname}?${params.toString()}`)
  }, [page, pageSize, search, status, sort])

  useEffect(() => {
    const fetchStores = async () => {
      try {
        console.log('🔄 Iniciando carregamento de lojas...')
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(pageSize))
        if (search) params.set('search', search)
        if (status) params.set('status', status)
        const [by, order] = (sort || 'created_at_desc').split('_')
        params.set('sortBy', by)
        params.set('sortOrder', order === 'asc' ? 'asc' : 'desc')
        const response = await fetch(`/api/admin/stores?${params.toString()}`)
        console.log('📥 Response status:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        console.log('🏪 Número de lojas:', data.stores?.length || 0)

        setStores(data.stores || [])
        setTotal(data.pagination?.total || data.stores?.length || 0)
        toast.success(`Carregadas ${data.stores?.length || 0} lojas`)
      } catch (err) {
        console.error('❌ Erro ao carregar lojas:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        toast.error('Erro ao carregar lojas')
      } finally {
        setLoading(false)
        console.log('✅ Carregamento concluído')
      }
    }

    fetchStores()
  }, [page, pageSize, search, status, sort])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando lojas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Erro ao carregar lojas
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Lojas</h1>
          <p className="text-gray-600">
            Gerencie todas as lojas corporativas do sistema
          </p>
        </div>
        <Button onClick={() => router.push('/admin/lojas/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Loja
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lojas</CardTitle>
            <Store className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold text-gray-900"
              data-testid="stores-count"
            >
              {stores.length}
            </div>
            <p className="text-sm text-gray-500">Lojas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <Store className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stores.filter(s => s.status === 'active').length}
            </div>
            <p className="text-sm text-gray-500">Em operação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stores.reduce((sum, store) => sum + store.users_count, 0)}
            </div>
            <p className="text-sm text-gray-500">Usuários ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R${' '}
              {stores.reduce((sum, store) => sum + store.revenue, 0).toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Valor total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar lojas..."
            className="pl-10"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md text-sm"
          value={status}
          onChange={e => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativa</option>
          <option value="inactive">Inativa</option>
          <option value="maintenance">Manutenção</option>
        </select>
        <div className="min-w-[12rem]">
          <Select
            value={sort}
            onValueChange={v => {
              setSort(v)
              setPage(1)
              if (typeof window !== 'undefined')
                localStorage.setItem('admin_stores_sort', v)
            }}
          >
            <SelectTrigger className="px-3 py-2 text-sm">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at_desc">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Recentes
                </span>
              </SelectItem>
              <SelectItem value="created_at_asc">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Antigos
                </span>
              </SelectItem>
              <SelectItem value="name_asc">
                <span className="inline-flex items-center gap-2">
                  <List className="h-3.5 w-3.5" /> Nome (A–Z)
                </span>
              </SelectItem>
              <SelectItem value="name_desc">
                <span className="inline-flex items-center gap-2">
                  <List className="h-3.5 w-3.5" /> Nome (Z–A)
                </span>
              </SelectItem>
              <SelectItem value="products_count_desc">
                <span className="inline-flex items-center gap-2">
                  <Package className="h-3.5 w-3.5" /> Produtos (↓)
                </span>
              </SelectItem>
              <SelectItem value="products_count_asc">
                <span className="inline-flex items-center gap-2">
                  <Package className="h-3.5 w-3.5" /> Produtos (↑)
                </span>
              </SelectItem>
              <SelectItem value="users_count_desc">
                <span className="inline-flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Usuários (↓)
                </span>
              </SelectItem>
              <SelectItem value="users_count_asc">
                <span className="inline-flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Usuários (↑)
                </span>
              </SelectItem>
              <SelectItem value="orders_count_desc">
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5" /> Pedidos (↓)
                </span>
              </SelectItem>
              <SelectItem value="orders_count_asc">
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5" /> Pedidos (↑)
                </span>
              </SelectItem>
              <SelectItem value="revenue_desc">
                <span className="inline-flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5" /> Receita (↓)
                </span>
              </SelectItem>
              <SelectItem value="revenue_asc">
                <span className="inline-flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5" /> Receita (↑)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stores List */}
      <Card>
        <CardHeader>
          <CardTitle>Lojas ({stores.length})</CardTitle>
          <CardDescription>
            Lista de todas as lojas corporativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stores.length > 0 ? (
            <div className="space-y-4">
              {stores.map(store => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <SafeImage
                      src={store.logo_url}
                      alt={store.name}
                      size={48}
                      className="w-12 h-12"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {store.name}
                        </h3>
                        <Badge className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {store.companies?.name || 'Empresa não definida'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {store.domain}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {store.users_count} usuários
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {store.products_count} produtos
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {store.orders_count} pedidos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        R$ {store.revenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Receita total</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/lojas/${store.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/lojas/${store.id}/produtos`)
                        }
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/lojas/editar/${store.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Store}
              title={
                search || status
                  ? 'Nenhuma loja encontrada'
                  : 'Nenhuma loja cadastrada'
              }
              description={
                search || status
                  ? 'Tente ajustar os filtros de busca para encontrar lojas específicas.'
                  : 'Comece criando sua primeira loja para gerenciar produtos e funcionários.'
              }
              action={
                search || status
                  ? {
                      label: 'Nova Loja',
                      onClick: () => router.push('/admin/lojas/novo'),
                    }
                  : {
                      label: 'Criar Primeira Loja',
                      onClick: () => router.push('/admin/lojas/novo'),
                    }
              }
              secondaryAction={
                search || status
                  ? {
                      label: 'Limpar Filtros',
                      onClick: () => {
                        setSearch('')
                        setStatus('')
                        setPage(1)
                      },
                      variant: 'outline',
                    }
                  : undefined
              }
            />
          )}
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {(() => {
                const per = pageSize
                if (total === 0) return '0 resultados'
                const start = (page - 1) * per + 1
                const end = Math.min(total, page * per)
                return `Exibindo ${start}–${end} de ${total} resultados`
              })()}
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
                      localStorage.setItem('admin_stores_page_size', String(v))
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
        </CardContent>
      </Card>
    </div>
  )
}
