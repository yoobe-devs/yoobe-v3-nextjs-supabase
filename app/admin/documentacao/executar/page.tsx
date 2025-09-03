'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

export default function ExecutarDocumentacaoPage() {
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [logs, setLogs] = useState<string>('')
  const [opts, setOpts] = useState({ screens: true, api: true, smart: false })

  const run = async () => {
    try {
      setRunning(true); setMsg(null); setLogs('')
      const res = await fetch('/api/docs/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runScreens: opts.screens,
          runApiDocs: opts.api,
          runSmartDocs: opts.smart
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao executar scripts')
      const parts: string[] = []
      if (data.results?.screens) {
        parts.push('=== generate-screen-docs.js ===')
        parts.push(data.results.screens.stdout || '')
        if (data.results.screens.stderr) parts.push('stderr:\n' + data.results.screens.stderr)
      }
      if (data.results?.api) {
        parts.push('=== generate-docs.mjs ===')
        parts.push(data.results.api.stdout || '')
        if (data.results.api.stderr) parts.push('stderr:\n' + data.results.api.stderr)
      }
      if (data.results?.smart) {
        parts.push('=== init-smart-docs.js --no-watch ===')
        parts.push(data.results.smart.stdout || '')
        if (data.results.smart.stderr) parts.push('stderr:\n' + data.results.smart.stderr)
      }
      setLogs(parts.join('\n\n'))
      setMsg('Documentação gerada com sucesso.')
    } catch (e: any) {
      setMsg(e?.message || 'Erro ao executar')
    } finally {
      setRunning(false)
    }
  }
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Executar Script de Documentação</CardTitle>
          <CardDescription>Gera documentação viva (OpenAPI/Markdown) e telas. Requer autenticação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <Checkbox checked={opts.screens} onCheckedChange={(v) => setOpts(s => ({ ...s, screens: Boolean(v) }))} />
              <span>Docs das Telas (screens)</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={opts.api} onCheckedChange={(v) => setOpts(s => ({ ...s, api: Boolean(v) }))} />
              <span>API Reference + OpenAPI</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={opts.smart} onCheckedChange={(v) => setOpts(s => ({ ...s, smart: Boolean(v) }))} />
              <span>Smart Docs (sem monitoramento)</span>
            </label>
          </div>
          <Button onClick={run} disabled={running}>{running ? 'Executando...' : 'Gerar Documentação'}</Button>
          {msg && <div className={`text-sm ${msg?.toLowerCase().includes('erro') ? 'text-red-700' : 'text-green-700'}`}>{msg}</div>}
          {logs && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Logs</div>
              <Textarea value={logs} readOnly className="h-64 font-mono" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
