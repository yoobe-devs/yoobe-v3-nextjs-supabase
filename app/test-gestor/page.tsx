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
  Shield,
  Users,
  Package,
  ShoppingCart
} from "lucide-react"

interface GestorStatus {
  database: boolean
  employees: boolean
  products: boolean
  orders: boolean
  config: boolean
  points: boolean
}

export default function TestGestorPage() {
  const [status, setStatus] = useState<GestorStatus>({
    database: false,
    employees: false,
    products: false,
    orders: false,
    config: false,
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

  const testEmployees = async () => {
    try {
      const response = await fetch('/api/test/employees')
      return response.ok
    } catch {
      return false
    }
  }

  const testProducts = async () => {
    try {
      const response = await fetch('/api/test/products')
      return response.ok
    } catch {
      return false
    }
  }

  const testOrders = async () => {
    try {
      const response = await fetch('/api/test/orders')
      return response.ok
    } catch {
      return false
    }
  }

  const testConfig = async () => {
    try {
      const response = await fetch('/api/test/config')
      return response.ok
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
        testEmployees(),
        testProducts(),
        testOrders(),
        testConfig(),
        testPoints()
      ])

      setStatus({
        database: results[0],
        employees: results[1],
        products: results[2],
        orders: results[3],
        config: results[4],
        points: results[5]
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Testando Sistema do Gestor</h2>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste do Sistema do Gestor</h1>
          <p className="text-gray-600">Verificação completa de todas as funcionalidades do gestor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Banco de Dados
              </CardTitle>
              <CardDescription>
                Tabelas e estrutura do sistema
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
                <Users className="h-5 w-5" />
                Funcionários
              </CardTitle>
              <CardDescription>
                Sistema de gestão de funcionários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status dos Funcionários</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.employees)}
                  {getStatusBadge(status.employees)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos
              </CardTitle>
              <CardDescription>
                Catálogo de produtos da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status dos Produtos</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.products)}
                  {getStatusBadge(status.products)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pedidos
              </CardTitle>
              <CardDescription>
                Sistema de pedidos da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status dos Pedidos</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.orders)}
                  {getStatusBadge(status.orders)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configurações da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status das Configurações</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.config)}
                  {getStatusBadge(status.config)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Sistema de Pontos
              </CardTitle>
              <CardDescription>
                Gestão de pontos dos funcionários
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
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => window.location.reload()}>
            Executar Testes Novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/gestor/dashboard'}>
            Ir para Dashboard do Gestor
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
            Ir para Admin
          </Button>
        </div>
      </div>
    </div>
  )
}
