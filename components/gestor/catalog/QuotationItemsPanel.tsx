"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function QuotationItemsPanel({ quotationId }: { quotationId: string }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [totals, setTotals] = useState({ amount: 0, points: 0 })

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/gestor/orcamentos/${quotationId}`)
      const j = await r.json()
      const its = j?.budget?.budget_items || []
      setItems(its)
      const t = its.reduce((acc: any, it: any) => {
        const price = it.custom_price ?? it.base_products?.base_price ?? 0
        const pts = it.custom_points_cost ?? it.base_products?.base_points_cost ?? 0
        acc.amount += price * (it.quantity || 1)
        acc.points += pts * (it.quantity || 1)
        return acc
      }, { amount: 0, points: 0 })
      setTotals(t)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [quotationId])

  const updateQty = async (itemId: string, qty: number) => {
    await fetch(`/api/quotations/${quotationId}/items/${itemId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ qty }) })
    await load()
  }
  const remove = async (itemId: string) => {
    await fetch(`/api/quotations/${quotationId}/items/${itemId}`, { method: 'DELETE' })
    await load()
  }

  if (loading) return <div className="text-sm text-gray-600">Carregando itens...</div>

  return (
    <div className="space-y-3">
      {items.map((it: any) => (
        <div key={it.id} className="grid grid-cols-12 gap-3 items-center p-3 border rounded">
          <div className="col-span-5">
            <div className="font-medium">{it.base_products?.name || it.base_product_id}</div>
            <div className="text-xs text-gray-500">R$ {(it.custom_price ?? it.base_products?.base_price ?? 0).toLocaleString('pt-BR')} • {(it.custom_points_cost ?? it.base_products?.base_points_cost ?? 0)} pts</div>
          </div>
          <div className="col-span-2">
            <label className="text-xs block mb-1">Quantidade</label>
            <Input type="number" min={1} defaultValue={it.quantity} onBlur={(e) => updateQty(it.id, Math.max(1, Number((e.target as HTMLInputElement).value||1)))} />
          </div>
          <div className="col-span-4 text-right text-sm">
            <div>Subtotal: R$ {(((it.custom_price ?? it.base_products?.base_price ?? 0) * (it.quantity||1))).toLocaleString('pt-BR')}</div>
          </div>
          <div className="col-span-1 text-right">
            <Button variant="outline" size="sm" onClick={() => remove(it.id)}>Remover</Button>
          </div>
        </div>
      ))}
      <div className="text-right text-sm pt-2 border-t">
        <div>Total: R$ {totals.amount.toLocaleString('pt-BR')}</div>
        <div>Pontos: {totals.points.toLocaleString('pt-BR')}</div>
      </div>
    </div>
  )
}

