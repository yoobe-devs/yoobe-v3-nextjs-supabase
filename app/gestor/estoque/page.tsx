"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { getCompanyProducts, updateCompanyProduct, type CompanyProduct } from "@/lib/queries/gestor"

interface InventoryItem {
  id: string
  product_id: string
  product_name: string
  current_stock: number
  min_stock: number
  max_stock: number
  reserved_stock: number
  available_stock: number
  last_updated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
}

export default function GestorEstoquePage() {
  const [products, setProducts] = useState<CompanyProduct[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const productsData = await getCompanyProducts()
      setProducts(productsData)

      // Simular dados de estoque baseados nos produtos
      const inventoryData: InventoryItem[] = productsData.map(product => {
        const currentStock = product.stock || 0
        const minStock = Math.ceil(currentStock * 0.2)
        const maxStock = Math.ceil(currentStock * 1.5)
        const reservedStock = Math.floor(currentStock * 0.1)
        const availableStock = currentStock - reservedStock

        let status: InventoryItem['status'] = 'in_stock'
        if (currentStock === 0) status = 'out_of_stock'
        else if (currentStock <= minStock) status = 'low_stock'
        else if (currentStock > maxStock) status = 'overstock'

        return {
          id: product.id,
          product_id: product.id,
          product_name: product.name,
          current_stock: currentStock,
          min_stock: minStock,
          max_stock: maxStock,
          reserved_stock: reservedStock,
          available_stock: availableStock,
          last_updated: new Date().toISOString(),
          status
        }
      })

      setInventory(inventoryData)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    try {
      await updateCompanyProduct(itemId, { stock: newStock })
      await fetchInventory()
      setIsEditDialogOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const getStatusBadge = (status: InventoryItem['status']) => {
    const statusConfig = {
      in_stock: { color: 'bg-green-100 text-green-800', text: 'Em Estoque' },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', text: 'Estoque Baixo' },
      out_of_stock: { color: 'bg-red-100 text-red-800', text: 'Sem Estoque' },
      overstock: { color: 'bg-blue-100 text-blue-800', text: 'Excesso' }
    }
    const config = statusConfig[status]
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'overstock':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalProducts: inventory.length,
    inStock: inventory.filter(item => item.status === 'in_stock').length,
    lowStock: inventory.filter(item => item.status === 'low_stock').length,
    outOfStock: inventory.filter(item => item.status === 'out_of_stock').length,
    totalStock: inventory.reduce((sum, item) => sum + item.current_stock, 0),
    reservedStock: inventory.reduce((sum, item) => sum + item.reserved_stock, 0)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
            <p className="text-gray-600">Gerencie o estoque dos produtos</p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
            <p className="text-gray-600">Gerencie o estoque dos produtos da empresa</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Produtos</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Em Estoque</p>
                <p className="text-2xl font-bold">{stats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Unidades</p>
                <p className="text-2xl font-bold">{stats.totalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reservadas</p>
                <p className="text-2xl font-bold">{stats.reservedStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Digite o nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in_stock">Em Estoque</SelectItem>
                  <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                  <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                  <SelectItem value="overstock">Excesso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Produtos</CardTitle>
          <CardDescription>
            Gerencie o estoque de todos os produtos da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Estoque Máximo</TableHead>
                <TableHead>Reservado</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {getStatusBadge(item.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{item.current_stock}</TableCell>
                  <TableCell>{item.min_stock}</TableCell>
                  <TableCell>{item.max_stock}</TableCell>
                  <TableCell className="text-orange-600">{item.reserved_stock}</TableCell>
                  <TableCell className="text-green-600 font-bold">{item.available_stock}</TableCell>
                  <TableCell>{new Date(item.last_updated).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Dialog open={isEditDialogOpen && editingItem?.id === item.id} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Atualizar Estoque</DialogTitle>
                          <DialogDescription>
                            Atualize o estoque do produto {item.product_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="stock">Novo Estoque</Label>
                            <Input
                              id="stock"
                              type="number"
                              defaultValue={item.current_stock}
                              min="0"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                const newStock = parseInt((document.getElementById('stock') as HTMLInputElement).value)
                                handleUpdateStock(item.id, newStock)
                              }}
                            >
                              Salvar
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
