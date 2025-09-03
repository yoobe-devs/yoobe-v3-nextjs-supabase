'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle, XCircle, ArrowLeft, Send, Plus, Trash2 } from 'lucide-react'

export default function BudgetDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [budget, setBudget] = useState<any | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gestor/orcamentos/${id}`)
      const js = await res.json()
      if (!res.ok) throw new Error(js?.error || 'Falha ao carregar orçamento')
      setBudget(js.budget)
      setTitle(js.budget?.title || '')
      setDescription(js.budget?.description || '')
    } catch (e) {
      console.error(e)
      setBudget(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) load() }, [id])

  const canEdit = useMemo(() => ['draft','rejected'].includes(budget?.status), [budget])
  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'reviewed': return <Badge className="bg-blue-100 text-blue-800">Revisado</Badge>
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const saveChanges = async () => {
    if (!budget) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const items = (budget.budget_items||[]).map((it:any)=>({ base_product_id: it.base_product_id, quantity: it.quantity, custom_price: it.custom_price ?? undefined, custom_points_cost: it.custom_points_cost ?? undefined, notes: it.notes ?? undefined }))
      const res = await fetch(`/api/gestor/orcamentos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) }, body: JSON.stringify({ title, description, items }) })
      const js = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(js?.error || 'Falha ao salvar')
      await load()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const submitBudget = async () => {
    if (!budget || budget.status !== 'draft') return
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/gestor/orcamentos/${id}/submit`, { method: 'POST', headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined })
      const js = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(js?.error || 'Falha ao enviar')
      await load()
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={()=>router.back()}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
        <div className="mt-4">Orçamento não encontrado.</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="outline" onClick={()=>router.push('/gestor/orcamentos')}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
          <h1 className="text-2xl font-bold">Orçamento</h1>
          <div className="text-sm text-gray-600">ID: {budget.id}</div>
        </div>
        <div className="flex gap-2 items-center">
          {statusBadge(budget.status)}
          {budget.status === 'draft' && (
            <Button onClick={submitBudget} disabled={submitting}>
              <Send className="h-4 w-4 mr-2" /> {submitting ? 'Enviando...' : 'Enviar para Aprovação'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Título</label>
            <Input value={title} onChange={(e)=>setTitle(e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <label className="text-sm block mb-1">Descrição</label>
            <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} disabled={!canEdit} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>Total: R$ {(budget.total_amount||0).toLocaleString('pt-BR')}</div>
            <div>Pontos: {(budget.total_points||0).toLocaleString('pt-BR')}</div>
            <div>Itens: {(budget.budget_items?.length||0)}</div>
          </div>
          {canEdit && (
            <div className="flex justify-end">
              <Button onClick={saveChanges} disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(budget.budget_items||[]).map((it:any, idx:number) => (
              <div key={it.id || idx} className="grid grid-cols-12 gap-3 items-center p-3 border rounded">
                <div className="col-span-5">
                  <div className="font-medium">{it.base_products?.name || it.base_product_id}</div>
                  <div className="text-xs text-gray-500">R$ {(it.custom_price ?? it.base_products?.base_price ?? 0).toLocaleString('pt-BR')} • {(it.custom_points_cost ?? it.base_products?.base_points_cost ?? 0)} pts</div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs block mb-1">Quantidade</label>
                  <Input type="number" min={1} value={it.quantity} disabled={!canEdit} onChange={(e)=>{
                    const q = Math.max(1, Number(e.target.value||1))
                    setBudget((b:any)=>({ ...b, budget_items: (b?.budget_items||[]).map((x:any, i:number)=> i===idx ? { ...x, quantity: q } : x) }))
                  }} />
                </div>
                <div className="col-span-4 text-right text-sm">
                  <div>Subtotal: R$ {(((it.custom_price ?? it.base_products?.base_price ?? 0) * (it.quantity||1))).toLocaleString('pt-BR')}</div>
                </div>
                {canEdit && (
                  <div className="col-span-1 text-right">
                    <Button variant="outline" size="sm" onClick={()=>{
                      setBudget((b:any)=>({ ...b, budget_items: (b?.budget_items||[]).filter((_:any, i:number)=> i!==idx) }))
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {canEdit && (
            <div className="flex justify-end mt-3">
              <Button variant="outline" onClick={()=>router.push('/gestor/base-products')}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar produtos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

