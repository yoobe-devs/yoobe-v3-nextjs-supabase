import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  AlertTriangle,
  Eye,
  FileText
} from 'lucide-react'

interface BudgetApprovalProps {
  budgetId: string
  onApprovalChange?: (approval: any) => void
  className?: string
}

interface Approval {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  comments?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  users?: {
    id: string
    name: string
    email: string
  }
}

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: string
  created_at: string
  companies?: {
    id: string
    name: string
  }
  users?: {
    id: string
    name: string
    email: string
  }
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-500',
    label: 'Pendente',
    description: 'Aguardando aprovação',
  },
  approved: {
    icon: CheckCircle,
    color: 'bg-green-500',
    label: 'Aprovado',
    description: 'Orçamento aprovado',
  },
  rejected: {
    icon: XCircle,
    color: 'bg-red-500',
    label: 'Rejeitado',
    description: 'Orçamento rejeitado',
  },
  cancelled: {
    icon: XCircle,
    color: 'bg-gray-500',
    label: 'Cancelado',
    description: 'Aprovação cancelada',
  },
}

export function BudgetApproval({
  budgetId,
  onApprovalChange,
  className = '',
}: BudgetApprovalProps) {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [approvalData, setApprovalData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    comments: '',
    rejection_reason: '',
  })

  const fetchBudgetAndApprovals = async () => {
    try {
      setLoading(true)
      
      // Buscar dados do orçamento
      const budgetResponse = await fetch(`/api/gestor/orcamentos/${budgetId}`)
      const budgetResult = await budgetResponse.json()
      
      if (budgetResult.success) {
        setBudget(budgetResult.data.budget)
      }

      // Buscar aprovações
      const approvalsResponse = await fetch(`/api/budgets/${budgetId}/approval`)
      const approvalsResult = await approvalsResponse.json()
      
      if (approvalsResult.success) {
        setApprovals(approvalsResult.data.approvals || [])
      } else {
        setError(approvalsResult.error?.message || 'Erro ao carregar aprovações')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (budgetId) {
      fetchBudgetAndApprovals()
    }
  }, [budgetId])

  const handleApproval = async () => {
    try {
      setIsApproving(true)
      
      const response = await fetch(`/api/budgets/${budgetId}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData),
      })

      const result = await response.json()

      if (result.success) {
        setApprovalData({ status: 'approved', comments: '', rejection_reason: '' })
        await fetchBudgetAndApprovals()
        onApprovalChange?.(result.data.approval)
      } else {
        setError(result.error?.message || 'Erro ao processar aprovação')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setIsApproving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || {
      icon: Clock,
      color: 'bg-gray-500',
      label: status,
      description: 'Status desconhecido',
    }
  }

  const canApprove = budget?.status === 'pending' || budget?.status === 'draft'
  const hasPendingApproval = approvals.some(approval => approval.status === 'pending')

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

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchBudgetAndApprovals} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Informações do orçamento */}
      {budget && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{budget.title}</span>
              <Badge className={getStatusConfig(budget.status).color}>
                {getStatusConfig(budget.status).label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Total</Label>
                <p className="text-lg font-semibold">{formatCurrency(budget.total_amount)}</p>
              </div>
              <div>
                <Label>Data de Criação</Label>
                <p className="text-sm">{formatDate(budget.created_at)}</p>
              </div>
              {budget.companies && (
                <div>
                  <Label>Empresa</Label>
                  <p className="text-sm">{budget.companies.name}</p>
                </div>
              )}
              {budget.users && (
                <div>
                  <Label>Criado por</Label>
                  <p className="text-sm">{budget.users.name}</p>
                </div>
              )}
            </div>
            
            {budget.description && (
              <div className="mt-4">
                <Label>Descrição</Label>
                <p className="text-sm text-gray-600 mt-1">{budget.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulário de aprovação */}
      {canApprove && !hasPendingApproval && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Aprovar ou Rejeitar Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={approvalData.status === 'approved' ? 'default' : 'outline'}
                onClick={() => setApprovalData({ ...approvalData, status: 'approved' })}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button
                variant={approvalData.status === 'rejected' ? 'destructive' : 'outline'}
                onClick={() => setApprovalData({ ...approvalData, status: 'rejected' })}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>

            <div>
              <Label htmlFor="comments">Comentários</Label>
              <Textarea
                id="comments"
                value={approvalData.comments}
                onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                placeholder="Adicione comentários sobre a aprovação..."
                rows={3}
              />
            </div>

            {approvalData.status === 'rejected' && (
              <div>
                <Label htmlFor="rejection_reason">Motivo da Rejeição</Label>
                <Textarea
                  id="rejection_reason"
                  value={approvalData.rejection_reason}
                  onChange={(e) => setApprovalData({ ...approvalData, rejection_reason: e.target.value })}
                  placeholder="Explique o motivo da rejeição..."
                  rows={2}
                />
              </div>
            )}

            <Button
              onClick={handleApproval}
              disabled={isApproving || (approvalData.status === 'rejected' && !approvalData.rejection_reason)}
              className="w-full"
            >
              {isApproving ? 'Processando...' : `${approvalData.status === 'approved' ? 'Aprovar' : 'Rejeitar'} Orçamento`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Histórico de aprovações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Histórico de Aprovações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma aprovação registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval, index) => {
                const config = getStatusConfig(approval.status)
                const Icon = config.icon

                return (
                  <div key={approval.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{config.label}</h4>
                          <p className="text-sm text-gray-600">{config.description}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(approval.created_at)}
                        </div>
                        {approval.approved_at && (
                          <div className="text-xs">
                            Processado: {formatDate(approval.approved_at)}
                          </div>
                        )}
                      </div>
                    </div>

                    {approval.users && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <User className="w-3 h-3" />
                        <span>Por {approval.users.name}</span>
                      </div>
                    )}

                    {approval.comments && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-sm font-medium">Comentários:</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {approval.comments}
                        </p>
                      </div>
                    )}

                    {approval.rejection_reason && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-sm font-medium">Motivo da Rejeição:</span>
                        </div>
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {approval.rejection_reason}
                        </p>
                      </div>
                    )}

                    {index < approvals.length - 1 && <Separator className="mt-4" />}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

