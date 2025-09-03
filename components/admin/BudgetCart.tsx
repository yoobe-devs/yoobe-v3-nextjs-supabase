'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle
} from 'lucide-react'

interface BudgetItem {
  product_id: string
  sku: string
  title: string
  qty: number
  unit_price: number
  unit_points: number
  notes: string
  subtotal_cash: number
  subtotal_points: number
}

interface BudgetCartProps {
  isOpen: boolean
  onClose: () => void
  items: BudgetItem[]
  totals: {
    totalCash: number
    totalPoints: number
    totalItems: number
  }
  onRemoveItem: (productId: string) => void
  onUpdateQty: (productId: string, newQty: number) => void
  onCreateBudget: () => void
}

export function BudgetCart({
  isOpen,
  onClose,
  items,
  totals,
  onRemoveItem,
  onUpdateQty,
  onCreateBudget
}: BudgetCartProps) {
  const [isCreating, setIsCreating] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPoints = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const handleCreateBudget = async () => {
    setIsCreating(true)
    try {
      await onCreateBudget()
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Carrinho de Orçamento</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Carrinho vazio</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Adicione produtos para criar um orçamento
                </p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.product_id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {item.title}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                            
                            {/* Preços */}
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-xs text-green-600 font-medium">
                                {formatCurrency(item.unit_price)}/un
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                {formatPoints(item.unit_points)} pts/un
                              </span>
                            </div>

                            {/* Observações */}
                            {item.notes && (
                              <p className="text-xs text-gray-600 mt-1 italic">
                                "{item.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end space-y-2 ml-3">
                            {/* Quantidade */}
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateQty(item.product_id, Math.max(1, item.qty - 1))}
                                disabled={item.qty <= 1}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max="1000"
                                value={item.qty}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1
                                  onUpdateQty(item.product_id, Math.max(1, Math.min(1000, newQty)))
                                }}
                                className="w-16 h-6 text-center text-xs"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateQty(item.product_id, item.qty + 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                {formatCurrency(item.subtotal_cash)}
                              </div>
                              <div className="text-xs text-blue-600">
                                {formatPoints(item.subtotal_points)} pts
                              </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(item.product_id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resumo do Orçamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de Itens:</span>
                      <span className="font-medium">{totals.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Produtos Únicos:</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total em Dinheiro:</span>
                      <span className="text-green-600">{formatCurrency(totals.totalCash)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total em Pontos:</span>
                      <span className="text-blue-600">{formatPoints(totals.totalPoints)}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <Button 
                onClick={handleCreateBudget}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Criando Orçamento...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Criar Orçamento
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Ao criar o orçamento, você será redirecionado para a página de detalhes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
