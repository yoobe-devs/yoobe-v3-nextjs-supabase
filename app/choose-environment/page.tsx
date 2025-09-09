'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple-fixed'
import { getDashboardRoute, getUserRole } from '@/lib/auth-redirects'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Building, User, LogOut } from 'lucide-react'

export default function ChooseEnvironmentPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    if (!loading && user) {
      console.log('ChooseEnvironment: User logged in:', user.email)
      // Extrair role dos metadados do usuário
      const userRole = getUserRole(user)
      setRole(userRole.role)
    }
  }, [user, loading])

  const handleLogout = async () => {
    await signOut()
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
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">Y</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Escolha seu Ambiente
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Bem-vindo,{' '}
            <span className="font-semibold text-blue-600">{user.email}</span>!
          </p>
          <Badge variant="secondary" className="text-sm">
            {role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
            {role === 'manager' && <Building className="h-3 w-3 mr-1" />}
            {role === 'user' && <User className="h-3 w-3 mr-1" />}
            {role}
          </Badge>
        </div>

        {/* Environment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Admin Global */}
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm"
            onClick={() => router.push('/admin/dashboard')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Admin Global
              </CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto">
                Super Admin
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center mb-4">
                Gerencie todas as empresas, usuários e configurações do sistema
              </CardDescription>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Gerenciar empresas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Configurar produtos globais
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Monitorar todas as lojas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Relatórios consolidados
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Gestor da Loja */}
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-300 bg-white/80 backdrop-blur-sm"
            onClick={() => router.push('/gestor/dashboard')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Gestor da Loja
              </CardTitle>
              <Badge variant="outline" className="w-fit mx-auto">
                Client Admin
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center mb-4">
                Gerencie sua empresa, funcionários e produtos
              </CardDescription>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Gerenciar funcionários
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Configurar produtos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Campanhas e promoções
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Relatórios da empresa
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Funcionário */}
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-teal-300 bg-white/80 backdrop-blur-sm"
            onClick={() => router.push('/funcionario/dashboard')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Funcionário
              </CardTitle>
              <Badge variant="default" className="w-fit mx-auto">
                Client User
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center mb-4">
                Acesse a loja corporativa e gerencie seus resgates
              </CardDescription>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                  Visualizar produtos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                  Fazer resgates
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                  Acompanhar pedidos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                  Ver histórico
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/auth/login')}
              className="px-6"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Trocar Usuário
            </Button>
            <Button variant="outline" onClick={handleLogout} className="px-6">
              Sair do Sistema
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Informações da Sessão
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo de Usuário</p>
              <p className="font-medium text-gray-900 capitalize">{role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-gray-900 text-xs">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Yoobe v3.3.0 - Sistema Real com Supabase</p>
        </div>
      </div>
    </div>
  )
}
