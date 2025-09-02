'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Search, Eye, CheckCircle, XCircle, Clock, Building, User } from 'lucide-react'
import { toast } from 'sonner'

interface Budget {
  id: string
  title: string
  description: string
  total_amount: number
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  admin_notes?: string
  company_id: string
  manager_id: string
  budget_items: BudgetItem[]
  companies: {
    id: string
    name: string
    cnpj: string
  }
  managers: {
    id: string
    email: string
    user_metadata: {
      name: string
      role: string
    }
  }
}

interface BudgetItem {
  id: string
  base_product_id: string
  quantity: number
  custom_price?: number
  custom_points_cost?: number
  notes?: string
  base_products: {
    id: string
    name: string
    description: string
    base_price: number
    base_points_cost: number
    product_categories: {
      id: string
      name: string
      icon: string
      color: string
    }
  }
}

export default function AdminOrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [approvingBudget, setApprovingBudget] = useState<string | null>(null)
  const [rejectingBudget, setRejectingBudget] = useState<string | null>(null)
  
  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    action: 'approve' as 'approve' | 'reject',
    admin_notes: ''
  })

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/admin/orcamentos')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets || [])
      } else {
        toast.error('Erro ao carregar orçamentos')
      }
    } catch (error) {
      toast.error('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  // Handle budget approval/rejection
  const handleBudgetAction = async (budgetId: string, action: 'approve' | 'reject') => {
    if (!approvalForm.admin_notes.trim()) {
      toast.error('Observações são obrigatórias')
      return
    }

    const loadingState = action === 'approve' ? setApprovingBudget : setRejectingBudget
    loadingState(budgetId)

    try {
      const response = await fetch(`/api/admin/orcamentos/${budgetId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          admin_notes: approvalForm.admin_notes
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Orçamento ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`)
        setApprovalForm({ action: 'approve', admin_notes: '' })
        setSelectedBudget(null)
        fetchBudgets()
      } else {
        const error = await response.json()
        toast.error(error.error || `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} orçamento`)
      }
    } catch (error) {
      toast.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} orçamento`)
    } finally {
      loadingState(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</Badge>
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.managers?.user_metadata?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === 'all' || budget.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos Recebidos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie orçamentos enviados pelos gestores
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar orçamentos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Título, empresa ou gestor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                {filteredBudgets.length} orçamento(s) encontrado(s)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      <div className="grid gap-6">
        {filteredBudgets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Os gestores ainda não enviaram orçamentos
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBudgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {budget.title}
                      {getStatusBadge(budget.status)}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {budget.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {budget.companies?.name || 'Empresa não encontrada'}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {budget.managers?.user_metadata?.name || 'Gestor não encontrado'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {budget.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(budget.submitted_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Items Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Itens do Orçamento ({budget.budget_items.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {budget.budget_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-sm p-2 bg-muted rounded">
                          <p className="font-medium">{item.base_products.name}</p>
                          <p className="text-muted-foreground">
                            {item.quantity}x R$ {(item.custom_price || item.base_products.base_price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      {budget.budget_items.length > 3 && (
                        <div className="text-sm p-2 bg-muted rounded text-center">
                          +{budget.budget_items.length - 3} mais itens
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {budget.admin_notes && (
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-1">Observações do Administrador</h4>
                      <p className="text-sm text-muted-foreground">{budget.admin_notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <p>Enviado em: {new Date(budget.submitted_at).toLocaleString('pt-BR')}</p>
                      {budget.reviewed_at && (
                        <p>Revisado em: {new Date(budget.reviewed_at).toLocaleString('pt-BR')}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Orçamento</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Budget Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Título</Label>
                                <p className="text-sm text-muted-foreground">{budget.title}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div className="mt-1">{getStatusBadge(budget.status)}</div>
                              </div>
                              <div>
                                <Label>Empresa</Label>
                                <p className="text-sm text-muted-foreground">{budget.companies?.name}</p>
                              </div>
                              <div>
                                <Label>Gestor</Label>
                                <p className="text-sm text-muted-foreground">{budget.managers?.user_metadata?.name}</p>
                              </div>
                              <div>
                                <Label>Valor Total</Label>
                                <p className="text-lg font-semibold">R$ {budget.total_amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label>Data de Envio</Label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(budget.submitted_at).toLocaleString('pt-BR')}
                                </p>
                              </div>
                            </div>

                            <div>
                              <Label>Descrição</Label>
                              <p className="text-sm text-muted-foreground mt-1">{budget.description}</p>
                            </div>

                            {/* Budget Items Table */}
                            <div>
                              <Label>Itens do Orçamento</Label>
                              <Table className="mt-2">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead>Preço Unit.</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Observações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {budget.budget_items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{item.base_products.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {item.base_products.description}
                                          </p>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" style={{ 
                                          backgroundColor: item.base_products.product_categories.color + '20',
                                          color: item.base_products.product_categories.color
                                        }}>
                                          {item.base_products.product_categories.name}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>
                                        R$ {(item.custom_price || item.base_products.base_price).toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        R$ {((item.custom_price || item.base_products.base_price) * item.quantity).toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        {item.notes || '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Approval/Rejection Form */}
                            {budget.status === 'pending' && (
                              <div className="border-t pt-4">
                                <h4 className="font-medium mb-4">Aprovar ou Rejeitar Orçamento</h4>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="admin_notes">Observações (obrigatório)</Label>
                                    <Textarea
                                      id="admin_notes"
                                      value={approvalForm.admin_notes}
                                      onChange={(e) => setApprovalForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                                      placeholder="Explique o motivo da aprovação ou rejeição..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleBudgetAction(budget.id, 'reject')}
                                      disabled={rejectingBudget === budget.id || !approvalForm.admin_notes.trim()}
                                    >
                                      {rejectingBudget === budget.id ? 'Rejeitando...' : 'Rejeitar'}
                                    </Button>
                                    <Button
                                      onClick={() => handleBudgetAction(budget.id, 'approve')}
                                      disabled={approvingBudget === budget.id || !approvalForm.admin_notes.trim()}
                                    >
                                      {approvingBudget === budget.id ? 'Aprovando...' : 'Aprovar'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {budget.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBudget(budget)
                              setApprovalForm({ action: 'approve', admin_notes: '' })
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBudget(budget)
                              setApprovalForm({ action: 'reject', admin_notes: '' })
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


