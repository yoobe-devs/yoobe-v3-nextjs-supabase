'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface ClientProduct {
  id: string
  name?: string
  price?: number
  base_products?: { name: string, base_price: number }
}

export default function GestorOrcamentosPage() {
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const clientId = user?.user_metadata?.company_id as string | undefined

  const [products, setProducts] = useState<ClientProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({})
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const run = async () => {
      if (!clientId) return
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const resp = await fetch(`/api/clients/${clientId}/products`, {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data?.error || 'Falha ao carregar produtos')
        setProducts(data)
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [clientId, supabase])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => (p.name || p.base_products?.name || '').toLowerCase().includes(q))
  }, [products, search])

  const items = useMemo(() => {
    return Object.entries(qtyMap)
      .filter(([_, qty]) => (qty ?? 0) > 0)
      .map(([id, qty]) => {
        const p = products.find(pp => pp.id === id)!
        const unit = p.price ?? p.base_products?.base_price ?? 0
        return { client_product_id: id, quantity: qty, unit_price: unit }
      })
  }, [qtyMap, products])

  const total = useMemo(() => items.reduce((acc, it) => acc + it.quantity * it.unit_price, 0), [items])

  const createBudget = async () => {
    if (!clientId || !user) return
    if (!title || items.length === 0) return
    try {
      setCreating(true)
      const payload = { title, description, items }
      const r = await fetch(`/api/clients/${clientId}/orcamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Falha ao criar orçamento')
      setTitle('')
      setDescription('')
      setQtyMap({})
      alert('Orçamento criado!')
    } catch (e) {
      console.error(e)
      alert('Erro ao criar orçamento')
    } finally {
      setCreating(false)
    }
  }

  if (!clientId) {
    return <div className="container mx-auto p-6 text-sm text-muted-foreground">Nenhum cliente associado.</div>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orçamentos</h1>
        <p className="text-muted-foreground">Monte e envie um orçamento ao admin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />

          <div className="flex items-center justify-between">
            <Input className="w-64" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="text-sm">Total: R$ {total.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => {
              const qty = qtyMap[p.id] ?? 0
              const unit = p.price ?? p.base_products?.base_price ?? 0
              return (
                <div key={p.id} className="border rounded p-3 space-y-2">
                  <div className="font-medium">{p.name || p.base_products?.name}</div>
                  <div className="text-xs text-muted-foreground">Preço: R$ {unit.toFixed(2)}</div>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} value={qty} onChange={e => setQtyMap(prev => ({ ...prev, [p.id]: Number(e.target.value) }))} className="w-24" />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button onClick={createBudget} disabled={creating || !title || items.length === 0}>{creating ? 'Enviando...' : 'Enviar orçamento'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


