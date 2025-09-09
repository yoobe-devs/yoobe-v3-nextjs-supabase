'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Package,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Save,
  X,
  MapPin,
  Hash,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface ProductionOrder {
  id: string
  po_number?: string
  status: string
  est_start_at?: string
  est_finish_at?: string
  logistics?: Record<string, any>
  created_at: string
  updated_at: string
  companies: {
    id: string
    name: string
  }
  budgets: {
    id: string
    title: string
  }
}

interface ProductionOrderCardProps {
  budgetId: string
  className?: string
}

const STATUS_CONFIG = {
  planned: {
    label: 'Planejada',
    color: 'bg-blue-500',
    description: 'Ordem de produção planejada',
  },
  in_progress: {
    label: 'Em Produção',
    color: 'bg-yellow-500',
    description: 'Produtos em produção',
  },
  qc: {
    label: 'Controle de Qualidade',
    color: 'bg-purple-500',
    description: 'Verificação de qualidade',
  },
  packed: {
    label: 'Empacotada',
    color: 'bg-indigo-500',
    description: 'Produtos empacotados',
  },
  shipped: {
    label: 'Enviada',
    color: 'bg-teal-500',
    description: 'Produtos enviados',
  },
  delivered: {
    label: 'Entregue',
    color: 'bg-green-500',
    description: 'Produtos entregues',
  },
  canceled: {
    label: 'Cancelada',
    color: 'bg-red-500',
    description: 'Ordem cancelada',
  },
}

export function ProductionOrderCard({
  budgetId,
  className = '',
}: ProductionOrderCardProps) {
  const [productionOrder, setProductionOrder] =
    useState<ProductionOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    status: '',
    po_number: '',
    est_start_at: '',
    est_finish_at: '',
    tracking_code: '',
    carrier: '',
    notes: '',
  })

  useEffect(() => {
    fetchProductionOrder()
  }, [budgetId])

  const fetchProductionOrder = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/budgets/${budgetId}/production-order`)

      if (!response.ok) {
        if (response.status === 404) {
          setProductionOrder(null)
          return
        }
        throw new Error('Erro ao carregar ordem de produção')
      }

      const { data } = await response.json()
      setProductionOrder(data.production_order)

      if (data.production_order) {
        setFormData({
          status: data.production_order.status,
          po_number: data.production_order.po_number || '',
          est_start_at: data.production_order.est_start_at
            ? format(
                new Date(data.production_order.est_start_at),
                "yyyy-MM-dd'T'HH:mm"
              )
            : '',
          est_finish_at: data.production_order.est_finish_at
            ? format(
                new Date(data.production_order.est_finish_at),
                "yyyy-MM-dd'T'HH:mm"
              )
            : '',
          tracking_code: data.production_order.logistics?.tracking_code || '',
          carrier: data.production_order.logistics?.carrier || '',
          notes: data.production_order.logistics?.notes || '',
        })
      }
    } catch (error) {
      console.error('Erro ao carregar ordem de produção:', error)
      setError('Erro ao carregar ordem de produção')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!productionOrder) return

    setIsSaving(true)
    try {
      const updateData = {
        status: formData.status,
        po_number: formData.po_number,
        est_start_at: formData.est_start_at || null,
        est_finish_at: formData.est_finish_at || null,
        logistics: {
          tracking_code: formData.tracking_code,
          carrier: formData.carrier,
          notes: formData.notes,
        },
      }

      const response = await fetch(
        `/api/production-orders/${productionOrder.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao atualizar ordem de produção')
      }

      toast.success('Ordem de produção atualizada com sucesso')
      setIsEditing(false)
      fetchProductionOrder()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao atualizar ordem de produção')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (productionOrder) {
      setFormData({
        status: productionOrder.status,
        po_number: productionOrder.po_number || '',
        est_start_at: productionOrder.est_start_at
          ? format(new Date(productionOrder.est_start_at), "yyyy-MM-dd'T'HH:mm")
          : '',
        est_finish_at: productionOrder.est_finish_at
          ? format(
              new Date(productionOrder.est_finish_at),
              "yyyy-MM-dd'T'HH:mm"
            )
          : '',
        tracking_code: productionOrder.logistics?.tracking_code || '',
        carrier: productionOrder.logistics?.carrier || '',
        notes: productionOrder.logistics?.notes || '',
      })
    }
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    } catch {
      return dateString
    }
  }

  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
        label: status,
        color: 'bg-gray-500',
        description: 'Status desconhecido',
      }
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ordem de Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ordem de Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              onClick={fetchProductionOrder}
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!productionOrder) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ordem de Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhuma ordem de produção criada ainda
            </p>
            <p className="text-sm text-muted-foreground">
              A ordem de produção será criada automaticamente após a aprovação
              do orçamento
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = getStatusConfig(productionOrder.status)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ordem de Produção
            </CardTitle>
            <CardDescription>{productionOrder.budgets.title}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusConfig.color} text-white`}>
              {statusConfig.label}
            </Badge>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Número da PO
            </Label>
            {isEditing ? (
              <Input
                value={formData.po_number}
                onChange={e =>
                  setFormData(prev => ({ ...prev, po_number: e.target.value }))
                }
                placeholder="Ex: PO-2024-001"
              />
            ) : (
              <p className="text-sm font-medium">
                {productionOrder.po_number || 'Não informado'}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Status
            </Label>
            {isEditing ? (
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium">{statusConfig.label}</p>
            )}
          </div>
        </div>

        {/* Datas estimadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Início Estimado
            </Label>
            {isEditing ? (
              <Input
                type="datetime-local"
                value={formData.est_start_at}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    est_start_at: e.target.value,
                  }))
                }
              />
            ) : (
              <p className="text-sm font-medium">
                {productionOrder.est_start_at
                  ? formatDate(productionOrder.est_start_at)
                  : 'Não informado'}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Conclusão Estimada
            </Label>
            {isEditing ? (
              <Input
                type="datetime-local"
                value={formData.est_finish_at}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    est_finish_at: e.target.value,
                  }))
                }
              />
            ) : (
              <p className="text-sm font-medium">
                {productionOrder.est_finish_at
                  ? formatDate(productionOrder.est_finish_at)
                  : 'Não informado'}
              </p>
            )}
          </div>
        </div>

        {/* Logística */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Informações de Logística
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Código de Rastreamento
              </Label>
              {isEditing ? (
                <Input
                  value={formData.tracking_code}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      tracking_code: e.target.value,
                    }))
                  }
                  placeholder="Ex: BR123456789"
                />
              ) : (
                <p className="text-sm font-medium">
                  {productionOrder.logistics?.tracking_code || 'Não informado'}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Transportadora
              </Label>
              {isEditing ? (
                <Input
                  value={formData.carrier}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, carrier: e.target.value }))
                  }
                  placeholder="Ex: Correios, Total Express"
                />
              ) : (
                <p className="text-sm font-medium">
                  {productionOrder.logistics?.carrier || 'Não informado'}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Observações
            </Label>
            {isEditing ? (
              <Textarea
                value={formData.notes}
                onChange={e =>
                  setFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Observações sobre a logística..."
                rows={3}
              />
            ) : (
              <p className="text-sm font-medium">
                {productionOrder.logistics?.notes || 'Nenhuma observação'}
              </p>
            )}
          </div>
        </div>

        {/* Informações do sistema */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Criado em: {formatDate(productionOrder.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Atualizado em: {formatDate(productionOrder.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        {isEditing && (
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

