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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Eye, Edit, CheckCircle, XCircle, Clock, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Budget {
  id: string
  title: string
  description: string
  total_amount: number
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  admin_notes?: string
  budget_items: BudgetItem[]
}

interface BudgetItem {
  id: string
  base_product_id: string
  quantity: number
  custom_price?: number
  custom_points_cost?: number
  notes?: string
  base_products: {
    id: string
    name: string
    description: string
    base_price: number
    base_points_cost: number
    product_categories: {
      id: string
      name: string
      icon: string
      color: string
    }
  }
}

interface BaseProduct {
  id: string
  name: string
  description: string
  base_price: number
  base_points_cost: number
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

export default function OrcamentosPage() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingBudget, setCreatingBudget] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    items: [] as Array<{
      base_product_id: string
      quantity: number
      custom_price?: number
      custom_points_cost?: number
      notes?: string
    }>
  })

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/gestor/orcamentos')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets || [])
      } else {
        toast.error('Erro ao carregar orçamentos')
      }
    } catch (error) {
      toast.error('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  // Fetch base products
  const fetchBaseProducts = async () => {
    try {
      const response = await fetch('/api/admin/produtos')
      if (response.ok) {
        const data = await response.json()
        setBaseProducts(data.products || [])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos base:', error)
    }
  }

  useEffect(() => {
    fetchBudgets()
    fetchBaseProducts()
  }, [])

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</Badge>
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Button 
          onClick={() => router.push('/gestor/orcamentos/novo')}
          className="flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Budgets List */}
      <div className="grid gap-6">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum orçamento encontrado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie seu primeiro orçamento para começar a usar os produtos do catálogo base.
              </p>
              <Button 
                onClick={() => router.push('/gestor/orcamentos/novo')}
                className="flex items-center gap-2"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4" />
                Criar Primeiro Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {budget.title}
                      {getStatusBadge(budget.status)}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {budget.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {budget.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(budget.submitted_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Items */}
                  <div>
                    <h4 className="font-medium mb-2">Itens do Orçamento</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Preço Unit.</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {budget.budget_items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.base_products.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.base_products.product_categories.name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              R$ {(item.custom_price || item.base_products.base_price).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              R$ {((item.custom_price || item.base_products.base_price) * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {item.notes || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Admin Notes */}
                  {budget.admin_notes && (
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-1">Observações do Administrador</h4>
                      <p className="text-sm text-muted-foreground">{budget.admin_notes}</p>
                    </div>
                  )}

                  {/* Status Info */}
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>
                      <p>Enviado em: {new Date(budget.submitted_at).toLocaleString('pt-BR')}</p>
                      {budget.reviewed_at && (
                        <p>Revisado em: {new Date(budget.reviewed_at).toLocaleString('pt-BR')}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {budget.status === 'approved' && (
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Produtos
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


