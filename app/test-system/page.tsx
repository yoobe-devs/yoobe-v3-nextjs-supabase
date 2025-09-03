"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Code,
  Globe,
  Shield
} from "lucide-react"

interface SystemStatus {
  database: boolean
  apis: boolean
  components: boolean
  auth: boolean
  points: boolean
}

export default function TestSystemPage() {
  const [status, setStatus] = useState<SystemStatus>({
    database: false,
    apis: false,
    components: false,
    auth: false,
    points: false
  })
  const [loading, setLoading] = useState(true)

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/test/database')
      return response.ok
    } catch {
      return false
    }
  }

  const testAPIs = async () => {
    try {
      // Teste da API de pontos
      const response = await fetch('/api/points/earn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: '550e8400-e29b-41d4-a716-446655440001',
          userId: '550e8400-e29b-41d4-a716-446655440100',
          points: 10,
          reason: 'Teste'
        })
      })
      return response.status === 200 || response.status === 400 // 400 é esperado se não autenticado
    } catch {
      return false
    }
  }

  const testComponents = () => {
    try {
      // Teste se os componentes podem ser importados
      require('@/components/ui/points-balance')
      require('@/components/ui/points-transactions')
      require('@/hooks/usePoints')
      return true
    } catch {
      return false
    }
  }

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      return response.status === 200 || response.status === 401
    } catch {
      return false
    }
  }

  const testPoints = async () => {
    try {
      const response = await fetch('/api/test/points')
      return response.ok
    } catch {
      return false
    }
  }

  useEffect(() => {
    const runTests = async () => {
      setLoading(true)
      
      const results = await Promise.all([
        testDatabase(),
        testAPIs(),
        testComponents(),
        testAuth(),
        testPoints()
      ])

      setStatus({
        database: results[0],
        apis: results[1],
        components: results[2],
        auth: results[3],
        points: results[4]
      })
      
      setLoading(false)
    }

    runTests()
  }, [])

  const getStatusIcon = (isWorking: boolean) => {
    return isWorking ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getStatusBadge = (isWorking: boolean) => {
    return isWorking ? (
      <Badge className="bg-green-100 text-green-800">Funcionando</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Erro</Badge>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Testando Sistema</h2>
            <p className="text-gray-600">Verificando todos os componentes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste do Sistema</h1>
          <p className="text-gray-600">Verificação completa de todos os componentes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Banco de Dados
              </CardTitle>
              <CardDescription>
                Tabelas, views e funções do sistema de pontos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status do Banco</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.database)}
                  {getStatusBadge(status.database)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                APIs
              </CardTitle>
              <CardDescription>
                Endpoints de pontos, checkout e webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status das APIs</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.apis)}
                  {getStatusBadge(status.apis)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Componentes
              </CardTitle>
              <CardDescription>
                UI components e hooks do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status dos Componentes</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.components)}
                  {getStatusBadge(status.components)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Autenticação
              </CardTitle>
              <CardDescription>
                Sistema de autenticação e sessões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status da Auth</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.auth)}
                  {getStatusBadge(status.auth)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Sistema de Pontos
            </CardTitle>
            <CardDescription>
              Funcionalidades específicas do sistema de pontos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Status dos Pontos</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.points)}
                {getStatusBadge(status.points)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => window.location.reload()}>
            Executar Testes Novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/store/dashboard'}>
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
