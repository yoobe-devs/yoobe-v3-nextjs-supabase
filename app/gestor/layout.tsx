'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/layout/header'
import Sidebar, { getGestorSidebarItems } from '@/components/layout/sidebar'

interface GestorLayoutProps {
  children: React.ReactNode
}

export default function GestorLayout({ children }: GestorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Buscar dados do usuário logado
    const fetchUser = async () => {
      try {
        console.log('🔍 Buscando usuário logado...')
        
        // Verificar se há uma sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Erro ao obter sessão:', sessionError)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ Sessão ativa encontrada:', session.user.email)
          
          // Usar dados da sessão - SEM DEPENDER DA TABELA USERS
          setUser({
            name: session.user.user_metadata?.name || 'João Silva',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'manager',
            company_name: 'Join Tecnologia'
          })
          
          console.log('✅ Dados do usuário definidos:', {
            name: session.user.user_metadata?.name || 'João Silva',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'manager',
            company_name: 'Join Tecnologia'
          })
        } else {
          console.log('⚠️ Nenhuma sessão ativa encontrada')
          
          // Tentar obter usuário atual
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
          
          if (authError) {
            console.error('❌ Erro ao buscar usuário autenticado:', authError)
          } else if (authUser) {
            console.log('✅ Usuário autenticado encontrado:', authUser.email)
            
            setUser({
              name: authUser.user_metadata?.name || 'João Silva',
              email: authUser.email,
              role: authUser.user_metadata?.role || 'manager',
              company_name: 'Join Tecnologia'
            })
          } else {
            console.log('⚠️ Nenhum usuário autenticado')
          }
        }
      } catch (error) {
        console.error('❌ Erro geral ao buscar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const handleProfile = () => {
    // Navigate to profile
    console.log('Profile clicked')
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
          <p className="text-sm text-gray-500 mt-2">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Usuário não encontrado</p>
          <p className="text-sm text-gray-500 mt-2">Verifique se você está logado</p>
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Fazer Login
            </button>
            <br />
            <button 
              onClick={() => window.location.href = '/choose-environment'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Escolher Ambiente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        user={user}
        notifications={3}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          items={getGestorSidebarItems()}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={sidebarCollapsed ? 'w-16' : 'w-64'}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
