'use client'

import { useEffect, useState } from 'react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Button } from '@/components/ui/button'

export default function SmartDocsQuickReferencePage() {
  const [md, setMd] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)

  const fetchDoc = async () => {
    setErr(null)
    try {
      const res = await fetch('/api/docs/v3/SMART_DOCS_QUICK_REFERENCE')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao carregar doc')
      setMd(data.content || '')
    } catch (e: any) {
      setErr(e?.message || 'Erro desconhecido')
    }
  }

  useEffect(() => {
    fetchDoc()
  }, [])

  if (err) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-red-600">Erro: {err}</p>
        <Button variant="outline" onClick={fetchDoc}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!md) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Carregando documentação...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end p-4">
        <Button variant="outline" onClick={fetchDoc}>
          Atualizar
        </Button>
      </div>
      <MarkdownRenderer content={md} title="SMART_DOCS_QUICK_REFERENCE" />
    </div>
  )
}
