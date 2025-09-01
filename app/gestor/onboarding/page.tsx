"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Mail,
  Phone,
  Building2
} from 'lucide-react'

interface OnboardingEmployee {
  id: string
  name: string
  email: string
  department: string
  position: string
  status: 'pending' | 'invited' | 'active' | 'completed'
  invitedAt?: string
  joinedAt?: string
  lastActivity?: string
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados de onboarding
    const loadOnboardingData = async () => {
      try {
        // Dados mockados para demonstração
        const mockEmployees: OnboardingEmployee[] = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao.silva@empresa.com',
            department: 'TI',
            position: 'Desenvolvedor',
            status: 'completed',
            invitedAt: '2024-01-10',
            joinedAt: '2024-01-12',
            lastActivity: '2024-01-15'
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria.santos@empresa.com',
            department: 'RH',
            position: 'Analista',
            status: 'active',
            invitedAt: '2024-01-12',
            joinedAt: '2024-01-14',
            lastActivity: '2024-01-16'
          },
          {
            id: '3',
            name: 'Pedro Costa',
            email: 'pedro.costa@empresa.com',
            department: 'Marketing',
            position: 'Designer',
            status: 'invited',
            invitedAt: '2024-01-15'
          },
          {
            id: '4',
            name: 'Ana Oliveira',
            email: 'ana.oliveira@empresa.com',
            department: 'Vendas',
            position: 'Vendedor',
            status: 'pending'
          },
          {
            id: '5',
            name: 'Carlos Ferreira',
            email: 'carlos.ferreira@empresa.com',
            department: 'Financeiro',
            position: 'Contador',
            status: 'invited',
            invitedAt: '2024-01-16'
          }
        ]
        
        setEmployees(mockEmployees)
      } catch (error) {
        console.error('Erro ao carregar dados de onboarding:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      case 'invited':
        return <Badge variant="default">Convidado</Badge>
      case 'active':
        return <Badge variant="default" className="bg-blue-600">Ativo</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Concluído</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'invited':
        return <Mail className="h-4 w-4 text-blue-600" />
      case 'active':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const stats = {
    total: employees.length,
    pending: employees.filter(e => e.status === 'pending').length,
    invited: employees.filter(e => e.status === 'invited').length,
    active: employees.filter(e => e.status === 'active').length,
    completed: employees.filter(e => e.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados de onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
              <p className="text-gray-600 mt-2">
                Gerencie o processo de integração de novos funcionários
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Enviar Convites
              </Button>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar Funcionário
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Funcionários
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando convite
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convidados</CardTitle>
              <Mail className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.invited}</div>
              <p className="text-xs text-muted-foreground">
                Convite enviado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Em processo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Onboarding finalizado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionários em Onboarding</CardTitle>
            <CardDescription>
              Acompanhe o progresso de integração de cada funcionário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(employee.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {employee.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {employee.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {employee.department} • {employee.position}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(employee.status)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      {employee.invitedAt && (
                        <span>Convidado: {employee.invitedAt}</span>
                      )}
                      {employee.joinedAt && (
                        <span>Entrou: {employee.joinedAt}</span>
                      )}
                      {employee.lastActivity && (
                        <span>Última atividade: {employee.lastActivity}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 space-x-2">
                    {employee.status === 'pending' && (
                      <Button size="sm">
                        <Mail className="h-3 w-3 mr-1" />
                        Convidar
                      </Button>
                    )}
                    {employee.status === 'invited' && (
                      <Button variant="outline" size="sm">
                        <Phone className="h-3 w-3 mr-1" />
                        Lembrar
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Adicionar Funcionário
              </CardTitle>
              <CardDescription>
                Adicione um novo funcionário ao processo de onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Enviar Convites
              </CardTitle>
              <CardDescription>
                Envie convites em lote para funcionários pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Convites
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Visualize relatórios de onboarding e métricas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
