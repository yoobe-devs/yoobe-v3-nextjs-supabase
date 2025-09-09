'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple-fixed'
import { Button } from '@/components/ui/button'
import { Building2, LogOut, Menu, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FuncionarioLayoutProps {
  children: React.ReactNode
}

export default function FuncionarioLayout({
  children,
}: FuncionarioLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Configurar notificações quando usuário estiver logado
  useEffect(() => {
    if (user) {
      // Simular notificações
      setNotifications(Math.floor(Math.random() * 5) + 1)
    }
  }, [user])

  // Fazer logout
  const handleLogout = async () => {
    try {
      await signOut()
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Usuário não autenticado. Redirecionando...
          </p>
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
              <Building2 className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Funcionário
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <span className="sr-only">Notificações</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM4.5 19.5L9 15l3 3L19.5 8.5"
                  />
                </svg>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
            </div>

            {/* Usuário */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">Funcionário</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
