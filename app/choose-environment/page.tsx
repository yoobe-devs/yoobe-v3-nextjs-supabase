"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ChooseEnvironmentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [role, setRole] = useState<string>('')
  const [actionMsg, setActionMsg] = useState<string>('')

  useEffect(() => {
    if (!loading && user) {
      console.log('ChooseEnvironment: User logged in:', user.email)
    }
  }, [user, loading])

  useEffect(() => {
    const loadRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const r = (session?.user?.user_metadata as any)?.role || ''
        setRole(r)
      } catch {}
    }
    loadRole()
  }, [supabase])

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Escolha seu Ambiente
          </h1>
          <p className="text-gray-600">
            Bem-vindo, {user.email}! Escolha o ambiente que deseja acessar.
          </p>
          {(role === 'superadmin' || role === 'admin_global') && (
            <div className="mt-4">
              <Button onClick={() => router.push('/admin/dashboard')}>
                Entrar no Admin Global
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Global */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/dashboard'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Admin Global</CardTitle>
                <Badge variant="secondary">Super Admin</Badge>
              </div>
              <CardDescription>
                Gerencie todas as lojas, empresas e usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Gerenciar empresas</li>
                <li>• Configurar produtos globais</li>
                <li>• Monitorar todas as lojas</li>
                <li>• Relatórios consolidados</li>
              </ul>
            </CardContent>
          </Card>

          {/* Gestor da Loja */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/gestor/dashboard'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Gestor da Loja</CardTitle>
                <Badge variant="outline">Client Admin</Badge>
              </div>
              <CardDescription>
                Gerencie sua empresa, funcionários e produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Gerenciar funcionários</li>
                <li>• Configurar produtos</li>
                <li>• Campanhas e promoções</li>
                <li>• Relatórios da empresa</li>
              </ul>
            </CardContent>
          </Card>

          {/* Funcionário */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/store/dashboard'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Funcionário</CardTitle>
                <Badge variant="default">Client User</Badge>
              </div>
              <CardDescription>
                Acesse a loja corporativa e gerencie seus resgates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Visualizar produtos</li>
                <li>• Fazer resgates</li>
                <li>• Acompanhar pedidos</li>
                <li>• Ver histórico</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/legacy')}
            className="mr-4"
          >
            Funcionalidades Antigas
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/auth/login')}
          >
            Sair
          </Button>
        </div>

        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900 mb-2">Ações de Desenvolvimento</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={async () => {
                  setActionMsg('')
                  try {
                    const r = await fetch('/api/admin/promote-self', { method: 'POST' })
                    const j = await r.json().catch(()=>({}))
                    setActionMsg(r.ok ? '✅ Promovido a superadmin (recarregue a página)' : (j?.error || 'Falha ao promover'))
                  } catch (e) { setActionMsg('Falha ao promover') }
                }}
              >
                Promover-me a Superadmin
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setActionMsg('')
                  try {
                    const r = await fetch('/api/admin/superadmin/seed', { method: 'POST' })
                    const j = await r.json().catch(()=>({}))
                    setActionMsg(r.ok ? '✅ Superadmin de teste criado (veja logs do servidor)' : (j?.error || 'Falha no seed'))
                  } catch (e) { setActionMsg('Falha no seed') }
                }}
              >
                Seed Superadmin (dev)
              </Button>
            </div>
            {actionMsg && (<div className="mt-2 text-sm text-purple-800">{actionMsg}</div>)}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Informações do Usuário:</h3>
          <p className="text-sm text-blue-700">Email: {user.email}</p>
          <p className="text-sm text-blue-700">ID: {user.id}</p>
          <p className="text-sm text-blue-700">Criado em: {new Date(user.created_at).toLocaleString()}</p>
          {role && <p className="text-sm text-blue-700">Role (metadados): {role}</p>}
        </div>
      </div>
    </div>
  )
}
