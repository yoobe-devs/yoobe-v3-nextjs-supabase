import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Package,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Copy,
  ExternalLink,
} from 'lucide-react'

interface BudgetReplicationProps {
  budgetId: string
  onReplicationComplete?: (products: any[]) => void
  className?: string
}

interface BudgetItem {
  id: string
  base_product_id?: string
  quantity: number
  unit_price: number
  total_price: number
  sku_snapshot?: string
  base_products?: {
    id: string
    name: string
    description?: string
    base_code?: string
    base_price: number
    images?: string[]
    specifications?: Record<string, any>
  }
}

interface Budget {
  id: string
  title: string
  status: string
  company_id: string
  companies?: {
    id: string
    name: string
    client_code?: string
  }
}

interface ReplicatedProduct {
  id: string
  final_sku: string
  ean_13?: string
  name: string
  price: number
}

const statusConfig = {
  pending: {
    icon: RefreshCw,
    color: 'bg-yellow-500',
    label: 'Pendente',
  },
  approved: {
    icon: CheckCircle,
    color: 'bg-green-500',
    label: 'Aprovado',
  },
  rejected: {
    icon: AlertCircle,
    color: 'bg-red-500',
    label: 'Rejeitado',
  },
}

export function BudgetReplication({
  budgetId,
  onReplicationComplete,
  className = '',
}: BudgetReplicationProps) {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [replicating, setReplicating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replicatedProducts, setReplicatedProducts] = useState<
    ReplicatedProduct[]
  >([])
  const [previewSkus, setPreviewSkus] = useState<Record<string, string>>({})

  const fetchBudgetData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar dados do orçamento
      const budgetResponse = await fetch(`/api/gestor/orcamentos/${budgetId}`)
      const budgetResult = await budgetResponse.json()

      if (budgetResult.success) {
        setBudget(budgetResult.data.budget)
      }

      // Buscar itens do orçamento
      const itemsResponse = await fetch(
        `/api/gestor/orcamentos/${budgetId}/items`
      )
      const itemsResult = await itemsResponse.json()

      if (itemsResult.success) {
        setBudgetItems(itemsResult.data.items || [])

        // Gerar preview de SKUs para cada item
        const skuPreviews: Record<string, string> = {}
        for (const item of itemsResult.data.items || []) {
          if (item.base_product_id) {
            try {
              const previewResponse = await fetch(
                `/api/sku/preview?company_id=${budgetResult.data.budget.company_id}&base_product_id=${item.base_product_id}&count=1`
              )
              const previewResult = await previewResponse.json()
              if (
                previewResult.success &&
                previewResult.data.samples.length > 0
              ) {
                skuPreviews[item.id] = previewResult.data.samples[0]
              }
            } catch (err) {
              console.error('Erro ao gerar preview de SKU:', err)
            }
          }
        }
        setPreviewSkus(skuPreviews)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const replicateBudget = async () => {
    try {
      setReplicating(true)
      setError(null)

      const response = await fetch(`/api/budgets/${budgetId}/replicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (result.success) {
        setReplicatedProducts(result.data.replicated_products || [])
        onReplicationComplete?.(result.data.replicated_products || [])
      } else {
        setError(result.error?.message || 'Erro na replicação')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setReplicating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  useEffect(() => {
    if (budgetId) {
      fetchBudgetData()
    }
  }, [budgetId])

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        icon: AlertCircle,
        color: 'bg-gray-500',
        label: status,
      }
    )
  }

  const canReplicate = budget?.status === 'approved' && budgetItems.length > 0

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
            <Button onClick={fetchBudgetData} variant="outline">
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {budget.title}
              </CardTitle>
              <Badge className={getStatusConfig(budget.status).color}>
                {getStatusConfig(budget.status).label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Empresa</p>
                <p className="font-medium">{budget.companies?.name}</p>
                {budget.companies?.client_code && (
                  <p className="text-sm text-gray-500">
                    Código: {budget.companies.client_code}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Itens</p>
                <p className="font-medium">{budgetItems.length} produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de itens com preview de SKU */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Itens para Replicação</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhum item encontrado no orçamento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetItems.map(item => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {item.base_products?.name || 'Produto'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity} • Preço: R${' '}
                        {item.unit_price.toFixed(2)}
                      </p>
                      {item.base_products?.base_code && (
                        <p className="text-xs text-gray-500">
                          Base Code: {item.base_products.base_code}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {item.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Preview do SKU */}
                  {previewSkus[item.id] && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            SKU Preview:
                          </p>
                          <p className="font-mono text-blue-600">
                            {previewSkus[item.id]}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(previewSkus[item.id])}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de replicação */}
      {canReplicate && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <Button
                onClick={replicateBudget}
                disabled={replicating}
                size="lg"
                className="w-full"
              >
                {replicating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Replicando Produtos...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Replicar Produtos
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                {budgetItems.length} produtos serão criados com SKUs únicos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da replicação */}
      {replicatedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Produtos Replicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {replicatedProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      SKU:{' '}
                      <span className="font-mono">{product.final_sku}</span>
                    </p>
                    {product.ean_13 && (
                      <p className="text-sm text-gray-600">
                        EAN-13:{' '}
                        <span className="font-mono">{product.ean_13}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Preço: R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(product.final_sku)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      SKU
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem de status */}
      {!canReplicate && budget && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-yellow-600">
                {budget.status !== 'approved'
                  ? 'Orçamento deve estar aprovado para replicação'
                  : 'Nenhum item encontrado para replicação'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

