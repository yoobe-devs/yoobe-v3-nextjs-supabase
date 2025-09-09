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
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

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

export default function GestorOrcamentosPageSimple() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [checkoutV2Enabled, setCheckoutV2Enabled] = useState(false)

  useEffect(() => {
    // Carregar dados de forma simplificada
    const loadData = async () => {
      try {
        setLoading(true)

        // Simular carregamento de orçamentos
        const mockBudgets: Budget[] = [
          {
            id: '1',
            title: 'Orçamento de Exemplo',
            description: 'Orçamento criado para teste',
            total_amount: 1500.0,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            budget_items: [],
          },
        ]

        setBudgets(mockBudgets)

        // Simular configurações do checkout
        setCheckoutV2Enabled(true)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    // Carregar com delay para simular carregamento real
    setTimeout(loadData, 1000)
  }, [])

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      (statusFilter || 'all') === 'all' || budget.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'default' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando orçamentos...</p>
            <p className="text-sm text-gray-500 mt-2">
              Versão simplificada carregando...
            </p>
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
            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar orçamentos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {filteredBudgets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie seu primeiro orçamento para começar'}
              </p>
              <Button
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBudgets.map(budget => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{budget.title}</CardTitle>
                    {budget.description && (
                      <CardDescription className="mt-1">
                        {budget.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(budget.status)}
                    <Badge variant="outline" className="text-green-600">
                      {formatCurrency(budget.total_amount)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Criado em {formatDate(budget.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {budget.budget_items.length} itens
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    {budget.status === 'draft' && (
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Enviar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações da Versão Simplificada */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" />
            <h3 className="font-medium">Versão Simplificada</h3>
          </div>
          <p className="text-blue-700 text-sm mt-2">
            Esta é uma versão simplificada da página de orçamentos para resolver
            problemas de carregamento. As funcionalidades completas serão
            restauradas após a correção dos problemas de autenticação.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
