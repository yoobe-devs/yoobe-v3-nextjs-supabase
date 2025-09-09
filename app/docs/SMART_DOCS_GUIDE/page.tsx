'use client'

import { useEffect, useState } from 'react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Button } from '@/components/ui/button'

export default function SmartDocsGuidePage() {
  const [md, setMd] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)

  const fetchDoc = async () => {
    setErr(null)
    try {
      const res = await fetch('/api/docs/v3/SMART_DOCS_GUIDE')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-red-600">Erro: {err}</p>
            <Button variant="outline" onClick={fetchDoc}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!md) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando documentação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header simples para documentação */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Yoobe Documentation
                </h1>
                <p className="text-sm text-gray-600">
                  Sistema de Documentação Inteligente
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">v3.1.0</div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="flex justify-end p-4">
            <Button variant="outline" onClick={fetchDoc}>
              Atualizar
            </Button>
          </div>
          <MarkdownRenderer content={md} title="SMART_DOCS_GUIDE" />
        </div>
      </main>
    </div>
  )
}
