'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { 
  Search, 
  Filter, 
  Eye, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Building,
  User,
  Calendar,
  Package
} from 'lucide-react'

interface Quote {
  id: string
  company_id: string
  requested_by: string
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'paid'
  subtotal: number
  discount: number
  total: number
  notes?: string
  approved_by?: string
  approved_at?: string
  paid_at?: string
  created_at: string
  updated_at: string
  company_name?: string
  requested_by_name?: string
  item_count?: number
}

interface QuoteItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total: number
  product_name?: string
  product_sku?: string
}

export default function AdminGlobalQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [quoteDetails, setQuoteDetails] = useState<QuoteItem[]>([])

  // Mock data for demonstration
  useEffect(() => {
    const mockQuotes: Quote[] = [
      {
        id: '1',
        company_id: 'comp-1',
        requested_by: 'user-1',
        status: 'draft',
        subtotal: 1500.00,
        discount: 150.00,
        total: 1350.00,
        notes: 'Orçamento para evento corporativo Q4',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        company_name: 'TechCorp Brasil',
        requested_by_name: 'João Silva',
        item_count: 5
      },
      {
        id: '2',
        company_id: 'comp-2',
        requested_by: 'user-2',
        status: 'approved',
        subtotal: 2300.00,
        discount: 0,
        total: 2300.00,
        notes: 'Kit de produtos para equipe de vendas',
        approved_by: 'admin-1',
        approved_at: '2024-01-14T15:30:00Z',
        created_at: '2024-01-13T09:00:00Z',
        updated_at: '2024-01-14T15:30:00Z',
        company_name: 'SalesForce Ltda',
        requested_by_name: 'Maria Santos',
        item_count: 8
      },
      {
        id: '3',
        company_id: 'comp-3',
        requested_by: 'user-3',
        status: 'paid',
        subtotal: 800.00,
        discount: 80.00,
        total: 720.00,
        notes: 'Produtos para onboarding',
        approved_by: 'admin-2',
        approved_at: '2024-01-12T11:00:00Z',
        paid_at: '2024-01-13T14:00:00Z',
        created_at: '2024-01-10T16:00:00Z',
        updated_at: '2024-01-13T14:00:00Z',
        company_name: 'StartupXYZ',
        requested_by_name: 'Carlos Oliveira',
        item_count: 3
      }
    ]

    setQuotes(mockQuotes)
    setFilteredQuotes(mockQuotes)
    setLoading(false)
  }, [])

  // Filter quotes based on search and status
  useEffect(() => {
    let filtered = quotes

    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.requested_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter)
    }

    setFilteredQuotes(filtered)
  }, [quotes, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary', icon: Clock, label: 'Rascunho' },
      sent: { variant: 'default', icon: Send, label: 'Enviado' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Aprovado' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejeitado' },
      expired: { variant: 'secondary', icon: Clock, label: 'Expirado' },
      paid: { variant: 'default', icon: DollarSign, label: 'Pago' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
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

  const handleViewDetails = async (quote: Quote) => {
    setSelectedQuote(quote)
    // Mock quote items
    const mockItems: QuoteItem[] = [
      {
        id: 'item-1',
        product_id: 'prod-1',
        quantity: 10,
        unit_price: 75.00,
        total: 750.00,
        product_name: 'Camiseta Corporativa',
        product_sku: 'CAM-001'
      },
      {
        id: 'item-2',
        product_id: 'prod-2',
        quantity: 5,
        unit_price: 150.00,
        total: 750.00,
        product_name: 'Mochila Executiva',
        product_sku: 'MOC-002'
      }
    ]
    setQuoteDetails(mockItems)
  }

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    // Mock API call
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: newStatus as any, updated_at: new Date().toISOString() }
        : quote
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os orçamentos das empresas clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Aprovação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.filter(q => q.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
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
              {formatCurrency(quotes.reduce((sum, q) => sum + q.total, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os orçamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((quotes.filter(q => q.status === 'paid').length / quotes.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Orçamentos convertidos
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
                  placeholder="Buscar por empresa, usuário ou notas..."
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
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos</CardTitle>
          <CardDescription>
            {filteredQuotes.length} orçamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{quote.company_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{quote.requested_by_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(quote.status)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(quote.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {quote.item_count} item(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(quote.created_at)}
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
                            onClick={() => handleViewDetails(quote)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Orçamento</DialogTitle>
                            <DialogDescription>
                              Orçamento #{quote.id} - {quote.company_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="details">Detalhes</TabsTrigger>
                              <TabsTrigger value="items">Itens</TabsTrigger>
                              <TabsTrigger value="actions">Ações</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="details" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Empresa</label>
                                  <p className="text-sm text-muted-foreground">{quote.company_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Solicitante</label>
                                  <p className="text-sm text-muted-foreground">{quote.requested_by_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="mt-1">{getStatusBadge(quote.status)}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Data de Criação</label>
                                  <p className="text-sm text-muted-foreground">{formatDate(quote.created_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subtotal</label>
                                  <p className="text-sm text-muted-foreground">{formatCurrency(quote.subtotal)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Desconto</label>
                                  <p className="text-sm text-muted-foreground">{formatCurrency(quote.discount)}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Total</label>
                                  <p className="text-lg font-bold">{formatCurrency(quote.total)}</p>
                                </div>
                                {quote.notes && (
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium">Observações</label>
                                    <p className="text-sm text-muted-foreground">{quote.notes}</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="items" className="space-y-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead>Preço Unit.</TableHead>
                                    <TableHead>Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {quoteDetails.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">{item.product_name}</TableCell>
                                      <TableCell>{item.product_sku}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                      <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            
                            <TabsContent value="actions" className="space-y-4">
                              <div className="space-y-4">
                                {quote.status === 'draft' && (
                                  <Button className="w-full">
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar Orçamento
                                  </Button>
                                )}
                                
                                {quote.status === 'sent' && (
                                  <div className="space-y-2">
                                    <Button 
                                      className="w-full" 
                                      variant="default"
                                      onClick={() => handleStatusChange(quote.id, 'approved')}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Aprovar
                                    </Button>
                                    <Button 
                                      className="w-full" 
                                      variant="destructive"
                                      onClick={() => handleStatusChange(quote.id, 'rejected')}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Rejeitar
                                    </Button>
                                  </div>
                                )}
                                
                                {quote.status === 'approved' && (
                                  <Button className="w-full" variant="outline">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Marcar como Pago
                                  </Button>
                                )}
                                
                                <Button variant="outline" className="w-full">
                                  <Package className="w-4 h-4 mr-2" />
                                  Ver Replicação
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
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
