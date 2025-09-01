'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface ClientProduct {
  id: string
  name?: string
  description?: string
  price?: number
  status: string
  stock_quantity: number
  base_products?: {
    id: string
    name: string
    base_price: number
    sku?: string | null
    image_url?: string | null
  }
}

export default function GestorCatalogoPage() {
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const clientId = user?.user_metadata?.company_id as string | undefined

  const [items, setItems] = useState<ClientProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({})
  const [priceMap, setPriceMap] = useState<Record<string, { unitPrice: number, totalPrice: number }>>({})

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
        if (!resp.ok) throw new Error(data?.error || 'Falha ao carregar catálogo')
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [clientId, supabase])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(p => (p.name || p.base_products?.name || '').toLowerCase().includes(q))
  }, [items, search])

  const handleQtyChange = async (id: string, nextQty: number) => {
    setQtyMap(prev => ({ ...prev, [id]: nextQty }))
    if (!clientId) return
    const qty = Math.max(1, Math.floor(nextQty || 1))
    try {
      const r = await fetch(`/api/clients/${clientId}/products/${id}/price?qty=${qty}`)
      const data = await r.json()
      if (r.ok) {
        setPriceMap(prev => ({ ...prev, [id]: { unitPrice: data.unitPrice, totalPrice: data.totalPrice } }))
      }
    } catch {}
  }

  if (!clientId) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-sm text-muted-foreground">Nenhum cliente associado ao usuário.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Carregando catálogo...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Catálogo do Gestor</h1>
          <p className="text-muted-foreground">Produtos replicados disponíveis para orçamento</p>
        </div>
        <div className="w-64">
          <Input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const qty = qtyMap[p.id] ?? 1
          const price = priceMap[p.id]
          const unit = price?.unitPrice ?? (p.price ?? p.base_products?.base_price ?? 0)
          const total = price?.totalPrice ?? unit * qty
          return (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{p.name || p.base_products?.name}</span>
                  <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">SKU Base: {p.base_products?.sku || '-'}</div>
                <div className="flex items-center gap-2">
                  <Input type="number" min={1} value={qty} onChange={e => handleQtyChange(p.id, Number(e.target.value))} className="w-24" />
                  <Button variant="outline" onClick={() => handleQtyChange(p.id, qty)}>Simular</Button>
                </div>
                <div className="text-sm">
                  <div>Preço unitário: R$ {unit.toFixed(2)}</div>
                  <div>Total: R$ {total.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


