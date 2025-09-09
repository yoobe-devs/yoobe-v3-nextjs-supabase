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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { SafeImage } from '@/components/ui/safe-image'
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Store,
  Package,
  Loader2,
  List,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  logo_url?: string
  status: string
  points_rate: number
  allow_points_only: boolean
  allow_mixed_payment: boolean
  created_at: string
  updated_at: string
  stores_count?: number
  users_count?: number

  // Contadores de produtos (novos campos)
  products_total?: number
  products_draft?: number
  products_liberado?: number
  products_ativo?: number
  products_inativo?: number
}

export default function AdminEmpresasPage() {
  const router = useRouter()
  const pathname = usePathname()
  const urlParams = useSearchParams()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>(
    () => urlParams.get('search') || ''
  )
  const [selectedStatus, setSelectedStatus] = useState<string>(
    () => urlParams.get('status') || 'all'
  )
  const [sort, setSort] = useState<string>(() => {
    const fromQs = urlParams.get('sort')
    if (fromQs) return fromQs
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_companies_sort') || 'name_asc'
    }
    return 'name_asc'
  })
  const [page, setPage] = useState<number>(() =>
    parseInt(urlParams.get('page') || '1')
  )
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const fromQs = Number(urlParams.get('limit') || 0)
      const v =
        fromQs ||
        Number(localStorage.getItem('admin_companies_page_size') || '12')
      return [12, 24, 48].includes(v) ? v : 12
    }
    return 12
  })
  const [total, setTotal] = useState(0)

  const statuses = ['all', 'active', 'inactive', 'pending']

  // Sync URL query on state change
  useEffect(() => {
    const params = new URLSearchParams(urlParams.toString())
    params.set('page', String(page))
    params.set('limit', String(pageSize))
    if (searchTerm) params.set('search', searchTerm)
    else params.delete('search')
    if (selectedStatus && selectedStatus !== 'all')
      params.set('status', selectedStatus)
    else params.delete('status')
    if (sort) params.set('sort', sort)
    else params.delete('sort')
    router.replace(`${pathname}?${params.toString()}`)
  }, [page, pageSize, searchTerm, selectedStatus, sort])

  useEffect(() => {
    fetchCompanies()
  }, [page, pageSize, searchTerm, selectedStatus, sort])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando empresas...')
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      if (searchTerm) params.set('search', searchTerm)
      const [by, order] = (sort || 'name_asc').split('_')
      params.set('sortBy', by === 'products' ? 'products_total' : by)
      params.set('sortOrder', order === 'desc' ? 'desc' : 'asc')
      const response = await fetch(`/api/companies?${params.toString()}`)
      console.log('📥 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        console.log('🏢 Número de empresas:', data.data?.length || 0)

        // Usar dados da API com contadores
        const companiesWithCounters = (data.items || []).map(
          (company: any) => ({
            ...company,
            products_count: company.products_total || 0,
          })
        )
        setTotal(data.pagination?.total || companiesWithCounters.length)
        setCompanies(companiesWithCounters)
        console.log('✅ Empresas carregadas:', companiesWithCounters.length)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Erro na API:', errorData)
        toast.error('Erro ao carregar empresas')
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
    } finally {
      setLoading(false)
      console.log('✅ Carregamento concluído')
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      selectedStatus === 'all' || company.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Empresa excluída com sucesso!')
        fetchCompanies() // Recarregar lista
      } else {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao excluir empresa')
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir empresa'
      )
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando empresas...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Empresas
          </h1>
          <p className="text-gray-600">
            Gerencie todas as empresas clientes do sistema
          </p>
        </div>
        <Button onClick={() => router.push('/admin/empresas/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empresas Ativas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lojas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, c) => sum + (c.stores_count || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, c) => sum + (c.products_total || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md text-sm"
          value={selectedStatus}
          onChange={e => {
            setSelectedStatus(e.target.value)
            setPage(1)
          }}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all'
                ? 'Todos'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <div className="min-w-[11rem]">
          <Select
            value={sort}
            onValueChange={v => {
              setSort(v)
              setPage(1)
              if (typeof window !== 'undefined')
                localStorage.setItem('admin_companies_sort', v)
            }}
          >
            <SelectTrigger className="px-3 py-2 text-sm">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
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
              <SelectItem value="products_desc">
                <span className="inline-flex items-center gap-2">
                  <ArrowDown className="h-3.5 w-3.5" /> Produtos (↓)
                </span>
              </SelectItem>
              <SelectItem value="products_asc">
                <span className="inline-flex items-center gap-2">
                  <ArrowUp className="h-3.5 w-3.5" /> Produtos (↑)
                </span>
              </SelectItem>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map(company => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SafeImage
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    fallback={
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    }
                  />
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {company.email}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(company.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Lojas:</span>
                  <span className="ml-1 font-medium">
                    {company.stores_count || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Usuários:</span>
                  <span className="ml-1 font-medium">
                    {company.users_count || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Produtos:</span>
                  <span className="ml-1 font-medium">
                    {company.products_total || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Ativos:</span>
                  <span className="ml-1 font-medium">
                    {company.products_ativo || 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/empresas/${company.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/empresas/${company.id}/edit`)
                  }
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between text-sm">
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
                  localStorage.setItem('admin_companies_page_size', String(v))
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

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma empresa encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira empresa'}
          </p>
          {!searchTerm && selectedStatus === 'all' && (
            <Button onClick={() => router.push('/admin/empresas/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Empresa
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
