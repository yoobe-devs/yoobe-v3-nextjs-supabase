'use client'

import { useEffect, useState } from 'react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function SmartDocsSystemCompletePage() {
  const [md, setMd] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchDoc = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await fetch('/api/docs/v3/SMART_DOCS_SYSTEM_COMPLETE')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao carregar doc')
      setMd(data.content || '')
    } catch (e: any) {
      setErr(e?.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoc()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando documentação...</p>
        </div>
      </div>
    )
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Erro ao Carregar Documentação
            </h1>
            <p className="text-red-600 mb-6">Erro: {err}</p>
            <div className="space-x-4">
              <Button variant="outline" onClick={fetchDoc}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              <Link href="/docs">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Documentação
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Documentação Inteligente
                </h1>
                <p className="text-sm text-gray-600">
                  Documentação Completa - v3.1.0
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/docs">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="text-sm text-gray-500">v3.1.0</div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <MarkdownRenderer
          content={md}
          title="Sistema de Documentação Inteligente"
          lastUpdated="Setembro 2025"
          version="v3.1.0"
        />
      </main>
    </div>
  )
}
