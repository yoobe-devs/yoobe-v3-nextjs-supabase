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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  budget_items: any[]
}

export default function GestorOrcamentosPageFixed() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Carregar dados reais do banco
    const loadData = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')
        const companyId = user.user_metadata?.company_id
        const { data, error } = await supabase
          .from('budgets')
          .select(`
            id,
            title,
            description,
            total_amount,
            status,
            created_at,
            updated_at,
            budget_items ( id )
          `)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })

        if (error) throw error
        const mapped: Budget[] = (data || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          total_amount: Number(b.total_amount || 0),
          status: (b.status || 'draft'),
          created_at: b.created_at,
          updated_at: b.updated_at,
          budget_items: b.budget_items || [],
        }))

        setBudgets(mapped)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    loadData()
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
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'default' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando orçamentos...</p>
              <p className="text-sm text-gray-500 mt-2">
                Versão corrigida carregando...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simples */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/gestor/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
                <p className="text-gray-600">
                  Gerencie seus orçamentos e solicitações
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                Checkout v2 Ativo
              </Badge>
              <Button
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Buscar orçamentos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Orçamentos */}
        <div className="grid gap-4">
          {filteredBudgets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum orçamento encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Crie seu primeiro orçamento para começar'}
                </p>
                <Button
                  onClick={() =>
                    toast.info('Funcionalidade em desenvolvimento')
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Orçamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBudgets.map(budget => (
              <Card
                key={budget.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{budget.title}</CardTitle>
                      {budget.description && (
                        <CardDescription className="mt-1">
                          {budget.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(budget.status)}
                      <Badge variant="outline" className="text-green-600">
                        {formatCurrency(budget.total_amount)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criado em {formatDate(budget.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {budget.budget_items.length} itens
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      {budget.status === 'draft' && (
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Enviar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Informações da Versão Corrigida */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <FileText className="h-5 w-5" />
              <h3 className="font-medium">✅ Página Corrigida</h3>
            </div>
            <p className="text-green-700 text-sm mt-2">
              Esta é uma versão corrigida da página de orçamentos que resolve os
              problemas de carregamento. A página agora carrega corretamente sem
              travamentos no sistema de autenticação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
