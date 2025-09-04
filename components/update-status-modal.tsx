'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'

interface UpdateStatusModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  currentStatus: string
  onStatusUpdated: () => void
}

const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Pendente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Pedido aguardando processamento',
  },
  {
    value: 'confirmed',
    label: 'Confirmado',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800',
    description: 'Pedido confirmado e em preparação',
  },
  {
    value: 'processing',
    label: 'Processando',
    icon: Package,
    color: 'bg-purple-100 text-purple-800',
    description: 'Produtos sendo preparados',
  },
  {
    value: 'shipped',
    label: 'Enviado',
    icon: Truck,
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Pedido em trânsito',
  },
  {
    value: 'delivered',
    label: 'Entregue',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    description: 'Pedido entregue com sucesso',
  },
  {
    value: 'cancelled',
    label: 'Cancelado',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800',
    description: 'Pedido cancelado',
  },
]

export default function UpdateStatusModal({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  onStatusUpdated,
}: UpdateStatusModalProps) {
  const [newStatus, setNewStatus] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedStatusOption = STATUS_OPTIONS.find(
    option => option.value === newStatus
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStatus) {
      toast({
        title: 'Erro',
        description: 'Selecione um status',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/tracking/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          location: location || null,
          description: description || null,
          tracking_code: trackingCode || null,
          timestamp: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar status')
      }

      toast({
        title: 'Sucesso',
        description: 'Status do pedido atualizado com sucesso',
      })

      onStatusUpdated()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNewStatus('')
    setLocation('')
    setDescription('')
    setTrackingCode('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Atualizar Status do Pedido
          </DialogTitle>
          <DialogDescription>
            Atualize o status e adicione informações sobre o progresso do pedido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Novo Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o novo status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStatusOption && (
              <div className="flex items-center space-x-2">
                <Badge className={selectedStatusOption.color}>
                  <selectedStatusOption.icon className="h-3 w-3 mr-1" />
                  {selectedStatusOption.label}
                </Badge>
                <span className="text-sm text-gray-600">
                  {selectedStatusOption.description}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização (Opcional)</Label>
            <Input
              id="location"
              placeholder="Ex: Centro de Distribuição São Paulo"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingCode">Código de Rastreamento (Opcional)</Label>
            <Input
              id="trackingCode"
              placeholder="Ex: BR123456789BR"
              value={trackingCode}
              onChange={e => setTrackingCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Pedido saiu para entrega às 14:30"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Status'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
