'use client'

import { useState, useEffect } from 'react'
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
import { toast } from '@/hooks/use-toast'
import {
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  RefreshCw,
  Save,
} from 'lucide-react'

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  onOrderUpdated: () => void
}

export default function EditOrderModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}: EditOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Informações do cliente
    customerName: '',
    customerEmail: '',
    customerPhone: '',

    // Endereço de entrega
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',

    // Informações do pedido
    notes: '',
    totalAmount: '',
    pointsUsed: '',
  })

  // Preencher formulário com dados do pedido
  useEffect(() => {
    if (order && isOpen) {
      setFormData({
        customerName: order.customer?.name || '',
        customerEmail: order.customer?.email || '',
        customerPhone: order.customer?.phone || '',
        street: order.shipping_address?.street || '',
        city: order.shipping_address?.city || '',
        state: order.shipping_address?.state || '',
        postalCode: order.shipping_address?.postal_code || '',
        country: order.shipping_address?.country || 'Brasil',
        notes: order.notes || '',
        totalAmount: order.total_amount?.toString() || '',
        pointsUsed: order.points_used?.toString() || '',
      })
    }
  }, [order, isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerEmail) {
      toast({
        title: 'Erro',
        description: 'Nome e email do cliente são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Atualizar informações do cliente
          customer: {
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone,
          },

          // Atualizar endereço de entrega
          shipping_address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },

          // Atualizar outras informações
          notes: formData.notes,
          total_amount: parseFloat(formData.totalAmount) || order.total_amount,
          points_used: parseInt(formData.pointsUsed) || order.points_used,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar pedido')
      }

      toast({
        title: 'Sucesso',
        description: 'Pedido atualizado com sucesso',
      })

      onOrderUpdated()
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error)
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            Editar Pedido #{order.order_number}
          </DialogTitle>
          <DialogDescription>
            Edite as informações do pedido, cliente e endereço de entrega
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Informações do Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome Completo *</Label>
                <Input
                  id="customerName"
                  placeholder="Nome do cliente"
                  value={formData.customerName}
                  onChange={e =>
                    handleInputChange('customerName', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.customerEmail}
                  onChange={e =>
                    handleInputChange('customerEmail', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefone</Label>
              <Input
                id="customerPhone"
                placeholder="(11) 99999-9999"
                value={formData.customerPhone}
                onChange={e =>
                  handleInputChange('customerPhone', e.target.value)
                }
              />
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Endereço de Entrega
            </h3>

            <div className="space-y-2">
              <Label htmlFor="street">Rua/Avenida</Label>
              <Input
                id="street"
                placeholder="Rua das Flores, 123"
                value={formData.street}
                onChange={e => handleInputChange('street', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="São Paulo"
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="SP"
                  value={formData.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">CEP</Label>
                <Input
                  id="postalCode"
                  placeholder="01234-567"
                  value={formData.postalCode}
                  onChange={e =>
                    handleInputChange('postalCode', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                placeholder="Brasil"
                value={formData.country}
                onChange={e => handleInputChange('country', e.target.value)}
              />
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Informações Financeiras
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Valor Total (R$)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalAmount}
                  onChange={e =>
                    handleInputChange('totalAmount', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsUsed">Pontos Utilizados</Label>
                <Input
                  id="pointsUsed"
                  type="number"
                  placeholder="0"
                  value={formData.pointsUsed}
                  onChange={e =>
                    handleInputChange('pointsUsed', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o pedido..."
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
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
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
