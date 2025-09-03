"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Home,
  Users,
  Package,
  ShoppingCart,
  Settings
} from "lucide-react"

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  url: string
}

export default function TestGestorRedirectPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  const testRoutes = [
    { name: 'Dashboard', url: '/gestor/dashboard', icon: Home },
    { name: 'Funcionários', url: '/gestor/funcionarios', icon: Users },
    { name: 'Produtos', url: '/gestor/produtos', icon: Package },
    { name: 'Pedidos', url: '/gestor/pedidos', icon: ShoppingCart },
    { name: 'Estoque', url: '/gestor/estoque', icon: Package },
    { name: 'Configurações', url: '/gestor/configuracoes', icon: Settings },
  ]

  useEffect(() => {
    if (!authLoading) {
      testAllRoutes()
    }
  }, [authLoading])

  const testAllRoutes = async () => {
    setLoading(true)
    const newResults: TestResult[] = []

    for (const route of testRoutes) {
      try {
        const response = await fetch(route.url, { method: 'HEAD' })
        newResults.push({
          name: route.name,
          status: response.ok ? 'success' : 'error',
          message: response.ok ? 'Acessível' : `Erro ${response.status}`,
          url: route.url
        })
      } catch (error) {
        newResults.push({
          name: route.name,
          status: 'error',
          message: 'Erro de rede',
          url: route.url
        })
      }
    }

    setResults(newResults)
    setLoading(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Funcionando</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Testando Redirecionamentos do Gestor</h2>
            <p className="text-gray-600">Verificando todas as rotas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste de Redirecionamentos do Gestor</h1>
          <p className="text-gray-600">
            Status do usuário: {user ? `Logado como ${user.email}` : 'Não logado'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testRoutes.map((route, index) => {
            const result = results[index]
            const Icon = route.icon
            
            return (
              <Card key={route.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {route.name}
                  </CardTitle>
                  <CardDescription>
                    Teste de acesso à rota: {route.url}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <div className="flex items-center gap-2">
                        {result && getStatusIcon(result.status)}
                        {result && getStatusBadge(result.status)}
                      </div>
                    </div>
                    
                    {result && (
                      <div className="text-sm text-gray-600">
                        {result.message}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(route.url, '_blank')}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = route.url}
                      >
                        Navegar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Usuário:</strong> {user?.email || 'Não logado'}</div>
                <div><strong>ID do Usuário:</strong> {user?.id || 'N/A'}</div>
                <div><strong>Status de Autenticação:</strong> {authLoading ? 'Carregando' : 'Pronto'}</div>
                <div><strong>URL Atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={testAllRoutes}>
              Executar Testes Novamente
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/choose-environment'}>
              Ir para Escolha de Ambiente
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/gestor/dashboard'}>
              Ir para Dashboard do Gestor
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
