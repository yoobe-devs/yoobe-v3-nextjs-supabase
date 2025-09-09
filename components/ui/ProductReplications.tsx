import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Eye,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react'

interface ProductReplicationsProps {
  budgetId?: string
  onReplicationSelect?: (replication: any) => void
  className?: string
}

interface Replication {
  id: string
  budget_id: string
  base_product_id: string
  replicated_product_id: string
  replication_type: 'automatic' | 'manual' | 'custom'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  customizations: Record<string, any>
  artwork_files: any[]
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
  budgets?: {
    id: string
    title: string
    status: string
    company_id: string
  }
  base_products?: {
    id: string
    name: string
    description: string
    base_price: number
    images: string[]
    specifications: Record<string, any>
  }
  products?: {
    id: string
    name: string
    price: number
    status: string
    stock_quantity: number
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
    description: 'Aguardando processamento',
  },
  processing: {
    icon: RefreshCw,
    color: 'bg-blue-500',
    label: 'Processando',
    description: 'Replicação em andamento',
  },
  completed: {
    icon: CheckCircle,
    color: 'bg-green-500',
    label: 'Concluído',
    description: 'Produto replicado com sucesso',
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-500',
    label: 'Falhou',
    description: 'Erro na replicação',
  },
}

const typeConfig = {
  automatic: {
    color: 'bg-green-100 text-green-800',
    label: 'Automática',
  },
  manual: {
    color: 'bg-blue-100 text-blue-800',
    label: 'Manual',
  },
  custom: {
    color: 'bg-purple-100 text-purple-800',
    label: 'Personalizada',
  },
}

export function ProductReplications({
  budgetId,
  onReplicationSelect,
  className = '',
}: ProductReplicationsProps) {
  const [replications, setReplications] = useState<Replication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReplication, setSelectedReplication] = useState<Replication | null>(null)

  const fetchReplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (budgetId) params.append('budget_id', budgetId)

      const response = await fetch(`/api/replications?${params}`)
      const data = await response.json()

      if (data.success) {
        setReplications(data.data.replications || [])
      } else {
        setError(data.error?.message || 'Erro ao carregar replicações')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const updateReplicationStatus = async (replicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/replications/${replicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchReplications()
      } else {
        setError(data.error?.message || 'Erro ao atualizar status')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  useEffect(() => {
    fetchReplications()
  }, [budgetId])

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

  const getTypeConfig = (type: string) => {
    return typeConfig[type as keyof typeof typeConfig] || {
      color: 'bg-gray-100 text-gray-800',
      label: type,
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending': return 0
      case 'processing': return 50
      case 'completed': return 100
      case 'failed': return 0
      default: return 0
    }
  }

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
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchReplications} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Replicações de Produtos
            </CardTitle>
            <Button onClick={fetchReplications} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {replications.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma replicação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replications.map((replication) => {
                const statusConfig = getStatusConfig(replication.status)
                const typeConfig = getTypeConfig(replication.replication_type)
                const StatusIcon = statusConfig.icon

                return (
                  <div key={replication.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${statusConfig.color} flex items-center justify-center text-white`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {replication.base_products?.name || 'Produto'}
                          </h4>
                          <p className="text-sm text-gray-600">{statusConfig.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReplication(replication)
                            onReplicationSelect?.(replication)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{getProgressValue(replication.status)}%</span>
                      </div>
                      <Progress value={getProgressValue(replication.status)} />
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Quantidade:</span>
                        <span className="ml-2 font-medium">{replication.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Preço Unitário:</span>
                        <span className="ml-2 font-medium">{formatCurrency(replication.unit_price)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-2 font-medium">{formatCurrency(replication.total_price)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Criado:</span>
                        <span className="ml-2 font-medium">{formatDate(replication.created_at)}</span>
                      </div>
                    </div>

                    {/* Produto replicado */}
                    {replication.products && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Produto Replicado</p>
                            <p className="text-sm text-gray-600">{replication.products.name}</p>
                            <p className="text-xs text-gray-500">
                              Estoque: {replication.products.stock_quantity} unidades
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Artes */}
                    {replication.artwork_files && replication.artwork_files.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Artes Anexadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {replication.artwork_files.map((artwork, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {artwork.file_type || 'Arte'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    {replication.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateReplicationStatus(replication.id, 'processing')}
                        >
                          Iniciar Processamento
                        </Button>
                      </div>
                    )}

                    {replication.status === 'processing' && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReplicationStatus(replication.id, 'completed')}
                        >
                          Marcar como Concluído
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateReplicationStatus(replication.id, 'failed')}
                        >
                          Marcar como Falhou
                        </Button>
                      </div>
                    )}
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

