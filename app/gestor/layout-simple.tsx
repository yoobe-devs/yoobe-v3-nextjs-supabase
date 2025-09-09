'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/layout/header'
import Sidebar, { getGestorSidebarItems } from '@/components/layout/sidebar'

interface GestorLayoutProps {
  children: React.ReactNode
}

export default function GestorLayoutSimple({ children }: GestorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const [companyId, setCompanyId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Carregar dados do usuário de forma simplificada
    const fetchUser = async () => {
      try {
        console.log('🔍 Carregando usuário (versão simplificada)...')

        // Simular usuário logado para evitar travamento
        setUser({
          name: 'Gestor Yoobe',
          email: 'gestor@yoobe.com',
          role: 'manager',
          company_name: 'Yoobe',
        })
        setCompanyId('1')

        console.log('✅ Usuário carregado (simulado)')
      } catch (error) {
        console.error('❌ Erro ao carregar usuário:', error)
        // Mesmo com erro, definir usuário padrão para evitar travamento
        setUser({
          name: 'Gestor Yoobe',
          email: 'gestor@yoobe.com',
          role: 'manager',
          company_name: 'Yoobe',
        })
        setCompanyId('1')
      } finally {
        setLoading(false)
      }
    }

    // Carregar com timeout para evitar travamento
    setTimeout(fetchUser, 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
          <p className="text-sm text-gray-500 mt-2">
            Versão simplificada carregando...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erro de Autenticação
          </h1>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados do usuário.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    )
  }

  const sidebarItems = getGestorSidebarItems()

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <Header
            user={user}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
