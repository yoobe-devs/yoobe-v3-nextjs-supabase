'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import {
  Package,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'

interface ReplicatedProduct {
  id: string
  name: string
  price: number
  points_cost: number
  quantity_available: number
  is_active: boolean
  source: string
  budget_id: string
  created_at: string
  updated_at: string
  budgets: {
    id: string
    title: string
    status: string
    total_amount: number
  }
}

export default function ProdutosReplicadosPage() {
  const [products, setProducts] = useState<ReplicatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [budgetFilter, setBudgetFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gestor/products/replicated')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      } else {
        console.error('Erro ao carregar produtos replicados')
        setProducts([])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos replicados:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      setUpdating(productId)
      const response = await fetch('/api/gestor/products/replicated', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          is_active: isActive,
        }),
      })

      if (response.ok) {
        toast.success(
          `Produto ${isActive ? 'ativado' : 'desativado'} com sucesso`
        )
        await loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar produto')
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      toast.error('Erro ao atualizar produto')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
    )
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active)
    const matchesBudget =
      budgetFilter === 'all' || product.budget_id === budgetFilter

    return matchesSearch && matchesStatus && matchesBudget
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    total_value: products.reduce(
      (sum, p) => sum + p.price * p.quantity_available,
      0
    ),
  }

  const uniqueBudgets = Array.from(new Set(products.map(p => p.budget_id))).map(
    budgetId => {
      const product = products.find(p => p.budget_id === budgetId)
      return {
        id: budgetId,
        title: product?.budgets?.title || 'Orçamento Desconhecido',
      }
    }
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando produtos replicados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Produtos Replicados
          </h1>
          <p className="text-gray-600">
            Produtos ativados a partir de orçamentos aprovados
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por orçamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os orçamentos</SelectItem>
            {uniqueBudgets.map(budget => (
              <SelectItem key={budget.id} value={budget.id}>
                {budget.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Replicados</CardTitle>
          <CardDescription>
            {filteredProducts.length} produto(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.points_cost} pontos
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {product.budgets?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.budgets?.status}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {product.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>{product.quantity_available} unidades</TableCell>
                  <TableCell>{getStatusBadge(product.is_active)}</TableCell>
                  <TableCell>
                    {new Date(product.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={product.is_active}
                        onCheckedChange={checked =>
                          handleToggleActive(product.id, checked)
                        }
                        disabled={updating === product.id}
                      />
                      {updating === product.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
