"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

type Store = { id: string; name: string; company_id: string }

export default function AdminResgateV2FlagsPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch('/api/admin/stores').then(r => r.json())
        if (s?.data) setStores(s.data)
        for (const st of s.data || []) {
          const f = await fetch(`/api/admin/stores/${st.id}/feature-flags/resgate-v2`).then(r => r.json())
          setFlags(prev => ({ ...prev, [st.id]: !!f?.data?.enabled }))
        }
      } catch (e: any) {
        setErr(e?.message || 'Falha ao carregar lojas')
      }
    })()
  }, [])

  const toggle = async (storeId: string, enabled: boolean) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/stores/${storeId}/feature-flags/resgate-v2`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ enabled })
      })
      if (!res.ok) throw new Error('Falha ao salvar')
      setFlags(prev => ({ ...prev, [storeId]: enabled }))
    } catch (e: any) {
      setErr(e?.message || 'Erro ao alternar flag')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resgate v2 — Toggles por Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {err && <div className="text-sm text-red-700">{err}</div>}
          {!stores.length && <div className="text-sm text-gray-600">Carregando lojas...</div>}
          {stores.map(st => (
            <div key={st.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{st.name}</div>
                <div className="text-xs text-gray-500">Store ID: {st.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Ativar preview</span>
                <Switch checked={!!flags[st.id]} onCheckedChange={(v) => toggle(st.id, Boolean(v))} disabled={loading} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

