import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Download,
  Calendar,
  DollarSign,
  Package,
  Users,
} from 'lucide-react'
import { BudgetTimeline } from './BudgetTimeline'
import { ProductGrid } from './ProductGrid'
import { ArtworkUpload } from './ArtworkUpload'

interface BudgetManagerProps {
  companyId?: string
  onBudgetSelect?: (budget: any) => void
  className?: string
}

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: string
  company_id: string
  manager_id: string
  created_at: string
  updated_at: string
  companies?: {
    id: string
    name: string
  }
  users?: {
    id: string
    name: string
    email: string
  }
  budget_items?: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    base_product_id: string
    base_products?: {
      id: string
      name: string
      description: string
    }
  }>
}

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-gray-500' },
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  approved: { label: 'Aprovado', color: 'bg-green-500' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500' },
  in_production: { label: 'Em Produção', color: 'bg-blue-500' },
  completed: { label: 'Concluído', color: 'bg-green-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-600' },
}

export function BudgetManager({
  companyId,
  onBudgetSelect,
  className = '',
}: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBudget, setNewBudget] = useState({
    title: '',
    description: '',
    company_id: companyId || '',
  })

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (companyId) params.append('company_id', companyId)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('q', searchTerm)

      const response = await fetch(`/api/gestor/orcamentos?${params}`)
      const data = await response.json()

      if (data.success) {
        setBudgets(data.data.budgets || [])
      } else {
        setError(data.error?.message || 'Erro ao carregar orçamentos')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const createBudget = async () => {
    try {
      const response = await fetch('/api/gestor/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget),
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateForm(false)
        setNewBudget({
          title: '',
          description: '',
          company_id: companyId || '',
        })
        fetchBudgets()
      } else {
        setError(data.error?.message || 'Erro ao criar orçamento')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const updateBudgetStatus = async (budgetId: string, status: string) => {
    try {
      const response = await fetch(`/api/gestor/orcamentos/${budgetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        fetchBudgets()
        if (selectedBudget?.id === budgetId) {
          setSelectedBudget({ ...selectedBudget, status })
        }
      } else {
        setError(data.error?.message || 'Erro ao atualizar status')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [companyId, statusFilter, searchTerm])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: 'bg-gray-500',
      }
    )
  }

  const filteredBudgets = budgets.filter(budget => {
    if (searchTerm) {
      return (
        budget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return true
  })

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Orçamentos</TabsTrigger>
          <TabsTrigger value="create">Criar Orçamento</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedBudget}>
            Detalhes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filtros e busca */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar orçamentos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Buscar por título ou descrição..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
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
                      <SelectItem value="in_production">Em Produção</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Orçamento
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de orçamentos */}
          <div className="grid gap-4">
            {filteredBudgets.map(budget => {
              const statusConfig = getStatusConfig(budget.status)
              return (
                <Card
                  key={budget.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedBudget?.id === budget.id
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedBudget(budget)
                    onBudgetSelect?.(budget)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {budget.title}
                          </h3>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {budget.description && (
                          <p className="text-gray-600 mb-3">
                            {budget.description}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(budget.total_amount)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(budget.created_at)}
                          </div>
                          {budget.companies && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {budget.companies.name}
                            </div>
                          )}
                          {budget.budget_items && (
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {budget.budget_items.length} itens
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedBudget(budget)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => {
                            e.stopPropagation()
                            // Implementar edição
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredBudgets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum orçamento encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro orçamento'}
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Orçamento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Orçamento</Label>
                <Input
                  id="title"
                  value={newBudget.title}
                  onChange={e =>
                    setNewBudget({ ...newBudget, title: e.target.value })
                  }
                  placeholder="Ex: Orçamento para camisetas personalizadas"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newBudget.description}
                  onChange={e =>
                    setNewBudget({ ...newBudget, description: e.target.value })
                  }
                  placeholder="Descreva os detalhes do orçamento..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createBudget} disabled={!newBudget.title}>
                  Criar Orçamento
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedBudget && (
            <>
              {/* Informações do orçamento */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedBudget.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge
                          className={
                            getStatusConfig(selectedBudget.status).color
                          }
                        >
                          {getStatusConfig(selectedBudget.status).label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Valor Total</Label>
                      <p className="text-lg font-semibold mt-1">
                        {formatCurrency(selectedBudget.total_amount)}
                      </p>
                    </div>
                    <div>
                      <Label>Data de Criação</Label>
                      <p className="mt-1">
                        {formatDate(selectedBudget.created_at)}
                      </p>
                    </div>
                    <div>
                      <Label>Última Atualização</Label>
                      <p className="mt-1">
                        {formatDate(selectedBudget.updated_at)}
                      </p>
                    </div>
                  </div>

                  {selectedBudget.description && (
                    <div className="mt-4">
                      <Label>Descrição</Label>
                      <p className="mt-1 text-gray-600">
                        {selectedBudget.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <BudgetTimeline
                budgetId={selectedBudget.id}
                showCreateButton={true}
              />

              {/* Itens do orçamento */}
              {selectedBudget.budget_items &&
                selectedBudget.budget_items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Itens do Orçamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedBudget.budget_items.map(item => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">
                                  {item.base_products?.name || 'Produto'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Quantidade: {item.quantity} | Preço unitário:{' '}
                                  {formatCurrency(item.unit_price)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatCurrency(item.total_price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

