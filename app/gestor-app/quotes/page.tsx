'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Package,
  Calendar,
  Eye,
  Edit,
  Trash2,
  User
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
  requested_by_user?: {
    name: string
    email: string
  }
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
  product_points?: number
}

interface Product {
  id: string
  name: string
  sku: string
  points: number
  price: number
  active: boolean
}

export default function GestorQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [quoteDetails, setQuoteDetails] = useState<QuoteItem[]>([])
  const [createForm, setCreateForm] = useState({
    notes: '',
    items: [] as Array<{
      product_id: string
      quantity: number
      unit_price: number
      total: number
    }>
  })

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
        requested_by_user: {
          name: 'João Silva',
          email: 'joao.silva@techcorp.com'
        },
        item_count: 5
      },
      {
        id: '2',
        company_id: 'comp-1',
        requested_by: 'user-2',
        status: 'sent',
        subtotal: 2300.00,
        discount: 0,
        total: 2300.00,
        notes: 'Kit de produtos para equipe de vendas',
        created_at: '2024-01-13T09:00:00Z',
        updated_at: '2024-01-14T15:30:00Z',
        requested_by_user: {
          name: 'Maria Santos',
          email: 'maria.santos@techcorp.com'
        },
        item_count: 8
      }
    ]

    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Camiseta Corporativa',
        sku: 'CAM-001',
        points: 150,
        price: 75.00,
        active: true
      },
      {
        id: '2',
        name: 'Mochila Executiva',
        sku: 'MOC-002',
        points: 300,
        price: 150.00,
        active: true
      },
      {
        id: '3',
        name: 'Caneca Personalizada',
        sku: 'CAN-003',
        points: 50,
        price: 25.00,
        active: true
      }
    ]

    setQuotes(mockQuotes)
    setFilteredQuotes(mockQuotes)
    setProducts(mockProducts)
    setLoading(false)
  }, [])

  // Filter quotes based on search and status
  useEffect(() => {
    let filtered = quotes

    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.requested_by_user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.requested_by_user?.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        product_sku: 'CAM-001',
        product_points: 150
      },
      {
        id: 'item-2',
        product_id: 'prod-2',
        quantity: 5,
        unit_price: 150.00,
        total: 750.00,
        product_name: 'Mochila Executiva',
        product_sku: 'MOC-002',
        product_points: 300
      }
    ]
    setQuoteDetails(mockItems)
  }

  const handleCreateQuote = () => {
    setCreateForm({
      notes: '',
      items: []
    })
    setShowCreateDialog(true)
  }

  const handleAddItem = () => {
    setCreateForm(prev => ({
      ...prev,
      items: [...prev.items, {
        product_id: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }]
    }))
  }

  const handleRemoveItem = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    setCreateForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          // Recalcular total se quantidade ou preço mudar
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const handleSaveQuote = async () => {
    if (createForm.items.length === 0) return

    const subtotal = createForm.items.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal // Sem desconto por enquanto

    const newQuote: Quote = {
      id: Date.now().toString(),
      company_id: 'comp-1',
      requested_by: 'current-user',
      status: 'draft',
      subtotal,
      discount: 0,
      total,
      notes: createForm.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requested_by_user: {
        name: 'Você',
        email: 'current@user.com'
      },
      item_count: createForm.items.length
    }

    setQuotes(prev => [newQuote, ...prev])
    setFilteredQuotes(prev => [newQuote, ...prev])
    setShowCreateDialog(false)
    setCreateForm({ notes: '', items: [] })
  }

  const handleSendQuote = async (quoteId: string) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: 'sent', updated_at: new Date().toISOString() }
        : quote
    ))
  }

  const handleDeleteQuote = async (quoteId: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId))
    }
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
            Crie e gerencie orçamentos para sua empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateQuote}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
            <p className="text-xs text-muted-foreground">
              Criados por você
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.filter(q => q.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando envio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.filter(q => q.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
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
              Soma de todos os orçamentos
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
                  placeholder="Buscar por notas ou usuário..."
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
                <TableHead>ID</TableHead>
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
                    <Badge variant="outline">
                      #{quote.id.slice(-8)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{quote.requested_by_user?.name}</span>
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
                              Orçamento #{quote.id}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Quote Details */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Informações do Orçamento</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="mt-1">{getStatusBadge(quote.status)}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Solicitante</label>
                                  <p className="text-sm text-muted-foreground">{quote.requested_by_user?.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Data de Criação</label>
                                  <p className="text-sm text-muted-foreground">{formatDate(quote.created_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Última Atualização</label>
                                  <p className="text-sm text-muted-foreground">{formatDate(quote.updated_at)}</p>
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
                            </div>

                            {/* Quote Items */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">Itens do Orçamento</h3>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead>Preço Unit.</TableHead>
                                    <TableHead>Pontos</TableHead>
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
                                      <TableCell>
                                        <Badge variant="secondary">
                                          {item.product_points} pts
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              {quote.status === 'draft' && (
                                <Button 
                                  className="flex-1"
                                  onClick={() => handleSendQuote(quote.id)}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Enviar Orçamento
                                </Button>
                              )}
                              
                              <Button variant="outline" className="flex-1">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {quote.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendQuote(quote.id)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuote(quote.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Quote Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Orçamento</DialogTitle>
            <DialogDescription>
              Adicione produtos e crie um orçamento para sua empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Notes */}
            <div>
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                placeholder="Descrição do orçamento, evento, ou motivo..."
                value={createForm.notes}
                onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Produtos</h3>
                <Button onClick={handleAddItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
              
              {createForm.items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum produto adicionado</p>
                  <Button onClick={handleAddItem} className="mt-4" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Produto
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {createForm.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Select 
                          value={item.product_id} 
                          onValueChange={(value) => {
                            const product = products.find(p => p.id === value)
                            handleItemChange(index, 'product_id', value)
                            if (product) {
                              handleItemChange(index, 'unit_price', product.price)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.filter(p => p.active).map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {product.sku}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-24">
                        <label className="text-sm font-medium">Quantidade</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className="w-32">
                        <label className="text-sm font-medium">Preço Unit.</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="w-32">
                        <label className="text-sm font-medium">Total</label>
                        <Input
                          value={formatCurrency(item.total)}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {createForm.items.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total do Orçamento:</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(createForm.items.reduce((sum, item) => sum + item.total, 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveQuote}
                disabled={createForm.items.length === 0}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Salvar Orçamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
