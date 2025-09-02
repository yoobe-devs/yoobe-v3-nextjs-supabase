'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  DollarSign,
  Star,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BaseProduct {
  id: string
  name: string
  description: string
  base_price: number
  base_points_cost: number
  image_url: string
  status: string
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface BudgetItem {
  base_product_id: string
  quantity: number
  custom_price?: number
  custom_points_cost?: number
  notes?: string
  base_product: BaseProduct
}

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingBudget, setCreatingBudget] = useState(false)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  // Fetch base products
  const fetchBaseProducts = async () => {
    try {
      const response = await fetch('/api/gestor/base-products')
      if (response.ok) {
        const data = await response.json()
        setBaseProducts(data.products || [])
      } else {
        toast.error('Erro ao carregar produtos base')
      }
    } catch (error) {
      toast.error('Erro ao carregar produtos base')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBaseProducts()
  }, [])

  // Add product to budget
  const addToBudget = (product: BaseProduct) => {
    const existingItem = budgetItems.find(item => item.base_product_id === product.id)
    
    if (existingItem) {
      setBudgetItems(prev => prev.map(item => 
        item.base_product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setBudgetItems(prev => [...prev, {
        base_product_id: product.id,
        quantity: 1,
        custom_price: undefined,
        custom_points_cost: undefined,
        notes: '',
        base_product: product
      }])
    }
    
    toast.success(`${product.name} adicionado ao orçamento`)
  }

  // Update budget item
  const updateBudgetItem = (productId: string, field: string, value: any) => {
    setBudgetItems(prev => prev.map(item => 
      item.base_product_id === productId 
        ? { ...item, [field]: value }
        : item
    ))
  }

  // Remove from budget
  const removeFromBudget = (productId: string) => {
    setBudgetItems(prev => prev.filter(item => item.base_product_id !== productId))
    toast.success('Produto removido do orçamento')
  }

  // Calculate totals
  const calculateTotals = () => {
    return budgetItems.reduce((totals, item) => {
      const price = item.custom_price || item.base_product.base_price
      const points = item.custom_points_cost || item.base_product.base_points_cost
      
      return {
        totalPrice: totals.totalPrice + (price * item.quantity),
        totalPoints: totals.totalPoints + (points * item.quantity)
      }
    }, { totalPrice: 0, totalPoints: 0 })
  }

  // Create budget
  const handleCreateBudget = async () => {
    if (!formData.title || budgetItems.length === 0) {
      toast.error('Título e pelo menos um item são obrigatórios')
      return
    }

    setCreatingBudget(true)
    try {
      const budgetData = {
        title: formData.title,
        description: formData.description,
        items: budgetItems.map(item => ({
          base_product_id: item.base_product_id,
          quantity: item.quantity,
          custom_price: item.custom_price,
          custom_points_cost: item.custom_points_cost,
          notes: item.notes
        }))
      }

      const response = await fetch('/api/gestor/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData)
      })

      if (response.ok) {
        toast.success('Orçamento criado com sucesso!')
        router.push('/gestor/orcamentos')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao criar orçamento')
      }
    } catch (error) {
      toast.error('Erro ao criar orçamento')
    } finally {
      setCreatingBudget(false)
    }
  }

  const { totalPrice, totalPoints } = calculateTotals()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Criar Novo Orçamento</h1>
          <p className="text-muted-foreground">
            Adicione produtos ao seu orçamento
          </p>
        </div>
      </div>

      {/* Empty State */}
      {baseProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto disponível no catálogo base</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Aguarde a disponibilização pelo Admin Global.
            </p>
            <Button 
              onClick={() => router.push('/gestor/orcamentos')}
              variant="outline"
            >
              Voltar aos Orçamentos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {baseProducts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Catalog */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {baseProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square bg-gray-100 relative">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge 
                            variant="outline" 
                            style={{ 
                              backgroundColor: product.product_categories.color + '20',
                              color: product.product_categories.color
                            }}
                          >
                            {product.product_categories.name}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Preço:</span>
                            <span className="font-medium">R$ {product.base_price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Pontos:</span>
                            <span className="font-medium">{product.base_points_cost}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => addToBudget(product)}
                          className="w-full flex items-center gap-2"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                          Orçar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {budgetItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum produto adicionado</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Selecione produtos do catálogo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Budget Items */}
                    {budgetItems.map((item) => (
                      <div key={item.base_product_id} className="border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            {item.base_product.image_url ? (
                              <img
                                src={item.base_product.image_url}
                                alt={item.base_product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {item.base_product.name}
                            </h4>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateBudgetItem(item.base_product_id, 'quantity', Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateBudgetItem(item.base_product_id, 'quantity', item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Custom Price */}
                            <div className="mt-2">
                              <Label className="text-xs text-gray-500">Preço customizado (opcional)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={`R$ ${item.base_product.base_price}`}
                                value={item.custom_price || ''}
                                onChange={(e) => updateBudgetItem(item.base_product_id, 'custom_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="h-8 text-sm"
                              />
                            </div>

                            {/* Custom Points */}
                            <div className="mt-2">
                              <Label className="text-xs text-gray-500">Pontos customizados (opcional)</Label>
                              <Input
                                type="number"
                                placeholder={`${item.base_product.base_points_cost} pontos`}
                                value={item.custom_points_cost || ''}
                                onChange={(e) => updateBudgetItem(item.base_product_id, 'custom_points_cost', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="h-8 text-sm"
                              />
                            </div>

                            {/* Notes */}
                            <div className="mt-2">
                              <Label className="text-xs text-gray-500">Observações (opcional)</Label>
                              <Textarea
                                placeholder="Observações sobre este item..."
                                value={item.notes || ''}
                                onChange={(e) => updateBudgetItem(item.base_product_id, 'notes', e.target.value)}
                                className="h-16 text-sm resize-none"
                              />
                            </div>

                            {/* Item Total */}
                            <div className="mt-2 text-right">
                              <p className="text-sm font-medium">
                                R$ {((item.custom_price || item.base_product.base_price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromBudget(item.base_product_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Budget Summary */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span className="font-semibold">R$ {totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pontos:</span>
                        <span className="font-semibold">{totalPoints}</span>
                      </div>
                    </div>

                    {/* Budget Form */}
                    <div className="space-y-3 pt-4">
                      <div>
                        <Label htmlFor="title">Título do Orçamento *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Orçamento para brindes corporativos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o objetivo do orçamento..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateBudget}
                        disabled={creatingBudget || !formData.title || budgetItems.length === 0}
                        className="flex-1"
                      >
                        {creatingBudget ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Criando...
                          </>
                        ) : (
                          'Criar Orçamento'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
