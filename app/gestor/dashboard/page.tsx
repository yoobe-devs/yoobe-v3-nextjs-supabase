'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Package, 
  FileText, 
  ShoppingCart,
  TrendingUp,
  Plus,
  Eye,
  Store,
  Gift,
  Truck,
  UserPlus,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ProductImage } from '@/components/ui/safe-image'

export default function GestorDashboard() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [awaitingActivation, setAwaitingActivation] = useState<number>(0)
  const [recentBudgets, setRecentBudgets] = useState<any[]>([])
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [catalogResults, setCatalogResults] = useState<any[]>([])
  const [catalogItems, setCatalogItems] = useState<Array<{ base_product_id: string, quantity: number, notes?: string }>>([])
  const [budgetTitle, setBudgetTitle] = useState('Orçamento - Seleção de Produtos')
  const [budgetDescription, setBudgetDescription] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const { data: { user } } = await supabase.auth.getUser()
        const companyId = user?.user_metadata?.company_id
        if (!companyId) {
          setError('Empresa não encontrada para o usuário atual')
          setLoading(false)
          return
        }
        const res = await fetch(`/api/gestor/stats?company_id=${companyId}`)
        const js = await res.json()
        if (!res.ok) throw new Error(js?.error || 'Falha ao carregar métricas')
        setStats(js.stats)
        // Consumir campos agregados quando disponíveis
        if (js?.stats?.awaitingActivationCount !== undefined) setAwaitingActivation(js.stats.awaitingActivationCount)
        if (Array.isArray(js?.stats?.budgetsRecent)) setRecentBudgets(js.stats.budgetsRecent)
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar métricas')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'user',
      action: 'Novo funcionário cadastrado',
      user: 'João Silva',
      time: '2 horas atrás',
      status: 'success'
    },
    {
      id: 2,
      type: 'quote',
      action: 'Orçamento aprovado',
      user: 'Maria Santos',
      time: '4 horas atrás',
      status: 'success'
    },
    {
      id: 3,
      type: 'order',
      action: 'Pedido enviado',
      user: 'Pedro Costa',
      time: '6 horas atrás',
      status: 'processing'
    },
    {
      id: 4,
      type: 'product',
      action: 'Produto atualizado',
      user: 'Ana Oliveira',
      time: '1 dia atrás',
      status: 'info'
    },
    {
      id: 5,
      type: 'delivery',
      action: 'Entrega confirmada',
      user: 'Carlos Ferreira',
      time: '1 dia atrás',
      status: 'success'
    }
  ])

  const [quickActions] = useState([
    {
      title: 'Minha Loja',
      description: 'Dashboard da sua loja',
      icon: Store,
      href: '/gestor/minha-loja',
      color: 'bg-blue-500'
    },
    {
      title: 'Loja de Brindes',
      description: 'Gerenciar produtos de brindes',
      icon: Gift,
      href: '/gestor/loja-brindes',
      color: 'bg-green-500'
    },
    {
      title: 'Swag Track',
      description: 'Rastrear entregas',
      icon: Truck,
      href: '/gestor/swag-track',
      color: 'bg-purple-500'
    },
    {
      title: 'Onboarding',
      description: 'Gestão de novos funcionários',
      icon: UserPlus,
      href: '/gestor/onboarding',
      color: 'bg-orange-500'
    }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />
      case 'quote': return <FileText className="h-4 w-4" />
      case 'order': return <ShoppingCart className="h-4 w-4" />
      case 'product': return <Package className="h-4 w-4" />
      case 'delivery': return <Truck className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'quote': return 'bg-green-100 text-green-800'
      case 'order': return 'bg-purple-100 text-purple-800'
      case 'product': return 'bg-orange-100 text-orange-800'
      case 'delivery': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'processing': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Modal: Selecionar Produtos Base para criar Orçamento */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Selecionar Produtos Base para Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Buscar no catálogo base</label>
                  <Input value={catalogSearch} onChange={async (e) => {
                    const q = e.target.value; setCatalogSearch(q)
                    if ((q||'').length < 2) { setCatalogResults([]); return }
                    try {
                      const { data: { session } } = await supabase.auth.getSession()
                      const r = await fetch(`/api/gestor/base-products?search=${encodeURIComponent(q)}`, { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined })
                      const j = await r.json().catch(() => ({}))
                      setCatalogResults(j?.data?.products || j?.products || [])
                    } catch { setCatalogResults([]) }
                  }} placeholder="Digite ao menos 2 letras" />
                </div>
                <div className="space-y-2 max-h-64 overflow-auto border rounded p-2">
                  {catalogResults.map((p: any) => (
                    <div key={p.id} className="border rounded p-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-gray-50">
                          <ProductImage src={p.image_url} alt={p.name} className="w-12 h-12 object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-600">{p.product_categories?.name || 'Sem categoria'} • R$ {(p.base_price||0).toLocaleString('pt-BR')} • {(p.base_points_cost||0)} pts</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setCatalogItems([...catalogItems, { base_product_id: p.id, quantity: 1 }])}>Adicionar</Button>
                    </div>
                  ))}
                  {catalogResults.length === 0 && <div className="text-xs text-gray-500">Sem resultados</div>}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Título do Orçamento</label>
                  <Input value={budgetTitle} onChange={(e) => setBudgetTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Descrição</label>
                  <Textarea value={budgetDescription} onChange={(e) => setBudgetDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Itens Selecionados</div>
                    {catalogItems.length > 0 && <Button size="sm" variant="ghost" onClick={() => setCatalogItems([])}>Limpar</Button>}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {catalogItems.map((it, idx) => (
                      <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                        <div className="col-span-3 text-xs">{it.base_product_id}</div>
                        <div className="col-span-1">
                          <Input type="number" min={1} value={it.quantity} onChange={(e) => { const x=[...catalogItems]; x[idx].quantity = Math.max(1, Number(e.target.value||1)); setCatalogItems(x) }} />
                        </div>
                        <div className="col-span-2">
                          <Input placeholder="Observações (opcional)" value={it.notes||''} onChange={(e) => { const x=[...catalogItems]; x[idx].notes = e.target.value; setCatalogItems(x) }} />
                        </div>
                      </div>
                    ))}
                    {catalogItems.length === 0 && <div className="text-xs text-gray-500">Nenhum item selecionado</div>}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCatalogOpen(false)}>Cancelar</Button>
                  <Button onClick={async () => {
                    try {
                      const items = catalogItems.map(i => ({ base_product_id: i.base_product_id, quantity: i.quantity }))
                      if (!items.length) return
                      const { data: { session } } = await supabase.auth.getSession()
                      const r = await fetch('/api/gestor/orcamentos', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) }, body: JSON.stringify({ title: budgetTitle, description: budgetDescription, items }) })
                      const j = await r.json().catch(() => ({}))
                      if (!r.ok) throw new Error(j?.error || 'Falha ao criar orçamento')
                      setCatalogItems([]); setCatalogOpen(false)
                      const breq = await fetch('/api/gestor/orcamentos?limit=5', { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined })
                      const bjson = await breq.json().catch(() => ({}))
                      setRecentBudgets(bjson?.data?.budgets || [])
                    } catch (e) { console.error(e) }
                  }}>Criar Orçamento</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Gestor</h1>
          <p className="text-gray-600">Bem-vindo de volta! Aqui está o resumo completo da sua empresa.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex space-x-3">
          <Link href="/gestor/base-products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Fazer Orçamento
            </Button>
          </Link>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
          <Button onClick={() => setCatalogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento (Catálogo Base)
          </Button>
        </div>
      </div>

      {/* Stats Cards - Primeira Linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats?.activeEmployees ?? 0}</span> ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">{stats?.inventory?.lowStock ?? 0}</span> com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.budgets?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">{stats?.budgets?.pending ?? 0}</span> pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{Math.max((stats?.totalOrders ?? 0) - (stats?.pendingOrders ?? 0), 0)}</span> completados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Extra KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos aguardando ativação</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{awaitingActivation}</div>
            <p className="text-xs text-muted-foreground">Replicados via orçamento aprovado e ainda inativos</p>
            <div className="mt-3">
              <Link href="/gestor/produtos"><Button size="sm" variant="outline">Gerenciar Produtos</Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos recentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentBudgets.slice(0,5).map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div className="truncate mr-2">{b.title}</div>
                  <Badge variant="outline" className="text-xs">{(b.status||'').toUpperCase()}</Badge>
                </div>
              ))}
              {recentBudgets.length === 0 && <div className="text-xs text-gray-500">Nenhum orçamento recente</div>}
            </div>
            <div className="mt-3">
              <Link href="/gestor/orcamentos"><Button size="sm" variant="outline">Ver todos</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Segunda Linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inventory?.outOfStock ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Itens esgotados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Pendentes</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.last30dRevenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              Receita últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalRevenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Resumo Financeiro
          </CardTitle>
          <CardDescription className="text-blue-100">
            Visão geral dos resultados financeiros da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-100">Receita Total</p>
              <p className="text-2xl font-bold">{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalRevenue ?? 0)}</p>
            </div>
            <div>
              <p className="text-sm text-blue-100">Pedidos Processados</p>
              <p className="text-2xl font-bold">{Math.max((stats?.totalOrders ?? 0) - (stats?.pendingOrders ?? 0), 0)}</p>
            </div>
            <div>
              <p className="text-sm text-blue-100">Crescimento</p>
              <p className="text-2xl font-bold">{Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(((stats?.totalRevenue ?? 0) > 0 ? (stats?.last30dRevenue ?? 0) / (stats?.totalRevenue ?? 1) : 0))}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                  <action.icon className="h-5 w-5" />
                </div>
                {action.title}
              </CardTitle>
              <CardDescription>
                {action.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={action.href}>
                <Button className="w-full" variant="outline">
                  Acessar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Gestão de Funcionários
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie seus funcionários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/gestor/funcionarios">
              <Button className="w-full" variant="outline">
                Ver Funcionários
              </Button>
            </Link>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Produtos
            </CardTitle>
            <CardDescription>
              Gerencie seu catálogo de produtos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/gestor/produtos">
              <Button className="w-full" variant="outline">
                Ver Produtos
              </Button>
            </Link>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Orçamentos
            </CardTitle>
            <CardDescription>
              Acompanhe solicitações e aprovações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/gestor/orcamentos">
              <Button className="w-full" variant="outline">
                Ver Orçamentos
              </Button>
            </Link>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas ações realizadas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">por {activity.user}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {activity.time}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
