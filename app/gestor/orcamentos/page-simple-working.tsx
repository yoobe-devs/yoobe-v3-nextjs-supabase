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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Edit,
  Trash2,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'

interface BudgetItem {
  id?: string
  base_product_id: string
  quantity: number
  unit_price: number
  custom_price?: number
  custom_points_cost?: number
  notes?: string
  base_products?: {
    id: string
    name: string
    base_price: number
  }
}

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  submitted_at?: string
  budget_items: BudgetItem[]
}

interface Product {
  id: string
  name: string
  base_price: number
  base_points_cost?: number
  description?: string
  image_url?: string
  category_id?: string
  product_categories?: {
    name: string
  }
}

export default function GestorOrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'budgets' | 'catalog'>('budgets')

  // Dados mock para desenvolvimento
  const mockBudgets: Budget[] = [
    {
      id: '1',
      title: 'Orçamento Q1 2024',
      description: 'Produtos para primeiro trimestre',
      total_amount: 1500.0,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      budget_items: [
        {
          id: '1',
          base_product_id: '1',
          quantity: 10,
          unit_price: 25.0,
          base_products: {
            id: '1',
            name: 'Camiseta Corporativa',
            base_price: 25.0,
          },
        },
        {
          id: '2',
          base_product_id: '2',
          quantity: 20,
          unit_price: 15.0,
          base_products: {
            id: '2',
            name: 'Caneca Personalizada',
            base_price: 15.0,
          },
        },
      ],
    },
    {
      id: '2',
      title: 'Orçamento Q2 2024',
      description: 'Produtos para segundo trimestre',
      total_amount: 2800.0,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      budget_items: [
        {
          id: '3',
          base_product_id: '3',
          quantity: 5,
          unit_price: 45.0,
          base_products: {
            id: '3',
            name: 'Power Bank',
            base_price: 45.0,
          },
        },
        {
          id: '4',
          base_product_id: '4',
          quantity: 8,
          unit_price: 35.0,
          base_products: {
            id: '4',
            name: 'Garrafa Térmica',
            base_price: 35.0,
          },
        },
      ],
    },
  ]

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Camiseta Corporativa',
      base_price: 25.0,
      base_points_cost: 100,
      description: 'Camiseta de algodão com logo da empresa',
      image_url: '/placeholder-product.jpg',
      product_categories: { name: 'Vestuário' },
    },
    {
      id: '2',
      name: 'Caneca Personalizada',
      base_price: 15.0,
      base_points_cost: 60,
      description: 'Caneca de cerâmica personalizada',
      image_url: '/placeholder-product.jpg',
      product_categories: { name: 'Casa' },
    },
    {
      id: '3',
      name: 'Power Bank',
      base_price: 45.0,
      base_points_cost: 180,
      description: 'Carregador portátil 10000mAh',
      image_url: '/placeholder-product.jpg',
      product_categories: { name: 'Eletrônicos' },
    },
    {
      id: '4',
      name: 'Garrafa Térmica',
      base_price: 35.0,
      base_points_cost: 140,
      description: 'Garrafa térmica inox 500ml',
      image_url: '/placeholder-product.jpg',
      product_categories: { name: 'Casa' },
    },
    {
      id: '5',
      name: 'Mochila Executiva',
      base_price: 80.0,
      base_points_cost: 320,
      description: 'Mochila para notebook e documentos',
      image_url: '/placeholder-product.jpg',
      product_categories: { name: 'Acessórios' },
    },
  ]

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setBudgets(mockBudgets)
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      (statusFilter || 'all') === 'all' || budget.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleCreateBudget = () => {
    toast.success('Funcionalidade de criação será implementada em breve!')
  }

  const handleEditBudget = (budgetId: string) => {
    toast.success(`Editando orçamento ${budgetId}`)
  }

  const handleDeleteBudget = (budget: Budget) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      setBudgets(prev => prev.filter(b => b.id !== budget.id))
      toast.success('Orçamento excluído com sucesso!')
    }
  }

  const handleSubmitBudget = (budgetId: string) => {
    setBudgets(prev =>
      prev.map(b =>
        b.id === budgetId
          ? {
              ...b,
              status: 'pending' as const,
              submitted_at: new Date().toISOString(),
            }
          : b
      )
    )
    toast.success('Orçamento enviado com sucesso!')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando orçamentos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">
            Gerencie seus orçamentos e solicitações
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-100 text-blue-800">
            Modo Desenvolvimento
          </Badge>
          <Button onClick={handleCreateBudget}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'budgets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Orçamentos
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'catalog'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Catálogo
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'budgets' && (
        <>
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={statusFilter || 'all'}
              onChange={e => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 w-48"
            >
              <option value="all">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>

          {/* Lista de Orçamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBudgets.map(budget => (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{budget.title}</CardTitle>
                    {getStatusBadge(budget.status)}
                  </div>
                  <CardDescription>
                    {budget.description || 'Sem descrição'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      R${' '}
                      {budget.total_amount.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{budget.budget_items.length} itens</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(budget.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBudget(budget.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    {budget.status === 'draft' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmitBudget(budget.id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Submeter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBudget(budget)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBudgets.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro orçamento'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleCreateBudget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Orçamento
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Produtos</CardTitle>
              <CardDescription>
                Produtos disponíveis para orçamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <Card key={product.id} className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600">
                          R$ {product.base_price.toFixed(2)}
                        </span>
                        <Badge variant="outline">
                          {product.product_categories?.name}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
