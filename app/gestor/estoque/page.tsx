'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Warehouse,
  Truck,
  Zap
} from 'lucide-react'

interface StockItem {
  id: string
  sku: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  totalValue: number
  lastUpdated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  warehouse: string
  supplier: string
  cubboSync: boolean
  lastCubboUpdate: string
}

export default function EstoquePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: '1',
      sku: 'CAM-001',
      name: 'Camiseta Join Tech - M',
      category: 'Vestuário',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 25.00,
      totalValue: 1125.00,
      lastUpdated: '2025-01-02T10:30:00Z',
      status: 'in_stock',
      warehouse: 'São Paulo - Centro',
      supplier: 'Fornecedor A',
      cubboSync: true,
      lastCubboUpdate: '2025-01-02T09:15:00Z'
    },
    {
      id: '2',
      sku: 'CAN-002',
      name: 'Caneca Join Tech - 350ml',
      category: 'Acessórios',
      currentStock: 12,
      minStock: 15,
      maxStock: 80,
      unitCost: 8.50,
      totalValue: 102.00,
      lastUpdated: '2025-01-02T10:30:00Z',
      status: 'low_stock',
      warehouse: 'São Paulo - Centro',
      supplier: 'Fornecedor B',
      cubboSync: true,
      lastCubboUpdate: '2025-01-02T08:45:00Z'
    },
    {
      id: '3',
      sku: 'MOCH-003',
      name: 'Mochila Join Tech - Escolar',
      category: 'Bolsas',
      currentStock: 0,
      minStock: 10,
      maxStock: 50,
      unitCost: 45.00,
      totalValue: 0.00,
      lastUpdated: '2025-01-02T10:30:00Z',
      status: 'out_of_stock',
      warehouse: 'São Paulo - Centro',
      supplier: 'Fornecedor C',
      cubboSync: false,
      lastCubboUpdate: '2024-12-28T14:20:00Z'
    },
    {
      id: '4',
      sku: 'USB-004',
      name: 'Pen Drive Join Tech - 32GB',
      category: 'Tecnologia',
      currentStock: 150,
      minStock: 30,
      maxStock: 100,
      unitCost: 12.00,
      totalValue: 1800.00,
      lastUpdated: '2025-01-02T10:30:00Z',
      status: 'overstock',
      warehouse: 'São Paulo - Centro',
      supplier: 'Fornecedor D',
      cubboSync: true,
      lastCubboUpdate: '2025-01-02T10:00:00Z'
    }
  ])

  const categories = ['Vestuário', 'Acessórios', 'Bolsas', 'Tecnologia', 'Papelaria']
  const statuses = ['in_stock', 'low_stock', 'out_of_stock', 'overstock']

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'overstock': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="h-4 w-4" />
      case 'low_stock': return <AlertTriangle className="h-4 w-4" />
      case 'out_of_stock': return <Package className="h-4 w-4" />
      case 'overstock': return <TrendingUp className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Em Estoque'
      case 'low_stock': return 'Estoque Baixo'
      case 'out_of_stock': return 'Sem Estoque'
      case 'overstock': return 'Excesso'
      default: return status
    }
  }

  const syncWithCubbo = async () => {
    setIsLoading(true)
    try {
      // Simular chamada à API do Cubbo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Atualizar dados simulados
      setStockItems(prev => prev.map(item => ({
        ...item,
        lastCubboUpdate: new Date().toISOString(),
        cubboSync: true
      })))
      
      // Mostrar toast de sucesso
      console.log('Sincronização com Cubbo realizada com sucesso!')
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportStock = () => {
    const csvContent = [
      ['SKU', 'Nome', 'Categoria', 'Estoque Atual', 'Estoque Mínimo', 'Valor Unitário', 'Valor Total', 'Status', 'Armazém'],
      ...stockItems.map(item => [
        item.sku,
        item.name,
        item.category,
        item.currentStock.toString(),
        item.minStock.toString(),
        `R$ ${item.unitCost.toFixed(2)}`,
        `R$ ${item.totalValue.toFixed(2)}`,
        getStatusText(item.status),
        item.warehouse
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estoque-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0)
  const lowStockItems = stockItems.filter(item => item.status === 'low_stock').length
  const outOfStockItems = stockItems.filter(item => item.status === 'out_of_stock').length
  const totalItems = stockItems.reduce((sum, item) => sum + item.currentStock, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600">Controle de estoque integrado com Cubbo e gestão de produtos.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={syncWithCubbo} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Sincronizar Cubbo'}
          </Button>
          <Button variant="outline" onClick={exportStock}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              {stockItems.length} itens em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Unidades disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Precisa reabastecer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Urgente reabastecer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Encontre itens específicos rapidamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por SKU ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{getStatusText(status)}</option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Itens em Estoque ({filteredItems.length})</CardTitle>
          <CardDescription>Lista completa de produtos e estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs text-gray-500">
                        <Warehouse className="h-3 w-3 mr-1" />
                        {item.warehouse}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        {item.category}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        Fornecedor: {item.supplier}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {item.currentStock} / {item.maxStock}
                    </div>
                    <p className="text-xs text-gray-500">
                      Mín: {item.minStock}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      R$ {item.unitCost.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Total: R$ {item.totalValue.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Atualizado: {new Date(item.lastUpdated).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={item.cubboSync ? "default" : "secondary"}>
                        <Zap className="h-3 w-3 mr-1" />
                        {item.cubboSync ? 'Sincronizado' : 'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Cubbo: {new Date(item.lastCubboUpdate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Truck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerenciar estoque e sincronização</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              <span>Novo Item</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="h-6 w-6 mb-2" />
              <span>Importar</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Relatórios</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span>Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
