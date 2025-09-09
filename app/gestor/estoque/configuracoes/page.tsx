'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function EstoqueSettingsPage() {
  const supabase = createClientComponentClient()
  const [storeId, setStoreId] = useState('')
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState(5)
  const [allowVirtual, setAllowVirtual] = useState(true)
  const [realtime, setRealtime] = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const cid = user?.user_metadata?.company_id
      if (!cid) { setLoading(false); return }
      setStoreId(cid)
      try {
        const r = await fetch(`/api/v2/admin/stores/${cid}/inventory/settings`)
        const j = await r.json()
        setThreshold(j?.default_low_stock_threshold ?? 5)
        setAllowVirtual(j?.allow_virtual_stock ?? true)
        setRealtime(j?.realtime_stream_enabled ?? true)
      } catch {}
      setLoading(false)
    })()
  }, [])

  const save = async () => {
    try {
      const r = await fetch(`/api/v2/admin/stores/${storeId}/inventory`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ default_low_stock_threshold: threshold, allow_virtual_stock: allowVirtual, realtime_stream_enabled: realtime }) })
      const j = await r.json().catch(()=>({}))
      if (!r.ok) throw new Error(j?.error || 'Falha ao salvar')
      toast.success('Configurações salvas')
    } catch (e:any) {
      toast.error(e?.message || 'Erro ao salvar')
    }
  }

  if (loading) return <div className="p-6"><div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações de Estoque</h1>
          <p className="text-gray-600">Ajuste padrão e flags da loja</p>
        </div>
        <Button onClick={save}>Salvar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>Aplicadas como padrão nos itens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm block mb-1">Threshold Padrão (baixo estoque)</label>
            <Input type="number" className="max-w-xs" value={threshold} onChange={e=>setThreshold(Number(e.target.value||0))} />
          </div>
          <div className="flex items-center gap-2">
            <input id="allowVirtual" type="checkbox" checked={allowVirtual} onChange={e=>setAllowVirtual(e.target.checked)} />
            <label htmlFor="allowVirtual">Permitir estoque virtual (ajustes pelo admin)</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="realtime" type="checkbox" checked={realtime} onChange={e=>setRealtime(e.target.checked)} />
            <label htmlFor="realtime">Atualizações em tempo real (SSE)</label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

