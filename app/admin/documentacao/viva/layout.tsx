'use client'

import { ReactNode } from 'react'

interface DocumentationLayoutProps {
  children: ReactNode
}

export default function DocumentationLayout({
  children,
}: DocumentationLayoutProps) {
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
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
