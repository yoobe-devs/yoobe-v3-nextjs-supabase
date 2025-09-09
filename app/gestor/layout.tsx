'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/auth-provider-simple-fixed'
import Header from '@/components/layout/header'
import Sidebar, { getGestorSidebarItems } from '@/components/layout/sidebar'
// import { useMenuCounts } from '@/hooks/useMenuCounts' // Temporariamente desabilitado

interface GestorLayoutProps {
  children: React.ReactNode
}

export default function GestorLayout({ children }: GestorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [companyId, setCompanyId] = useState<string | undefined>(undefined)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  // Temporariamente desabilitado para evitar travamento
  // const { counts, loading: countsLoading, error: countsError } = useMenuCounts(companyId)

  useEffect(() => {
    // Configurar companyId baseado no usuário logado
    if (user) {
      console.log('🔍 Configurando companyId para usuário:', user.email)
      setCompanyId('mock-company-id') // Por enquanto usar mock
      console.log('✅ CompanyId configurado')
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
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
