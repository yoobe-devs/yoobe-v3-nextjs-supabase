"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Tier {
  id: string
  base_product_id: string
  min_qty: number
  unit_price?: number | null
  discount_pct?: number | null
}

export function BulkPricingEditor({ baseProductId }: { baseProductId: string }) {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [minQty, setMinQty] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [discountPct, setDiscountPct] = useState('')

  const fetchTiers = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/base-products/${baseProductId}/tiers`)
      const data = await r.json()
      if (r.ok) setTiers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTiers()
  }, [baseProductId])

  const addTier = async () => {
    const body: any = { min_qty: Number(minQty) }
    if (unitPrice) body.unit_price = Number(unitPrice)
    if (discountPct) body.discount_pct = Number(discountPct)
    if (!body.min_qty || body.min_qty <= 0) return
    setAdding(true)
    try {
      const r = await fetch(`/api/base-products/${baseProductId}/tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await r.json()
      if (r.ok) {
        setTiers(prev => [...prev, data].sort((a, b) => a.min_qty - b.min_qty))
        setMinQty(''); setUnitPrice(''); setDiscountPct('')
      }
    } finally {
      setAdding(false)
    }
  }

  const removeTier = async (tierId: string) => {
    const r = await fetch(`/api/base-products/${baseProductId}/tiers?tierId=${tierId}`, { method: 'DELETE' })
    if (r.ok) setTiers(prev => prev.filter(t => t.id !== tierId))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="space-y-1">
          <Label>Quantidade mínima</Label>
          <Input type="number" min={1} value={minQty} onChange={e => setMinQty(e.target.value)} placeholder="10" />
        </div>
        <div className="space-y-1">
          <Label>Preço unitário (opcional)</Label>
          <Input type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="29.90" />
        </div>
        <div className="space-y-1">
          <Label>Desconto % (opcional)</Label>
          <Input type="number" step="0.01" value={discountPct} onChange={e => setDiscountPct(e.target.value)} placeholder="5" />
        </div>
        <div>
          <Button onClick={addTier} disabled={adding || !minQty}>Adicionar faixa</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando faixas…</div>
      ) : tiers.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nenhuma faixa cadastrada.</div>
      ) : (
        <div className="space-y-2">
          {tiers.map((t) => (
            <div key={t.id} className="flex items-center justify-between border rounded p-2">
              <div className="text-sm">mín {t.min_qty} • {t.unit_price ? `R$ ${t.unit_price.toFixed(2)}` : (t.discount_pct ? `${t.discount_pct}% off` : '—')}</div>
              <Button variant="outline" size="sm" onClick={() => removeTier(t.id)}>Remover</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BulkPricingEditor


