'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface OrcamentoItem {
  id: string
  client_product_id: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Orcamento {
  id: string
  client_id: string
  gestor_id: string
  title: string
  description?: string
  status: string
  total_amount: number
  created_at: string
  orcamento_items?: OrcamentoItem[]
}

export default function AdminOrcamentosPage() {
  const supabase = createClientComponentClient()
  const [items, setItems] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch('/api/admin/orcamentos', {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Falha ao carregar orçamentos')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchData() }, [])

  const approve = async (id: string) => {
    const r = await fetch(`/api/admin/orcamentos/${id}/approve`, { method: 'POST' })
    const data = await r.json()
    if (!r.ok) { alert(data?.error || 'Falha ao aprovar'); return }
    alert('Orçamento aprovado e convertido em pedido')
    void fetchData()
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
        <h1 className="text-2xl font-semibold">Orçamentos (Admin)</h1>
        <p className="text-muted-foreground">Aprovar, reprovar e converter em pedidos</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map(o => (
          <Card key={o.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{o.title}</span>
                <span className="text-sm text-muted-foreground">R$ {o.total_amount.toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">Status: {o.status}</div>
              <div className="text-sm">Itens: {(o.orcamento_items ?? []).length}</div>
              <div className="flex gap-2">
                <Button onClick={() => approve(o.id)} disabled={o.status !== 'novo' && o.status !== 'em_analise'}>Aprovar e converter</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


