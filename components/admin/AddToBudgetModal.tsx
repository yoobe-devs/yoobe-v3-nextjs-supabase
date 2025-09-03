'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Plus, 
  X, 
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calculator
} from 'lucide-react'

interface ProductBase {
  id: string
  sku: string
  title: string
  description: string
  price_cash: number
  price_points: number
  category: string
  active: boolean
  tenant_id: string
  media: string[]
  variations: any[]
  created_at: string
  updated_at: string
}

interface AddToBudgetModalProps {
  product: ProductBase
  isOpen: boolean
  onClose: () => void
  onAddToBudget: (product: ProductBase, qty: number, unitPrice: number, unitPoints: number, notes: string) => void
}

export function AddToBudgetModal({
  product,
  isOpen,
  onClose,
  onAddToBudget
}: AddToBudgetModalProps) {
  const [qty, setQty] = useState(1)
  const [unitPrice, setUnitPrice] = useState(product?.price_cash || 0)
  const [unitPoints, setUnitPoints] = useState(product?.price_points || 0)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Atualizar preços quando o produto muda
  useEffect(() => {
    if (product) {
      setUnitPrice(product.price_cash)
      setUnitPoints(product.price_points)
    }
  }, [product])

  // Validação
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (qty < 1) {
      newErrors.qty = 'Quantidade deve ser maior que zero'
    }

    if (qty > 1000) {
      newErrors.qty = 'Quantidade máxima é 1000'
    }

    if (unitPrice < 0) {
      newErrors.unitPrice = 'Preço unitário não pode ser negativo'
    }

    if (unitPoints < 0) {
      newErrors.unitPoints = 'Pontos unitários não podem ser negativos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Adicionar ao orçamento
  const handleAddToBudget = () => {
    if (!validateForm()) {
      return
    }

    onAddToBudget(product, qty, unitPrice, unitPoints, notes)
  }

  // Calcular totais
  const subtotalCash = qty * unitPrice
  const subtotalPoints = qty * unitPoints

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Formatar pontos
  const formatPoints = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Adicionar ao Orçamento</span>
          </DialogTitle>
          <DialogDescription>
            Configure quantidade, preços e observações para {product?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Produto Selecionado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{product?.title}</h3>
                  <p className="text-sm text-gray-600">SKU: {product?.sku}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{product?.category}</Badge>
                    <Badge variant={product?.active ? "default" : "secondary"}>
                      {product?.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Item */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Item</CardTitle>
              <CardDescription>
                Defina quantidade, preços e observações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qty">Quantidade *</Label>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    max="1000"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    className={errors.qty ? 'border-red-500' : ''}
                    placeholder="1"
                  />
                  {errors.qty && (
                    <p className="text-sm text-red-500 mt-1">{errors.qty}</p>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Total de Itens</div>
                    <div className="text-2xl font-bold text-blue-600">{qty}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className={errors.unitPrice ? 'border-red-500' : ''}
                    placeholder="0.00"
                  />
                  {errors.unitPrice && (
                    <p className="text-sm text-red-500 mt-1">{errors.unitPrice}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Preço original: {formatCurrency(product?.price_cash || 0)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="unitPoints">Pontos Unitários</Label>
                  <Input
                    id="unitPoints"
                    type="number"
                    min="0"
                    value={unitPoints}
                    onChange={(e) => setUnitPoints(parseInt(e.target.value) || 0)}
                    className={errors.unitPoints ? 'border-red-500' : ''}
                    placeholder="0"
                  />
                  {errors.unitPoints && (
                    <p className="text-sm text-red-500 mt-1">{errors.unitPoints}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Pontos originais: {formatPoints(product?.price_points || 0)}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações especiais para este item..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo e Totais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Resumo do Item</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantidade:</span>
                  <span className="font-medium">{qty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço unitário:</span>
                  <span className="font-medium">{formatCurrency(unitPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pontos unitários:</span>
                  <span className="font-medium">{formatPoints(unitPoints)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Subtotal em Dinheiro:</span>
                  <span className="text-green-600">{formatCurrency(subtotalCash)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Subtotal em Pontos:</span>
                  <span className="text-blue-600">{formatPoints(subtotalPoints)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleAddToBudget}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar ao Orçamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
