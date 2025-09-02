'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign,
  User,
  MapPin,
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react'

interface Order {
  id: string
  user_id: string
  product_id: string
  payment_method: 'points' | 'credit_card' | 'pix' | 'debit' | 'boleto' | 'donation'
  amount: number
  address_id?: string
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
  }
  product?: {
    name: string
    sku: string
    points: number
    price: number
  }
  address?: {
    street: string
    number: string
    city: string
    state: string
    zip_code: string
  }
}

export default function GestorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        user_id: 'user-1',
        product_id: 'prod-1',
        payment_method: 'points',
        amount: 75.00,
        address_id: 'addr-1',
        status: 'delivered',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
        user: {
          name: 'João Silva',
          email: 'joao.silva@techcorp.com'
        },
        product: {
          name: 'Camiseta Corporativa',
          sku: 'CAM-001',
          points: 150,
          price: 75.00
        },
        address: {
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567'
        }
      },
      {
        id: '2',
        user_id: 'user-2',
        product_id: 'prod-2',
        payment_method: 'credit_card',
        amount: 150.00,
        address_id: 'addr-2',
        status: 'shipped',
        created_at: '2024-01-12T11:00:00Z',
        updated_at: '2024-01-16T10:15:00Z',
        user: {
          name: 'Maria Santos',
          email: 'maria.santos@techcorp.com'
        },
        product: {
          name: 'Mochila Executiva',
          sku: 'MOC-002',
          points: 300,
          price: 150.00
        },
        address: {
          street: 'Avenida Paulista',
          number: '1000',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100'
        }
      },
      {
        id: '3',
        user_id: 'user-3',
        product_id: 'prod-3',
        payment_method: 'pix',
        amount: 25.00,
        address_id: 'addr-3',
        status: 'pending',
        created_at: '2024-01-15T16:00:00Z',
        updated_at: '2024-01-15T16:00:00Z',
        user: {
          name: 'Carlos Oliveira',
          email: 'carlos.oliveira@techcorp.com'
        },
        product: {
          name: 'Caneca Personalizada',
          sku: 'CAN-003',
          points: 50,
          price: 25.00
        },
        address: {
          street: 'Rua Augusta',
          number: '500',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01412-000'
        }
      }
    ]

    setOrders(mockOrders)
    setFilteredOrders(mockOrders)
    setLoading(false)
  }, [])

  // Filter orders based on search, status and payment method
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product?.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_method === paymentMethodFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, paymentMethodFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pendente' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Aprovado' },
      shipped: { variant: 'default', icon: Truck, label: 'Enviado' },
      delivered: { variant: 'default', icon: CheckCircle, label: 'Entregue' },
      cancelled: { variant: 'destructive', icon: XCircle, label: 'Cancelado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      points: { variant: 'secondary', label: 'Pontos' },
      credit_card: { variant: 'default', label: 'Cartão de Crédito' },
      pix: { variant: 'default', label: 'PIX' },
      debit: { variant: 'default', label: 'Cartão de Débito' },
      boleto: { variant: 'outline', label: 'Boleto' },
      donation: { variant: 'outline', label: 'Doação' }
    }

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.points

    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
        : order
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe todos os pedidos da sua empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              Todos os pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Em trânsito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(orders.reduce((sum, o) => sum + o.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de todos os pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, produto ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value="points">Pontos</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="donation">Doação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            {filteredOrders.length} pedido(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Método Pagamento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Badge variant="outline">
                      #{order.id.slice(-8)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{order.user?.name}</div>
                        <div className="text-sm text-muted-foreground">{order.user?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.product?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {order.product?.sku}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {order.product?.points} pts
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodBadge(order.payment_method)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(order.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Pedido</DialogTitle>
                            <DialogDescription>
                              Pedido #{order.id}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Order Details */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Informações do Pedido</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Método de Pagamento</label>
                                  <div className="mt-1">{getPaymentMethodBadge(order.payment_method)}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Valor</label>
                                  <p className="text-lg font-bold">{formatCurrency(order.amount)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Data de Criação</label>
                                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Última Atualização</label>
                                  <p className="text-sm text-muted-foreground">{formatDate(order.updated_at)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Customer Information */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Informações do Cliente</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Nome</label>
                                  <p className="text-sm text-muted-foreground">{order.user?.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                                </div>
                              </div>
                            </div>

                            {/* Product Information */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Informações do Produto</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Nome</label>
                                  <p className="text-sm text-muted-foreground">{order.product?.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">SKU</label>
                                  <p className="text-sm text-muted-foreground">{order.product?.sku}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Pontos</label>
                                  <p className="text-sm text-muted-foreground">
                                    <Badge variant="secondary">{order.product?.points} pts</Badge>
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Preço</label>
                                  <p className="text-sm text-muted-foreground">{formatCurrency(order.product?.price || 0)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            {order.address && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">Endereço de Entrega</h3>
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                  <div>
                                    <p className="text-sm">
                                      {order.address.street}, {order.address.number}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.address.city} - {order.address.state}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      CEP: {order.address.zip_code}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Status Actions */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Alterar Status</h3>
                              <div className="flex gap-2">
                                {order.status === 'pending' && (
                                  <Button 
                                    onClick={() => handleStatusChange(order.id, 'approved')}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprovar Pedido
                                  </Button>
                                )}
                                
                                {order.status === 'approved' && (
                                  <Button 
                                    onClick={() => handleStatusChange(order.id, 'shipped')}
                                    className="flex-1"
                                  >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Marcar como Enviado
                                  </Button>
                                )}
                                
                                {order.status === 'shipped' && (
                                  <Button 
                                    onClick={() => handleStatusChange(order.id, 'delivered')}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Marcar como Entregue
                                  </Button>
                                )}
                                
                                {['pending', 'approved'].includes(order.status) && (
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                                    className="flex-1"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar Pedido
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
