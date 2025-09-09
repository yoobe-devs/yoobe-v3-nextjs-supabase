'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/layout/header'
import Sidebar, { getGestorSidebarItems } from '@/components/layout/sidebar'
// import { useMenuCounts } from '@/hooks/useMenuCounts' // Temporariamente desabilitado

interface GestorLayoutProps {
  children: React.ReactNode
}

export default function GestorLayout({ children }: GestorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const [companyId, setCompanyId] = useState<string | undefined>(undefined)
  // Temporariamente desabilitado para evitar travamento
  // const { counts, loading: countsLoading, error: countsError } = useMenuCounts(companyId)

  useEffect(() => {
    // Buscar dados do usuário logado
    const fetchUser = async () => {
      try {
        console.log('🔍 Configurando usuário para desenvolvimento...')

        // Usuário mock para desenvolvimento
        setUser({
          name: 'Gestor Yoobe',
          email: 'gestor@yoobe.com',
          role: 'manager',
          company_name: 'Yoobe',
        })
        setCompanyId('mock-company-id')

        console.log('✅ Usuário mock configurado')
      } catch (error) {
        console.error('❌ Erro ao configurar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    // Delay pequeno para evitar travamento
    setTimeout(fetchUser, 100)
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const handleProfile = () => {
    router.push('/gestor/perfil')
  }

  const handleSettings = () => {
    // Navigate to settings
    console.log('Settings clicked')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
          <p className="text-sm text-gray-500 mt-2">
            Verificando autenticação...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Usuário não encontrado</p>
          <p className="text-sm text-gray-500 mt-2">
            Verifique se você está logado
          </p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => (window.location.href = '/auth/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Fazer Login
            </button>
            <br />
            <button
              onClick={() => (window.location.href = '/choose-environment')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Escolher Ambiente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Monta itens do sidebar com badges estáticas (temporariamente)
  const baseItems = getGestorSidebarItems()
  const items = baseItems.map(it => {
    // Temporariamente usando badges estáticas para evitar travamento
    return it
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          items={items}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={sidebarCollapsed ? 'w-16' : 'w-64'}
        />

        {/* Main Content */}
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
