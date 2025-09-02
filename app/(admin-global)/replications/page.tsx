'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Package,
  Building,
  Calendar,
  Eye,
  RotateCcw
} from 'lucide-react'

interface ReplicationJob {
  id: string
  quote_id: string
  company_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error?: string
  created_at: string
  updated_at: string
  company_name?: string
  quote_total?: number
  item_count?: number
}

interface ReplicationStats {
  total: number
  queued: number
  processing: number
  completed: number
  failed: number
}

export default function AdminGlobalReplicationsPage() {
  const [replications, setReplications] = useState<ReplicationJob[]>([])
  const [filteredReplications, setFilteredReplications] = useState<ReplicationJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stats, setStats] = useState<ReplicationStats>({
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0
  })
  const [selectedJob, setSelectedJob] = useState<ReplicationJob | null>(null)
  const [runningJob, setRunningJob] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockReplications: ReplicationJob[] = [
      {
        id: '1',
        quote_id: 'quote-1',
        company_id: 'comp-1',
        status: 'queued',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        company_name: 'TechCorp Brasil',
        quote_total: 1350.00,
        item_count: 5
      },
      {
        id: '2',
        quote_id: 'quote-2',
        company_id: 'comp-2',
        status: 'processing',
        created_at: '2024-01-15T09:30:00Z',
        updated_at: '2024-01-15T09:45:00Z',
        company_name: 'SalesForce Ltda',
        quote_total: 2300.00,
        item_count: 8
      },
      {
        id: '3',
        quote_id: 'quote-3',
        company_id: 'comp-3',
        status: 'completed',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:15:00Z',
        company_name: 'StartupXYZ',
        quote_total: 720.00,
        item_count: 3
      },
      {
        id: '4',
        quote_id: 'quote-4',
        company_id: 'comp-4',
        status: 'failed',
        error: 'Produto base não encontrado: PROD-999',
        created_at: '2024-01-15T07:00:00Z',
        updated_at: '2024-01-15T07:05:00Z',
        company_name: 'CorpABC',
        quote_total: 1200.00,
        item_count: 4
      }
    ]

    setReplications(mockReplications)
    setFilteredReplications(mockReplications)
    
    // Calculate stats
    const newStats = {
      total: mockReplications.length,
      queued: mockReplications.filter(r => r.status === 'queued').length,
      processing: mockReplications.filter(r => r.status === 'processing').length,
      completed: mockReplications.filter(r => r.status === 'completed').length,
      failed: mockReplications.filter(r => r.status === 'failed').length
    }
    setStats(newStats)
    
    setLoading(false)
  }, [])

  // Filter replications based on search and status
  useEffect(() => {
    let filtered = replications

    if (searchTerm) {
      filtered = filtered.filter(replication => 
        replication.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        replication.quote_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(replication => replication.status === statusFilter)
    }

    setFilteredReplications(filtered)
  }, [replications, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      queued: { variant: 'secondary', icon: Clock, label: 'Na Fila' },
      processing: { variant: 'default', icon: RefreshCw, label: 'Processando' },
      completed: { variant: 'default', icon: CheckCircle, label: 'Concluído' },
      failed: { variant: 'destructive', icon: XCircle, label: 'Falhou' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued
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

  const handleRunReplication = async () => {
    setRunningJob(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update mock data
    setReplications(prev => prev.map(replication => {
      if (replication.status === 'queued') {
        return { ...replication, status: 'processing', updated_at: new Date().toISOString() }
      }
      if (replication.status === 'processing') {
        return { ...replication, status: 'completed', updated_at: new Date().toISOString() }
      }
      return replication
    }))
    
    setRunningJob(false)
  }

  const handleRetryJob = async (jobId: string) => {
    setReplications(prev => prev.map(replication => 
      replication.id === jobId 
        ? { ...replication, status: 'queued', error: undefined, updated_at: new Date().toISOString() }
        : replication
    ))
  }

  const handleViewDetails = (job: ReplicationJob) => {
    setSelectedJob(job)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando replicações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Replicações de Produtos</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie a replicação de produtos após pagamento de orçamentos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={runningJob}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${runningJob ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={handleRunReplication}
            disabled={runningJob || stats.queued === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            {runningJob ? 'Executando...' : 'Executar Replicações'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Jobs de replicação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Na Fila</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queued}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processando</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">
              Em execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falharam</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
            <CardDescription>
              {stats.completed} de {stats.total} jobs concluídos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(stats.completed / stats.total) * 100} 
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>0%</span>
              <span>{((stats.completed / stats.total) * 100).toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
      )}

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
                  placeholder="Buscar por empresa ou ID do orçamento..."
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
                <SelectItem value="queued">Na Fila</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Replications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs de Replicação</CardTitle>
          <CardDescription>
            {filteredReplications.length} job(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReplications.map((replication) => (
                <TableRow key={replication.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{replication.company_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      #{replication.quote_id.slice(-8)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(replication.status)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {replication.quote_total ? formatCurrency(replication.quote_total) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {replication.item_count} item(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(replication.created_at)}
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
                            onClick={() => handleViewDetails(replication)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Replicação</DialogTitle>
                            <DialogDescription>
                              Job #{replication.id} - {replication.company_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Empresa</label>
                                <p className="text-sm text-muted-foreground">{replication.company_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">ID do Orçamento</label>
                                <p className="text-sm text-muted-foreground">{replication.quote_id}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">{getStatusBadge(replication.status)}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Data de Criação</label>
                                <p className="text-sm text-muted-foreground">{formatDate(replication.created_at)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Última Atualização</label>
                                <p className="text-sm text-muted-foreground">{formatDate(replication.updated_at)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Valor do Orçamento</label>
                                <p className="text-sm text-muted-foreground">
                                  {replication.quote_total ? formatCurrency(replication.quote_total) : '-'}
                                </p>
                              </div>
                            </div>
                            
                            {replication.error && (
                              <div className="border border-destructive bg-destructive/10 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-destructive">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="font-medium">Erro</span>
                                </div>
                                <p className="text-sm text-destructive mt-2">{replication.error}</p>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              {replication.status === 'failed' && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleRetryJob(replication.id)}
                                  className="flex-1"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Tentar Novamente
                                </Button>
                              )}
                              
                              <Button variant="outline" className="flex-1">
                                <Package className="w-4 h-4 mr-2" />
                                Ver Produtos
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {replication.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryJob(replication.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
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
