"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SafeImage } from '@/components/ui/safe-image'

export function ProductSelectSheet({ productId, open, onClose, onAdd }: { productId?: string | null; open: boolean; onClose: () => void; onAdd: (payload: { baseProductId: string; variantId?: string | null; qty: number; unitPrice?: number | null; unitPoints?: number | null; notes?: string | null }) => Promise<void> | void }) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<any | null>(null)
  const [qty, setQty] = useState(1)
  const [variantId, setVariantId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    (async () => {
      if (!open || !productId) return
      setLoading(true)
      try {
        const r = await fetch(`/api/catalog/base-products/${productId}`)
        const j = await r.json()
        if (r.ok) setDetail(j?.item || null)
      } finally { setLoading(false) }
    })()
  }, [open, productId])

  const submit = async () => {
    if (!detail) return
    await onAdd({ baseProductId: detail.id, variantId, qty: qty || 1, unitPrice: detail.priceFrom ?? null, unitPoints: detail.pointsFrom ?? null, notes: notes || undefined })
    onClose()
    setQty(1)
    setNotes('')
    setVariantId(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Selecionar Produto</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-sm text-gray-600">Carregando...</div>
        ) : detail ? (
          <div className="space-y-3">
            <div className="aspect-[3/2] bg-gray-50">
              <SafeImage src={detail.images?.[0]} alt={detail.name} className="w-full h-full object-cover" />
            </div>
            <div className="font-medium">{detail.name}</div>
            <div className="text-sm text-gray-700">{detail.short}</div>
            <div className="text-sm">
              {detail.priceFrom != null && <span>R$ {detail.priceFrom.toLocaleString('pt-BR')}</span>}
              {detail.pointsFrom != null && <span className="ml-2">• {detail.pointsFrom} pts</span>}
            </div>
            {Array.isArray(detail.variants) && detail.variants.length > 0 && (
              <div>
                <label className="text-xs block mb-1">Variante</label>
                <select className="border rounded px-2 py-2 text-sm w-full" value={variantId || ''} onChange={e => setVariantId(e.target.value || null)}>
                  <option value="">Selecione</option>
                  {detail.variants.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name || v.sku || v.id}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs block mb-1">Quantidade</label>
                <Input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value||1)))} />
              </div>
              <div>
                <label className="text-xs block mb-1">Observações</label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="(opcional)" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={submit}>Adicionar ao Orçamento</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Produto não encontrado</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
