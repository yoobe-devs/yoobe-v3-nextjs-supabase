'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  products_total?: number
  products_draft?: number
  products_liberado?: number
  products_ativo?: number
  products_inativo?: number
}

export default function AdminEmpresasPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const statuses = ['all', 'active', 'inactive', 'pending']

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando empresas...')

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
            products_count: company.products_total || 0,
          })) || []

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
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md text-sm"
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all'
                ? 'Todos'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
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










