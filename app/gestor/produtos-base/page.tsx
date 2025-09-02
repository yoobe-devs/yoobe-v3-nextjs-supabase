'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Eye, Copy, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BaseProduct {
  id: string
  name: string
  description: string
  base_price: number
  base_points_cost: number
  status: string
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface Budget {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected'
  budget_items: Array<{
    base_product_id: string
    quantity: number
    custom_price?: number
  }>
}

export default function ProdutosBasePage() {
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [replicatingProduct, setReplicatingProduct] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<BaseProduct | null>(null)
  
  // Replication form state
  const [replicationForm, setReplicationForm] = useState({
    custom_price: '',
    custom_points_cost: '',
    stock_quantity: '50',
    notes: ''
  })

  // Fetch base products
  const fetchBaseProducts = async () => {
    try {
      const response = await fetch('/api/admin/produtos')
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

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/gestor/orcamentos')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets || [])
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  useEffect(() => {
    fetchBaseProducts()
    fetchBudgets()
    fetchCategories()
  }, [])

  // Check if product can be replicated
  const canReplicateProduct = (productId: string) => {
    const approvedBudget = budgets.find(budget => budget.status === 'approved')
    if (!approvedBudget) return false
    
    return approvedBudget.budget_items.some(item => item.base_product_id === productId)
  }

  // Get approved budget for product
  const getApprovedBudgetForProduct = (productId: string) => {
    return budgets.find(budget => 
      budget.status === 'approved' && 
      budget.budget_items.some(item => item.base_product_id === productId)
    )
  }

  // Replicate product
  const handleReplicateProduct = async (productId: string) => {
    const approvedBudget = getApprovedBudgetForProduct(productId)
    if (!approvedBudget) {
      toast.error('Nenhum orçamento aprovado para este produto')
      return
    }

    setReplicatingProduct(productId)
    try {
      const response = await fetch(`/api/gestor/base-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_product_id: productId,
          custom_price: replicationForm.custom_price ? parseFloat(replicationForm.custom_price) : undefined,
          custom_points_cost: replicationForm.custom_points_cost ? parseInt(replicationForm.custom_points_cost) : undefined,
          stock_quantity: parseInt(replicationForm.stock_quantity),
          notes: replicationForm.notes
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Produto replicado com sucesso!')
        setReplicationForm({
          custom_price: '',
          custom_points_cost: '',
          stock_quantity: '50',
          notes: ''
        })
        setSelectedProduct(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao replicar produto')
      }
    } catch (error) {
      toast.error('Erro ao replicar produto')
    } finally {
      setReplicatingProduct(null)
    }
  }

  // Filter products
  const filteredProducts = baseProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.product_categories.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Carregando produtos base...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos Base</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e replique produtos do catálogo base após aprovação de orçamento
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar produtos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} produto(s) encontrado(s)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const canReplicate = canReplicateProduct(product.id)
          const approvedBudget = getApprovedBudgetForProduct(product.id)
          
          return (
            <Card key={product.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      style={{ backgroundColor: product.product_categories.color + '20', color: product.product_categories.color }}
                    >
                      {product.product_categories.name}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {product.base_price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{product.base_points_cost} pontos</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{product.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Categoria</Label>
                          <p className="text-sm text-muted-foreground">{product.product_categories.name}</p>
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Preço Base</Label>
                            <p className="text-lg font-semibold">R$ {product.base_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <Label>Pontos Base</Label>
                            <p className="text-lg font-semibold">{product.base_points_cost}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {canReplicate ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1">
                          <Copy className="w-4 h-4 mr-1" />
                          Replicar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Replicar Produto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Produto</Label>
                            <p className="text-sm text-muted-foreground">{product.name}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="custom_price">Preço Customizado (opcional)</Label>
                              <Input
                                id="custom_price"
                                type="number"
                                step="0.01"
                                value={replicationForm.custom_price}
                                onChange={(e) => setReplicationForm(prev => ({ ...prev, custom_price: e.target.value }))}
                                placeholder={`R$ ${product.base_price}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor="custom_points">Pontos Customizados (opcional)</Label>
                              <Input
                                id="custom_points"
                                type="number"
                                value={replicationForm.custom_points_cost}
                                onChange={(e) => setReplicationForm(prev => ({ ...prev, custom_points_cost: e.target.value }))}
                                placeholder={product.base_points_cost.toString()}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
                            <Input
                              id="stock_quantity"
                              type="number"
                              min="1"
                              value={replicationForm.stock_quantity}
                              onChange={(e) => setReplicationForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="notes">Observações (opcional)</Label>
                            <Textarea
                              id="notes"
                              value={replicationForm.notes}
                              onChange={(e) => setReplicationForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Observações sobre este produto..."
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setReplicationForm({
                                custom_price: '',
                                custom_points_cost: '',
                                stock_quantity: '50',
                                notes: ''
                              })}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => handleReplicateProduct(product.id)}
                              disabled={replicatingProduct === product.id}
                            >
                              {replicatingProduct === product.id ? 'Replicando...' : 'Replicar Produto'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      <XCircle className="w-4 h-4 mr-1" />
                      Aguardando Aprovação
                    </Button>
                  )}
                </div>

                {approvedBudget && (
                  <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Aprovado no orçamento: {approvedBudget.title}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente ajustar os filtros de busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
