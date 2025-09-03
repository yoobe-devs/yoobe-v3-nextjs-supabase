'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  TrendingUp,
  Calendar,
  Package
} from 'lucide-react'

export default function OrcamentosPage() {
  const supabase = createClientComponentClient()
  const [openCurrentOnLoad, setOpenCurrentOnLoad] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sort, setSort] = useState<'created_at'|'total_amount'|'total_points'>('created_at')
  const [dir, setDir] = useState<'asc'|'desc'>('desc')
  const [total, setTotal] = useState(0)
  const [budgets, setBudgets] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    items: [ { base_product_id: '', quantity: 1, custom_price: undefined as number | undefined, custom_points_cost: undefined as number | undefined } ]
  })
  const [bpSuggestions, setBpSuggestions] = useState<Record<number, any[]>>({})

  const load = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const params = new URLSearchParams({ page: String(page), limit: String(limit), sort, dir, ...(selectedStatus !== 'all' ? { status: selectedStatus } : {}), ...(searchTerm ? { search: searchTerm } : {}) })
      const res = await fetch(`/api/gestor/orcamentos?${params.toString()}`, { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao buscar orçamentos')
      setBudgets(data?.data?.budgets || [])
      setTotal(data?.data?.pagination?.total || 0)
    } catch (e) {
      console.error(e)
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, limit, sort, dir, selectedStatus])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openCurrent') === '1') {
        const id = window.localStorage.getItem('gestor.current_budget_id')
        if (id) {
          (async () => {
            try {
              const r = await fetch(`/api/gestor/orcamentos/${id}`)
              const j = await r.json().catch(()=>({}))
              if (r.ok && j?.budget) {
                setSelected(j.budget)
                setViewOpen(true)
              }
            } catch {}
          })()
        }
      }
    }
  }, [])

  const filteredBudgets = useMemo(() => {
    return (budgets || []).filter((b: any) => {
      const matchesSearch = (b.title || '').toLowerCase().includes((searchTerm||'').toLowerCase()) ||
        (b.description || '').toLowerCase().includes((searchTerm||'').toLowerCase())
      const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [budgets, searchTerm, selectedStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'reviewed': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'expired': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado'
      case 'pending': return 'Enviado (Pendente)'
      case 'submitted': return 'Enviado'
      case 'draft': return 'Rascunho'
      case 'reviewed': return 'Revisado'
      case 'rejected': return 'Rejeitado'
      case 'expired': return 'Expirado'
      default: return status
    }
  }

  const statuses = ['approved', 'reviewed', 'pending', 'rejected', 'expired']

  return (
    <div className="p-6 space-y-6">
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Título</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do orçamento" />
            </div>
            <div>
              <label className="block text-sm mb-1">Descrição</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição (opcional)" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Itens</label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, items: [...form.items, { base_product_id: '', quantity: 1 }] })}>Adicionar Item</Button>
              </div>
              {form.items.map((it: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <Input placeholder="Produto base (ID ou busca)" value={it.base_product_id} onChange={async (e) => {
                      const val = e.target.value; const items = [...form.items]; items[idx].base_product_id = val; setForm({ ...form, items })
                      if ((val||'').length >= 2 && !/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(val)) {
                        try {
                          const r = await fetch(`/api/gestor/base-products?search=${encodeURIComponent(val)}`)
                          const j = await r.json().catch(() => ({}))
                          setBpSuggestions((m) => ({ ...m, [idx]: j?.data?.products || j?.products || [] }))
                        } catch { setBpSuggestions((m) => ({ ...m, [idx]: [] })) }
                      } else {
                        setBpSuggestions((m) => ({ ...m, [idx]: [] }))
                      }
                    }} />
                    {Array.isArray(bpSuggestions[idx]) && bpSuggestions[idx]?.length > 0 && (
                      <div className="mt-1 border rounded max-h-40 overflow-auto bg-white z-10">
                        {bpSuggestions[idx].slice(0,5).map((p: any) => (
                          <button key={p.id} type="button" className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50" onClick={() => {
                            const items = [...form.items]; items[idx].base_product_id = p.id; setForm({ ...form, items }); setBpSuggestions((m) => ({ ...m, [idx]: [] }))
                          }}>
                            {p.name} — R$ {(p.base_price||0).toLocaleString('pt-BR')} • {(p.base_points_cost||0)} pts
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input type="number" min={1} placeholder="Qtd" value={it.quantity} onChange={(e) => {
                    const items = [...form.items]; items[idx].quantity = Number(e.target.value||1); setForm({ ...form, items })
                  }} />
                  <Input type="number" step="0.01" placeholder="Preço custom (opcional)" value={it.custom_price ?? ''} onChange={(e) => {
                    const items = [...form.items]; items[idx].custom_price = e.target.value === '' ? undefined : Number(e.target.value); setForm({ ...form, items })
                  }} />
                  <Input type="number" placeholder="Pontos custom (opcional)" value={it.custom_points_cost ?? ''} onChange={(e) => {
                    const items = [...form.items]; items[idx].custom_points_cost = e.target.value === '' ? undefined : Number(e.target.value); setForm({ ...form, items })
                  }} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession()
                  const res = await fetch('/api/gestor/orcamentos', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
                    body: JSON.stringify({ title: form.title, description: form.description, items: form.items })
                  })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) throw new Error(data?.error || 'Falha ao criar orçamento')
                  setCreateOpen(false); setForm({ title: '', description: '', items: [{ base_product_id: '', quantity: 1 }] }); load()
                } catch (e) { console.error(e) }
              }}>Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Orçamento</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="text-lg font-semibold">{selected.title}</div>
              <div className="text-sm text-gray-600">{selected.description || '—'}</div>
              <div className="text-sm">Status: <Badge>{getStatusText(selected.status)}</Badge></div>
              <div className="text-sm">Valor: R$ {(selected.total_amount||0).toLocaleString('pt-BR')}</div>
              <div className="text-sm">Pontos: {(selected.total_points||0).toLocaleString('pt-BR')}</div>
              <div className="border-t pt-2">
                <div className="font-medium mb-2">Itens</div>
                <div className="space-y-1">
                  {(selected.budget_items||[]).map((it: any) => (
                    <div key={it.id} className="text-sm flex justify-between">
                      <span>{it.base_products?.name || it.base_product_id} × {it.quantity}</span>
                      <span>R$ {(it.custom_price ?? it.base_products?.base_price ?? 0).toLocaleString('pt-BR')} • {(it.custom_points_cost ?? it.base_products?.base_points_cost ?? 0)} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Orçamentos</h1>
          <p className="text-gray-600">Gerencie orçamentos, aprovações e replicação de produtos.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{budgets.filter(b => b.status === 'approved').length}</span> aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {budgets.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0).toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Média: R$ {Math.round(budgets.reduce((sum, b) => sum + parseFloat(b.totalAmount.replace('R$ ', '').replace(',', '')), 0) / budgets.length).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.reduce((sum: number, b: any) => sum + (b.total_points || 0), 0).toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round(budgets.reduce((sum, b) => sum + b.totalPoints, 0) / budgets.length).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Aprovação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.filter((b: any) => b.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">{budgets.filter(b => b.status === 'pending').length}</span> pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Encontre orçamentos específicos rapidamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
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
              <select className="px-3 py-2 border rounded-md" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                <option value="created_at">Data</option>
                <option value="total_amount">Valor</option>
                <option value="total_points">Pontos</option>
              </select>
              <select className="px-3 py-2 border rounded-md" value={dir} onChange={(e) => setDir(e.target.value as any)}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Total: {total}</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Anterior</button>
              <span>Página {page}</span>
              <button className="px-2 py-1 border rounded" disabled={(page*limit)>=total} onClick={() => setPage(p => p+1)}>Próxima</button>
              <select className="px-2 py-1 border rounded" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos ({filteredBudgets.length})</CardTitle>
          <CardDescription>Lista completa de orçamentos da empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBudgets.map((budget: any) => (
              <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{budget.title}</h3>
                    <p className="text-sm text-gray-600">{budget.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs text-gray-500">
                        <Package className="h-3 w-3 mr-1" />
                        {(budget.budget_items?.length || 0)} itens
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(budget.created_at || Date.now()).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">R$ {(budget.total_amount||0).toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-gray-500">{(budget.total_points||0).toLocaleString('pt-BR')} pontos</p>
                  </div>

                  <div className="text-right" />

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(budget.status)}>
                        {getStatusIcon(budget.status)}
                        {getStatusText(budget.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      SLA: {budget.slaDays} dias
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelected(budget); setViewOpen(true) }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={!['draft','rejected'].includes(budget.status)} onClick={() => { setSelected(budget); setForm({ title: budget.title, description: budget.description, items: (budget.budget_items||[]).map((it: any) => ({ base_product_id: it.base_product_id, quantity: it.quantity, custom_price: it.custom_price ?? undefined, custom_points_cost: it.custom_points_cost ?? undefined })) }); setEditOpen(true) }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={budget.status !== 'draft'} onClick={async () => {
                      try {
                        const { data: { session } } = await supabase.auth.getSession()
                        const res = await fetch(`/api/gestor/orcamentos/${budget.id}/submit`, { method: 'POST', headers: { ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) } })
                        const data = await res.json().catch(() => ({}))
                        if (!res.ok) throw new Error(data?.error || 'Falha ao enviar')
                        load()
                      } catch (e) { console.error(e) }
                    }}>
                      Enviar
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
          <CardDescription>Gerenciar orçamentos e aprovações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              <span>Novo Orçamento</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>Aprovar Pendentes</span>
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Título</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Descrição</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Itens</label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, items: [...form.items, { base_product_id: '', quantity: 1 }] })}>Adicionar Item</Button>
              </div>
              {form.items.map((it: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <Input placeholder="Produto base (ID ou busca)" value={it.base_product_id} onChange={async (e) => { const val = e.target.value; const items = [...form.items]; items[idx].base_product_id = val; setForm({ ...form, items }); if ((val||'').length >= 2 && !/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(val)) { try { const r = await fetch(`/api/gestor/base-products?search=${encodeURIComponent(val)}`); const j = await r.json().catch(() => ({})); setBpSuggestions((m) => ({ ...m, [idx]: j?.data?.products || j?.products || [] })) } catch { setBpSuggestions((m) => ({ ...m, [idx]: [] })) } } else { setBpSuggestions((m) => ({ ...m, [idx]: [] })) } }} />
                    {Array.isArray(bpSuggestions[idx]) && bpSuggestions[idx]?.length > 0 && (
                      <div className="mt-1 border rounded max-h-40 overflow-auto bg-white z-10">
                        {bpSuggestions[idx].slice(0,5).map((p: any) => (
                          <button key={p.id} type="button" className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50" onClick={() => { const items = [...form.items]; items[idx].base_product_id = p.id; setForm({ ...form, items }); setBpSuggestions((m) => ({ ...m, [idx]: [] })) }}>
                            {p.name} — R$ {(p.base_price||0).toLocaleString('pt-BR')} • {(p.base_points_cost||0)} pts
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input type="number" min={1} placeholder="Qtd" value={it.quantity} onChange={(e) => { const items = [...form.items]; items[idx].quantity = Number(e.target.value||1); setForm({ ...form, items }) }} />
                  <Input type="number" step="0.01" placeholder="Preço custom" value={it.custom_price ?? ''} onChange={(e) => { const items = [...form.items]; items[idx].custom_price = e.target.value === '' ? undefined : Number(e.target.value); setForm({ ...form, items }) }} />
                  <Input type="number" placeholder="Pontos custom" value={it.custom_points_cost ?? ''} onChange={(e) => { const items = [...form.items]; items[idx].custom_points_cost = e.target.value === '' ? undefined : Number(e.target.value); setForm({ ...form, items }) }} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!selected) return
                try {
                  const { data: { session } } = await supabase.auth.getSession()
                  const res = await fetch(`/api/gestor/orcamentos/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) }, body: JSON.stringify({ title: form.title, description: form.description, items: form.items }) })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar')
                  setEditOpen(false); setSelected(null); load()
                } catch (e) { console.error(e) }
              }}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
