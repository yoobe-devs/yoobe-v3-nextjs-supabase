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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BudgetManagementTabs } from '@/components/ui/BudgetManagementTabs'
import {
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
  Package,
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Building,
  Search,
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
    image_url?: string
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
  company_id?: string
  created_by?: string
  companies?: {
    name: string
  }
  users?: {
    name: string
    email: string
  }
}

export default function AdminOrcamentosPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'management'>('list')
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  useEffect(() => {
    loadData()
  }, [])

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

      try {
        const budgetsResponse = await fetch('/api/admin/budgets')
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

  const openManagement = (budget: Budget) => {
    setSelectedBudget(budget)
    setViewMode('management')
  }

  const closeManagement = () => {
    setViewMode('list')
    setSelectedBudget(null)
  }

  const handleApprove = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/admin/budgets/${budgetId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (response.ok) {
        toast.success('Orçamento aprovado com sucesso!')
        await loadData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao aprovar orçamento')
      }
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error)
      toast.error('Erro ao aprovar orçamento')
    }
  }

  const handleReject = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/admin/budgets/${budgetId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (response.ok) {
        toast.success('Orçamento rejeitado')
        await loadData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao rejeitar orçamento')
      }
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error)
      toast.error('Erro ao rejeitar orçamento')
    }
  }

  const handleReplicate = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}/replicate`, {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(
          `Replicação concluída: ${result.created || 0} produtos criados, ${result.existed || 0} já existiam`
        )
        await loadData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao replicar produtos')
      }
    } catch (error) {
      console.error('Erro ao replicar produtos:', error)
      toast.error('Erro ao replicar produtos')
    }
  }

  const handleUpdate = async (budgetData: Budget) => {
    try {
      if (!selectedBudget?.id) return
      
      const response = await fetch(`/api/admin/budgets/${selectedBudget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar orçamento')
      }
      
      await loadData()
      setSelectedBudget(budgetData)
      toast.success('Orçamento atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar orçamento')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando orçamentos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'management' && selectedBudget) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={closeManagement}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Orçamento
              </h1>
              <p className="text-gray-600">{selectedBudget.title}</p>
            </div>
          </div>
        </div>
        
        <BudgetManagementTabs
          budget={selectedBudget}
          onUpdate={handleUpdate}
          onApprove={handleApprove}
          onReject={handleReject}
          onReplicate={handleReplicate}
          mode="admin"
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">
            Gerencie e aprove orçamentos de todas as empresas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-100 text-blue-800">
            Admin Global
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map(budget => (
          <Card key={budget.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {budget.title}
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
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{budget.companies?.name || 'Empresa não informada'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{budget.users?.name || 'Usuário não informado'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(budget.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openManagement(budget)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Gerenciar
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40">
                    <p className="text-sm">Gerenciar orçamento</p>
                  </PopoverContent>
                </Popover>
                
                {budget.status === 'pending' && (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(budget.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <p className="text-sm">Aprovar orçamento</p>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(budget.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <p className="text-sm">Rejeitar orçamento</p>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
                
                {budget.status === 'approved' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleReplicate(budget.id)}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Replicar
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40">
                      <p className="text-sm">Replicar produtos</p>
                    </PopoverContent>
                  </Popover>
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
              : 'Nenhum orçamento foi criado ainda'}
          </p>
        </div>
      )}
    </div>
  )
}
