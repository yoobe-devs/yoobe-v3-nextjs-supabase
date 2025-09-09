'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { BudgetManagementTabs } from '@/components/ui/BudgetManagementTabs'
import {
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CatalogToolbar,
  type CatalogQuery,
} from '@/components/gestor/catalog/CatalogToolbar'
import {
  CatalogGrid,
  type BaseProductListItem,
} from '@/components/gestor/catalog/CatalogGrid'
import { ProductSelectSheet } from '@/components/gestor/catalog/ProductSelectSheet'
import { toast } from 'sonner'

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

  // Catálogo Base (embed)
  const [catQuery, setCatQuery] = useState<CatalogQuery>({ sort: 'relevance' })
  const [catPage, setCatPage] = useState(1)
  const [catData, setCatData] = useState<{
    items: BaseProductListItem[]
    total: number
  } | null>(null)
  const [selId, setSelId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

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

  useEffect(() => {
    if (id) load()
  }, [id])

  // Carregar catálogo base
  useEffect(() => {
    ;(async () => {
      const params = new URLSearchParams()
      if (catQuery.q) params.set('q', catQuery.q)
      if (catQuery.minPrice) params.set('minPrice', String(catQuery.minPrice))
      if (catQuery.maxPrice) params.set('maxPrice', String(catQuery.maxPrice))
      if (catQuery.hasPoints) params.set('hasPoints', '1')
      if (catQuery.sort) params.set('sort', catQuery.sort)
      params.set('page', String(catPage))
      params.set('pageSize', '24')
      try {
        const r = await fetch(`/api/catalog/base-products?${params.toString()}`)
        const j = await r.json()
        setCatData({ items: j?.items || [], total: j?.total || 0 })
      } catch (e) {
        console.error('Falha ao carregar catálogo base', e)
        setCatData({ items: [], total: 0 })
      }
    })()
  }, [JSON.stringify(catQuery), catPage])

  const canEdit = useMemo(
    () => ['draft', 'rejected'].includes(budget?.status),
    [budget]
  )
  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Revisado</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const saveChanges = async () => {
    if (!budget) return
    setSaving(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const items = (budget.budget_items || []).map((it: any) => ({
        base_product_id: it.base_product_id,
        quantity: it.quantity,
        custom_price: it.custom_price ?? undefined,
        custom_points_cost: it.custom_points_cost ?? undefined,
        notes: it.notes ?? undefined,
      }))
      const res = await fetch(`/api/gestor/orcamentos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ title, description, items }),
      })
      const js = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(js?.error || 'Falha ao salvar')
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const submitBudget = async () => {
    if (!budget || budget.status !== 'draft') return
    setSubmitting(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch(`/api/gestor/orcamentos/${id}/submit`, {
        method: 'POST',
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      })
      const js = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(js?.error || 'Falha ao enviar')
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const addBaseToQuotation = async (payload: {
    baseProductId: string
    qty: number
    unitPrice?: number | null
    unitPoints?: number | null
    notes?: string | null
  }) => {
    if (!id) return
    const res = await fetch(`/api/quotations/${id}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Falha ao adicionar item ao orçamento', err)
    }
    await load()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando orçamento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div className="mt-4">Orçamento não encontrado.</div>
      </div>
    )
  }

  const handleUpdate = async (updatedBudget: any) => {
    try {
      const response = await fetch(`/api/gestor/orcamentos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBudget),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar orçamento')
      }

      await load()
      toast.success('Orçamento atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar orçamento'
      )
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/gestor/orcamentos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{budget.title}</h1>
            <p className="text-gray-600">ID: {budget.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {statusBadge(budget.status)}
        </div>
      </div>

      <BudgetManagementTabs
        budget={budget}
        onUpdate={handleUpdate}
        mode="gestor"
      />
    </div>
  )
}
