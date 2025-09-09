'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
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
  products_count?: number
  products_total?: number
  products_draft?: number
  products_liberado?: number
  products_ativo?: number
  products_inativo?: number
  stats_updated_at?: string
}

export default function AdminEmpresasPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const statuses = ['all', 'active', 'inactive', 'pending']

  // Hook para atualizações em tempo real
  const { isConnected, forceRecompute } = useRealtimeUpdates({
    onProductUpdate: event => {
      console.log(
        '🔄 Atualização de produto detectada, recarregando empresas...'
      )
      fetchCompanies()
    },
    onStatsUpdate: event => {
      console.log(
        '📊 Atualização de estatísticas detectada, recarregando empresas...'
      )
      fetchCompanies()
    },
    onConnectionChange: connected => {
      if (connected) {
        toast.success('Conexão em tempo real estabelecida')
      } else {
        toast.warning('Conexão em tempo real perdida')
      }
    },
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando empresas com contadores...')

      const response = await fetch('/api/admin/companies')
      console.log('📥 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        console.log('🏢 Número de empresas:', data.data?.length || 0)

        // Usar dados da nova API com contadores
        const companiesWithCounters =
          data.data?.map((company: any) => ({
            ...company,
            stores_count: 0, // TODO: Implementar contador de lojas
            users_count: 0, // TODO: Implementar contador de usuários
            products_count: company.products_total || 0, // Usar contador real de produtos
          })) || []

        setCompanies(companiesWithCounters)
        toast.success(
          `Carregadas ${companiesWithCounters.length} empresas com contadores atualizados`
        )
      } else {
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Empresas
            </h1>
            {/* Indicador de conexão em tempo real */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Tempo real ativo' : 'Tempo real offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">
            Gerencie todas as empresas clientes do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await forceRecompute('550e8400-e29b-41d4-a716-446655440001')
                toast.success('Estatísticas recalculadas!')
                fetchCompanies()
              } catch (error) {
                toast.error('Erro ao recalcular estatísticas')
              }
            }}
          >
            <Package className="h-4 w-4 mr-2" />
            Recalcular Stats
          </Button>
          <Button onClick={() => router.push('/admin/empresas/novo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {companies.length}
            </div>
            <p className="text-sm text-gray-500">Empresas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empresas Ativas
            </CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {companies.filter(c => c.status === 'active').length}
            </div>
            <p className="text-sm text-gray-500">Em operação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lojas</CardTitle>
            <Store className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {companies.reduce(
                (sum, company) => sum + (company.stores_count || 0),
                0
              )}
            </div>
            <p className="text-sm text-gray-500">Lojas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {companies.reduce(
                (sum, company) => sum + (company.users_count || 0),
                0
              )}
            </div>
            <p className="text-sm text-gray-500">Usuários ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as empresas por nome, email ou status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all'
                      ? 'Todos os Status'
                      : status === 'active'
                        ? 'Ativo'
                        : status === 'inactive'
                          ? 'Inativo'
                          : 'Pendente'}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas ({filteredCompanies.length})</CardTitle>
          <CardDescription>Lista de todas as empresas clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length > 0 ? (
            <div className="space-y-4">
              {filteredCompanies.map(company => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <SafeImage
                      src={company.logo_url}
                      alt={company.name}
                      size={60}
                      className="w-15 h-15"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        {getStatusBadge(company.status)}
                      </div>
                      <p className="text-sm text-gray-500">{company.email}</p>
                      <p className="text-sm text-gray-500">{company.phone}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          {company.stores_count || 0} lojas
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {company.users_count || 0} usuários
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {company.products_total || 0} produtos
                          {company.products_total > 0 && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({company.products_ativo || 0} ativos)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/empresas/${company.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/empresas/editar/${company.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCompany(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira empresa'}
              </p>
              <Button onClick={() => router.push('/admin/empresas/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Empresa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
