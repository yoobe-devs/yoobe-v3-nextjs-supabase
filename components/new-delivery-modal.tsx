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
import { toast } from '@/hooks/use-toast'
import {
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  RefreshCw,
} from 'lucide-react'

interface NewDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  currentOrder?: any
  onDeliveryCreated: () => void
}

const DELIVERY_METHODS = [
  { value: 'standard', label: 'Entrega Padrão (5-7 dias úteis)' },
  { value: 'express', label: 'Entrega Expressa (1-2 dias úteis)' },
  { value: 'same_day', label: 'Entrega no Mesmo Dia' },
  { value: 'pickup', label: 'Retirada na Loja' },
]

export default function NewDeliveryModal({
  isOpen,
  onClose,
  orderId,
  currentOrder,
  onDeliveryCreated,
}: NewDeliveryModalProps) {
  const [deliveryMethod, setDeliveryMethod] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Brasil')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Preencher com dados do pedido atual se disponível
  useState(() => {
    if (currentOrder) {
      setRecipientName(currentOrder.customer?.name || '')
      setRecipientEmail(currentOrder.customer?.email || '')
      if (currentOrder.shipping_address) {
        setStreet(currentOrder.shipping_address.street || '')
        setCity(currentOrder.shipping_address.city || '')
        setState(currentOrder.shipping_address.state || '')
        setPostalCode(currentOrder.shipping_address.postal_code || '')
        setCountry(currentOrder.shipping_address.country || 'Brasil')
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliveryMethod || !recipientName || !recipientEmail || !street || !city || !state || !postalCode) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          delivery_method: deliveryMethod,
          recipient: {
            name: recipientName,
            email: recipientEmail,
            phone: recipientPhone,
          },
          address: {
            street,
            city,
            state,
            postal_code: postalCode,
            country,
          },
          notes: notes || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar nova entrega')
      }

      toast({
        title: 'Sucesso',
        description: 'Nova entrega criada com sucesso',
      })

      onDeliveryCreated()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Erro ao criar entrega:', error)
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
    setDeliveryMethod('')
    setRecipientName('')
    setRecipientEmail('')
    setRecipientPhone('')
    setStreet('')
    setCity('')
    setState('')
    setPostalCode('')
    setCountry('Brasil')
    setNotes('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Nova Entrega
          </DialogTitle>
          <DialogDescription>
            Configure uma nova entrega para este pedido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Método de Entrega */}
          <div className="space-y-2">
            <Label htmlFor="deliveryMethod">Método de Entrega *</Label>
            <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de entrega" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_METHODS.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informações do Destinatário */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Destinatário
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nome Completo *</Label>
                <Input
                  id="recipientName"
                  placeholder="Nome do destinatário"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientPhone">Telefone</Label>
              <Input
                id="recipientPhone"
                placeholder="(11) 99999-9999"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
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
              <Label htmlFor="street">Rua/Avenida *</Label>
              <Input
                id="street"
                placeholder="Rua das Flores, 123"
                value={street}
                onChange={e => setStreet(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  placeholder="São Paulo"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  placeholder="SP"
                  value={state}
                  onChange={e => setState(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postalCode">CEP *</Label>
                <Input
                  id="postalCode"
                  placeholder="01234-567"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                placeholder="Brasil"
                value={country}
                onChange={e => setCountry(e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Instruções especiais para entrega..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
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
                  Criando...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Criar Entrega
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
