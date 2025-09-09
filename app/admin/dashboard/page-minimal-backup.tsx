'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há usuário no localStorage
    const savedUser = localStorage.getItem('fallback_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (e) {
        console.error('Erro ao parsear usuário:', e)
        router.push('/auth/login')
      }
    } else {
      router.push('/auth/login')
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('fallback_user')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Yoobe Admin</h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {user.user_metadata?.role || 'admin'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Dashboard Administrativo
          </h2>
          <p className="mt-2 text-gray-600">
            Gerencie empresas, usuários e configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Empresas</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">+2 desde o mês passado</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-gray-500">+12 desde o mês passado</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-gray-500">+89 desde o mês passado</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendas</p>
                <p className="text-2xl font-bold text-gray-900">R$ 45,231</p>
                <p className="text-xs text-gray-500">+20.1% desde o mês passado</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50">
                🏢 Gerenciar Empresas
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50">
                👥 Gerenciar Usuários
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50">
                📦 Catálogo de Produtos
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status do Servidor</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Versão</span>
                <span className="text-sm font-mono">v3.3.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Última Atualização</span>
                <span className="text-sm">Hoje</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usuário Logado</span>
                <span className="text-sm font-mono">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
