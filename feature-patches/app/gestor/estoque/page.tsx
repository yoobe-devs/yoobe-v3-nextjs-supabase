'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Zap,
  Save,
  X,
  Minus,
  Plus as PlusIcon,
  Activity,
  Database,
  Cloud,
  HardDrive,
  Lock,
  Unlock,
} from 'lucide-react'
import { toast } from 'sonner'

interface StockItem {
  id: string
  product_id: string
  name: string
  sku: string
  category: string
  physical_qty: number
  virtual_qty: number
  reserved_qty: number
  available_qty: number
  min_stock: number
  max_stock: number
  unit_cost: number
  total_value: number
  last_updated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  warehouse: string
  supplier: string
  cubbo_sync: boolean
  last_cubbo_update: string
  low_stock_threshold: number
  allow_virtual: boolean
}

interface StockStats {
  totalProducts: number
  totalPhysical: number
  totalVirtual: number
  totalReserved: number
  totalAvailable: number
  lowStockProducts: number
  outOfStockProducts: number
  totalValue: number
}

export default function EstoquePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stats, setStats] = useState<StockStats>({
    totalProducts: 0,
    totalPhysical: 0,
    totalVirtual: 0,
    totalReserved: 0,
    totalAvailable: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0,
  })
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<
    'none' | 'adjust' | 'reserve' | 'release'
  >('none')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadStockData()
  }, [])

  const loadStockData = async () => {
    try {
      setIsLoading(true)

      // Simular dados de estoque avançado
      const mockData: StockItem[] = [
        {
          id: '1',
          product_id: 'prod-1',
          name: 'Camiseta Corporativa - M',
          sku: 'CAM-001',
          category: 'Vestuário',
          physical_qty: 45,
          virtual_qty: 50,
          reserved_qty: 5,
          available_qty: 40,
          min_stock: 20,
          max_stock: 100,
          unit_cost: 25.0,
          total_value: 1125.0,
          last_updated: '2025-01-02T10:30:00Z',
          status: 'in_stock',
          warehouse: 'São Paulo - Centro',
          supplier: 'Fornecedor A',
          cubbo_sync: true,
          last_cubbo_update: '2025-01-02T09:15:00Z',
          low_stock_threshold: 20,
          allow_virtual: true,
        },
        {
          id: '2',
          product_id: 'prod-2',
          name: 'Caneca Corporativa - 350ml',
          sku: 'CAN-002',
          category: 'Acessórios',
          physical_qty: 12,
          virtual_qty: 15,
          reserved_qty: 3,
          available_qty: 9,
          min_stock: 15,
          max_stock: 80,
          unit_cost: 8.5,
          total_value: 102.0,
          last_updated: '2025-01-02T10:30:00Z',
          status: 'low_stock',
          warehouse: 'São Paulo - Centro',
          supplier: 'Fornecedor B',
          cubbo_sync: true,
          last_cubbo_update: '2025-01-02T08:45:00Z',
          low_stock_threshold: 15,
          allow_virtual: true,
        },
        {
          id: '3',
          product_id: 'prod-3',
          name: 'Mochila Corporativa - Escolar',
          sku: 'MOCH-003',
          category: 'Bolsas',
          physical_qty: 0,
          virtual_qty: 0,
          reserved_qty: 0,
          available_qty: 0,
          min_stock: 10,
          max_stock: 50,
          unit_cost: 45.0,
          total_value: 0.0,
          last_updated: '2025-01-02T10:30:00Z',
          status: 'out_of_stock',
          warehouse: 'São Paulo - Centro',
          supplier: 'Fornecedor C',
          cubbo_sync: false,
          last_cubbo_update: '2025-01-01T14:20:00Z',
          low_stock_threshold: 10,
          allow_virtual: false,
        },
        {
          id: '4',
          product_id: 'prod-4',
          name: 'Mousepad Corporativo - Gamer',
          sku: 'MP-004',
          category: 'Acessórios',
          physical_qty: 120,
          virtual_qty: 100,
          reserved_qty: 20,
          available_qty: 100,
          min_stock: 30,
          max_stock: 150,
          unit_cost: 15.0,
          total_value: 1800.0,
          last_updated: '2025-01-02T10:30:00Z',
          status: 'overstock',
          warehouse: 'São Paulo - Centro',
          supplier: 'Fornecedor D',
          cubbo_sync: true,
          last_cubbo_update: '2025-01-02T10:00:00Z',
          low_stock_threshold: 30,
          allow_virtual: true,
        },
      ]

      setStockItems(mockData)
      calculateStats(mockData)
    } catch (error) {
      console.error('Erro ao carregar dados de estoque:', error)
      toast.error('Erro ao carregar dados de estoque')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (items: StockItem[]) => {
    const stats: StockStats = {
      totalProducts: items.length,
      totalPhysical: items.reduce((sum, item) => sum + item.physical_qty, 0),
      totalVirtual: items.reduce((sum, item) => sum + item.virtual_qty, 0),
      totalReserved: items.reduce((sum, item) => sum + item.reserved_qty, 0),
      totalAvailable: items.reduce((sum, item) => sum + item.available_qty, 0),
      lowStockProducts: items.filter(
        item => item.available_qty <= item.low_stock_threshold
      ).length,
      outOfStockProducts: items.filter(item => item.available_qty === 0).length,
      totalValue: items.reduce(
        (sum, item) => sum + item.available_qty * item.unit_cost,
        0
      ),
    }
    setStats(stats)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      case 'overstock':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4" />
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />
      case 'out_of_stock':
        return <Package className="h-4 w-4" />
      case 'overstock':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'Em Estoque'
      case 'low_stock':
        return 'Estoque Baixo'
      case 'out_of_stock':
        return 'Sem Estoque'
      case 'overstock':
        return 'Excesso'
      default:
        return status
    }
  }

  const syncWithCubbo = async () => {
    setSyncLoading(true)
    try {
      // Simular chamada à API do Cubbo
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Atualizar dados simulados
      setStockItems(prev =>
        prev.map(item => ({
          ...item,
          last_cubbo_update: new Date().toISOString(),
          cubbo_sync: true,
        }))
      )

      toast.success('Sincronização com Cubbo realizada com sucesso!')
    } catch (error) {
      console.error('Erro na sincronização:', error)
      toast.error('Erro na sincronização com Cubbo')
    } finally {
      setSyncLoading(false)
    }
  }

  const handleEditStock = (item: StockItem) => {
    setEditingItem(item)
    setEditDialogOpen(true)
  }

  const handleSaveStock = async () => {
    if (!editingItem) return

    try {
      // Simular atualização no banco
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStockItems(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...editingItem, last_updated: new Date().toISOString() }
            : item
        )
      )

      calculateStats(
        stockItems.map(item =>
          item.id === editingItem.id
            ? { ...editingItem, last_updated: new Date().toISOString() }
            : item
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)
      toast.success('Estoque atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error)
      toast.error('Erro ao atualizar estoque')
    }
  }

  const handleBulkOperation = async (operation: string, value: number) => {
    if (selectedItems.size === 0) {
      toast.error('Selecione pelo menos um item')
      return
    }

    try {
      // Simular operação em lote
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStockItems(prev =>
        prev.map(item => {
          if (selectedItems.has(item.id)) {
            let newItem = { ...item }
            switch (operation) {
              case 'adjust_physical':
                newItem.physical_qty = Math.max(0, newItem.physical_qty + value)
                break
              case 'adjust_virtual':
                newItem.virtual_qty = Math.max(0, newItem.virtual_qty + value)
                break
              case 'reserve':
                newItem.reserved_qty = Math.max(0, newItem.reserved_qty + value)
                break
              case 'release':
                newItem.reserved_qty = Math.max(0, newItem.reserved_qty - value)
                break
            }
            newItem.available_qty =
              newItem.physical_qty + newItem.virtual_qty - newItem.reserved_qty
            newItem.last_updated = new Date().toISOString()
            return newItem
          }
          return item
        })
      )

      setSelectedItems(new Set())
      setBulkOperation('none')
      toast.success(`Operação em lote realizada em ${selectedItems.size} itens`)
    } catch (error) {
      console.error('Erro na operação em lote:', error)
      toast.error('Erro na operação em lote')
    }
  }

  const exportStock = () => {
    const csvContent = [
      [
        'SKU',
        'Nome',
        'Categoria',
        'Estoque Físico',
        'Estoque Virtual',
        'Reservado',
        'Disponível',
        'Estoque Mínimo',
        'Valor Unitário',
        'Valor Total',
        'Status',
        'Armazém',
        'Sincronizado Cubbo',
      ],
      ...stockItems.map(item => [
        item.sku,
        item.name,
        item.category,
        item.physical_qty.toString(),
        item.virtual_qty.toString(),
        item.reserved_qty.toString(),
        item.available_qty.toString(),
        item.min_stock.toString(),
        `R$ ${item.unit_cost.toFixed(2)}`,
        `R$ ${(item.available_qty * item.unit_cost).toFixed(2)}`,
        getStatusText(item.status),
        item.warehouse,
        item.cubbo_sync ? 'Sim' : 'Não',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `estoque_${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredItems = stockItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory
    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando estoque...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Controle de Estoque Avançado
          </h1>
          <p className="text-gray-600">
            Gerencie estoque físico, virtual e reservado com sincronização Cubbo
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={syncWithCubbo}
            disabled={syncLoading}
          >
            <Zap
              className={`h-4 w-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`}
            />
            {syncLoading ? 'Sincronizando...' : 'Sincronizar Cubbo'}
          </Button>
          <Button onClick={exportStock}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estoque Físico
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhysical}</div>
            <p className="text-xs text-muted-foreground">
              Unidades em estoque físico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estoque Virtual
            </CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVirtual}</div>
            <p className="text-xs text-muted-foreground">
              Unidades em estoque virtual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalAvailable}
            </div>
            <p className="text-xs text-muted-foreground">
              Unidades disponíveis para venda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservado</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalReserved}
            </div>
            <p className="text-xs text-muted-foreground">Unidades reservadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lowStockProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStockProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos sem estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${' '}
              {stats.totalValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor do estoque disponível
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Operações em Lote</CardTitle>
          <CardDescription>
            Filtre produtos e realize operações em lote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="Vestuário">Vestuário</SelectItem>
                <SelectItem value="Acessórios">Acessórios</SelectItem>
                <SelectItem value="Bolsas">Bolsas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="in_stock">Em Estoque</SelectItem>
                <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                <SelectItem value="overstock">Excesso</SelectItem>
              </SelectContent>
            </Select>

            {selectedItems.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} item(s) selecionado(s)
                </span>
                <Select value={bulkOperation} onValueChange={setBulkOperation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Operação em lote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecionar operação</SelectItem>
                    <SelectItem value="adjust_physical">
                      Ajustar Físico
                    </SelectItem>
                    <SelectItem value="adjust_virtual">
                      Ajustar Virtual
                    </SelectItem>
                    <SelectItem value="reserve">Reservar</SelectItem>
                    <SelectItem value="release">Liberar</SelectItem>
                  </SelectContent>
                </Select>
                {bulkOperation !== 'none' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const value = parseInt(
                        prompt('Digite a quantidade:') || '0'
                      )
                      if (value > 0) {
                        handleBulkOperation(bulkOperation, value)
                      }
                    }}
                  >
                    Executar
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Itens em Estoque ({filteredItems.length})</CardTitle>
          <CardDescription>
            Lista completa de produtos com controle de estoque físico, virtual e
            reservado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                  selectedItems.has(item.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={e => {
                      const newSelected = new Set(selectedItems)
                      if (e.target.checked) {
                        newSelected.add(item.id)
                      } else {
                        newSelected.delete(item.id)
                      }
                      setSelectedItems(newSelected)
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
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

                <div className="flex items-center space-x-6">
                  {/* Estoque Físico */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      <HardDrive className="h-4 w-4 inline mr-1" />
                      {item.physical_qty}
                    </div>
                    <p className="text-xs text-gray-500">Físico</p>
                  </div>

                  {/* Estoque Virtual */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      <Cloud className="h-4 w-4 inline mr-1" />
                      {item.virtual_qty}
                    </div>
                    <p className="text-xs text-gray-500">Virtual</p>
                  </div>

                  {/* Reservado */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-orange-600">
                      <Lock className="h-4 w-4 inline mr-1" />
                      {item.reserved_qty}
                    </div>
                    <p className="text-xs text-gray-500">Reservado</p>
                  </div>

                  {/* Disponível */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      {item.available_qty}
                    </div>
                    <p className="text-xs text-gray-500">Disponível</p>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{getStatusText(item.status)}</span>
                    </Badge>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      R$ {item.unit_cost.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Total: R${' '}
                      {(item.available_qty * item.unit_cost).toFixed(2)}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStock(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Implementar visualização detalhada
                        toast.info(`Visualizando detalhes de ${item.name}`)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Estoque</DialogTitle>
            <DialogDescription>
              Ajuste os valores de estoque físico, virtual e reservado
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{editingItem.name}</h3>
                <p className="text-sm text-gray-600">SKU: {editingItem.sku}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="physical_qty">Estoque Físico</Label>
                  <Input
                    id="physical_qty"
                    type="number"
                    value={editingItem.physical_qty}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        physical_qty: parseInt(e.target.value) || 0,
                        available_qty:
                          (parseInt(e.target.value) || 0) +
                          editingItem.virtual_qty -
                          editingItem.reserved_qty,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="virtual_qty">Estoque Virtual</Label>
                  <Input
                    id="virtual_qty"
                    type="number"
                    value={editingItem.virtual_qty}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        virtual_qty: parseInt(e.target.value) || 0,
                        available_qty:
                          editingItem.physical_qty +
                          (parseInt(e.target.value) || 0) -
                          editingItem.reserved_qty,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="reserved_qty">Reservado</Label>
                  <Input
                    id="reserved_qty"
                    type="number"
                    value={editingItem.reserved_qty}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        reserved_qty: parseInt(e.target.value) || 0,
                        available_qty:
                          editingItem.physical_qty +
                          editingItem.virtual_qty -
                          (parseInt(e.target.value) || 0),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="min_stock">Estoque Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={editingItem.min_stock}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        min_stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="max_stock">Estoque Máximo</Label>
                  <Input
                    id="max_stock"
                    type="number"
                    value={editingItem.max_stock}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        max_stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="unit_cost">Custo Unitário</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    value={editingItem.unit_cost}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        unit_cost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumo</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Disponível:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {editingItem.physical_qty +
                        editingItem.virtual_qty -
                        editingItem.reserved_qty}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="ml-2 font-medium">
                      R${' '}
                      {(
                        (editingItem.physical_qty +
                          editingItem.virtual_qty -
                          editingItem.reserved_qty) *
                        editingItem.unit_cost
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStock}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
