'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Building2, Bell, LogOut, Menu, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AdminNavigationMenu } from '@/components/admin-navigation-menu'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState(0)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error || !session) {
          router.push('/auth/login')
          return
        }

        // 1) Tentar autorizar via user_metadata (superadmin/admin_global)
        const metaRole = (session.user.user_metadata as any)?.role
        if (metaRole === 'admin_global' || metaRole === 'superadmin') {
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: metaRole,
            full_name: (session.user.user_metadata as any)?.full_name || session.user.email,
          })
          // Simular notificações
          setNotifications(Math.floor(Math.random() * 5) + 1)
          setLoading(false)
          return
        }

        // 2) Fallback: verificar na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError || !userData) {
          toast({
            title: 'Erro',
            description: 'Usuário não encontrado',
            variant: 'destructive',
          })
          router.push('/auth/login')
          return
        }

        // Aceitar tanto admin_global quanto superadmin
        if (userData.role !== 'admin_global' && userData.role !== 'superadmin') {
          toast({
            title: 'Acesso Negado',
            description: 'Você não tem permissão para acessar esta área',
            variant: 'destructive',
          })
          router.push('/choose-environment')
          return
        }

        setUser(userData)

        // Simular notificações
        setNotifications(Math.floor(Math.random() * 5) + 1)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router, toast])

  // Fazer logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden"
            >
              {sidebarCollapsed ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Yoobe Admin</h1>
                <p className="text-sm text-gray-600">
                  Painel de Administração Global
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>

            {/* Perfil do usuário */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || 'Administrador'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'admin'}
                </p>
              </div>

              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar unificada */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} hidden lg:block`}>
          <AdminNavigationMenu />
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
