'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductImage } from '@/components/ui/safe-image'
import { Search, Filter, Tag, Package } from 'lucide-react'

export default function BaseProductsForBudgetPage() {
  const supabase = createClientComponentClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [drafts, setDrafts] = useState<Array<{ id: string, title: string }>>([])
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | ''>('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewProduct, setPreviewProduct] = useState<any | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(search ? { search } : {}), ...(category !== 'all' ? { category } : {}) })
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/gestor/base-products?${params.toString()}`, { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined })
      const js = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(js?.error || 'Falha ao carregar base-products')
      setItems(js?.data?.products || js?.products || [])
      setTotal(js?.data?.pagination?.total || 0)
    } catch (e) {
      console.error(e)
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const loadDraftBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const companyId = user?.user_metadata?.company_id
      const { data } = await supabase
        .from('budgets')
        .select('id,title')
        .eq('company_id', companyId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(25)
      setDrafts(data || [])
      if (!selectedBudgetId) {
        const local = typeof window !== 'undefined' ? window.localStorage.getItem('gestor.current_budget_id') : null
        if (local) setSelectedBudgetId(local)
      }
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [page, limit, category])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])
  useEffect(() => { loadDraftBudgets() }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((p:any)=>{ if (p.product_categories?.name) set.add(p.product_categories.name) })
    return Array.from(set)
  }, [items])

  const toggle = (id: string) => {
    setSelectedIds(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
    setQuantities(q => ({ ...q, [id]: q[id] || 1 }))
  }

  const openPreview = (p: any) => { setPreviewProduct(p); setPreviewOpen(true) }

  const addToBudget = async () => {
    try {
      const ids = Array.from(selectedIds)
      if (ids.length === 0) return
      const selected = items.filter((p:any)=>selectedIds.has(p.id))
      const payload = selected.map((p:any)=>({ base_product_id: p.id, quantity: Math.max(1, quantities[p.id] || 1) }))
      const { data: { session } } = await supabase.auth.getSession()
      const headers: any = { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) }
      let budgetId = selectedBudgetId
      if (budgetId) {
        const getRes = await fetch(`/api/gestor/orcamentos/${budgetId}`)
        const getJs = await getRes.json().catch(()=>({}))
        if (getRes.ok && getJs?.budget) {
          const existing = (getJs.budget.budget_items||[]).map((it:any)=>({ base_product_id: it.base_product_id, quantity: it.quantity, custom_price: it.custom_price ?? undefined, custom_points_cost: it.custom_points_cost ?? undefined }))
          const merged = existing.concat(payload)
          const patchRes = await fetch(`/api/gestor/orcamentos/${budgetId}`, { method: 'PATCH', headers, body: JSON.stringify({ items: merged }) })
          if (!patchRes.ok) throw new Error('Falha ao adicionar')
        } else {
          budgetId = ''
        }
      }
      if (!budgetId) {
        const postRes = await fetch('/api/gestor/orcamentos', { method: 'POST', headers, body: JSON.stringify({ title: 'Orçamento atual', items: payload }) })
        const postJs = await postRes.json().catch(()=>({}))
        if (!postRes.ok) throw new Error('Falha ao criar orçamento')
        budgetId = postJs?.data?.budget?.id
        if (budgetId) {
          setSelectedBudgetId(budgetId)
          if (typeof window !== 'undefined') window.localStorage.setItem('gestor.current_budget_id', budgetId)
        }
      }
      if (budgetId) window.location.href = `/gestor/orcamentos/${budgetId}`
    } catch (e) { console.error(e) }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Empty state (when no items) */}
      {!loading && total === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Nenhum produto base disponível</CardTitle>
            <CardDescription>
              Para montar orçamentos, é necessário popular o catálogo base. Veja abaixo como proceder no ambiente de desenvolvimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>Opção 1 (Admin):</strong> Popule pelo painel do Admin → Produtos → Catálogo Base.
            </div>
            <div>
              <strong>Opção 2 (Dev ‑ seed rápido):</strong>
              <pre className="mt-2 p-3 bg-gray-50 rounded border overflow-auto text-xs">
{`npm run seed:base-products
# depois, recarregue esta página`}
              </pre>
            </div>
            <div className="text-xs text-gray-500">
              Dica: certifique‑se de que o Supabase local está rodando e as variáveis
              NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas.
            </div>
            <div className="pt-2">
              <Button variant="outline" onClick={()=>window.location.reload()}>Recarregar</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Preview Modal */}
      <div className={`${previewOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={()=>setPreviewOpen(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{previewProduct?.name}</h2>
                <div className="text-sm text-gray-600">{previewProduct?.product_categories?.name || 'Sem categoria'}</div>
              </div>
              <button onClick={()=>setPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <ProductImage src={previewProduct?.image_url} alt={previewProduct?.name || 'Produto'} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Preço:</span> R$ {(previewProduct?.base_price||0).toLocaleString('pt-BR')}</div>
                <div><span className="text-gray-500">Pontos:</span> {(previewProduct?.base_points_cost||0)} pts</div>
                <div className="text-gray-700 whitespace-pre-wrap">{previewProduct?.description || 'Sem descrição'}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span>Qtd:</span>
                  <Input className="w-24" type="number" min={1} value={quantities[previewProduct?.id||'']||1} onChange={(e)=>setQuantities(q=>({ ...q, [previewProduct?.id||'']: Math.max(1, Number(e.target.value||1)) }))} />
                  <Button onClick={()=>{ if (previewProduct) { setSelectedIds(s=> new Set(s).add(previewProduct.id)); setQuantities(q=>({ ...q, [previewProduct.id]: Math.max(1, quantities[previewProduct.id]||1) })); setPreviewOpen(false) } }}>Adicionar seleção</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Produtos Base para Orçamento</h1>
          <p className="text-gray-600">Selecione os itens do catálogo global para montar seu orçamento.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Orçamento atual:</span>
          <select className="px-3 py-2 border rounded-md text-sm" value={selectedBudgetId} onChange={(e)=>{ setSelectedBudgetId(e.target.value); if (e.target.value && typeof window !== 'undefined') window.localStorage.setItem('gestor.current_budget_id', e.target.value) }}>
            <option value="">Criar novo ao adicionar</option>
            {drafts.map(d => (<option key={d.id} value={d.id}>{d.title || d.id}</option>))}
          </select>
          <Button
            variant="outline"
            onClick={() => { if (selectedBudgetId) window.location.href = `/gestor/orcamentos/${selectedBudgetId}` }}
            disabled={!selectedBudgetId}
          >
            Ver orçamento atual
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Encontre produtos rapidamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar por nome..." className="pl-10" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select className="px-3 py-2 border rounded-md" value={category} onChange={(e)=>{ setCategory(e.target.value); setPage(1) }}>
                <option value="all">Todas categorias</option>
                {categories.map((c)=> (<option key={c} value={c}>{c}</option>))}
              </select>
              <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Mais Filtros</Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Total: {total}</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
              <span>Página {page}</span>
              <button className="px-2 py-1 border rounded" disabled={(page*limit)>=total} onClick={()=>setPage(p=>p+1)}>Próxima</button>
              <select className="px-2 py-1 border rounded" value={limit} onChange={(e)=>{ setPage(1); setLimit(Number(e.target.value)) }}>
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p:any) => (
          <Card key={p.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={()=>toggle(p.id)} />
                  <CardTitle className="text-base">{p.name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">{p.product_categories?.name || 'Sem categoria'}</Badge>
              </div>
              <CardDescription className="text-sm">R$ {(p.base_price||0).toLocaleString('pt-BR')} • {(p.base_points_cost||0)} pts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <button className="w-full h-full" onClick={()=>openPreview(p)}>
                  <ProductImage src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                </button>
              </div>
              {selectedIds.has(p.id) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Qtd:</span>
                  <Input type="number" className="w-24" min={1} value={quantities[p.id]||1} onChange={(e)=>setQuantities(q=>({ ...q, [p.id]: Math.max(1, Number(e.target.value||1)) }))} />
                </div>
              )}
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Selecionados: {selectedIds.size}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>window.location.href='/gestor/orcamentos'}>Ver orçamentos</Button>
          <Button onClick={addToBudget} disabled={selectedIds.size===0}>Adicionar ao orçamento</Button>
        </div>
      </div>
    </div>
  )
}
