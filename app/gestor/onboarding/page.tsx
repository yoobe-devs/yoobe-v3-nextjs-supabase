'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  UserPlus, 
  Users, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Bell,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

export default function OnboardingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const [employees] = useState([
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@jointecnologia.com.br',
      phone: '(11) 99999-9999',
      department: 'Desenvolvimento',
      position: 'Desenvolvedor Full Stack',
      startDate: '2025-09-15',
      status: 'concluido',
      onboardingProgress: 100,
      lastActivity: '2025-09-02',
      notes: 'Onboarding concluído com sucesso',
      documents: ['Contrato', 'Documentos RH', 'Acesso Sistemas'],
      mentor: 'Maria Santos',
      nextSteps: 'Nenhuma ação necessária'
    },
    {
      id: 2,
      name: 'Ana Oliveira',
      email: 'ana.oliveira@jointecnologia.com.br',
      phone: '(11) 88888-8888',
      department: 'Marketing',
      position: 'Analista de Marketing Digital',
      startDate: '2025-09-20',
      status: 'ativo',
      onboardingProgress: 75,
      lastActivity: '2025-09-02',
      notes: 'Em processo de integração',
      documents: ['Contrato', 'Documentos RH'],
      mentor: 'Pedro Costa',
      nextSteps: 'Configurar acesso aos sistemas de marketing'
    },
    {
      id: 3,
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@jointecnologia.com.br',
      phone: '(11) 77777-7777',
      department: 'Vendas',
      position: 'Representante de Vendas',
      startDate: '2025-09-25',
      status: 'convidado',
      onboardingProgress: 25,
      lastActivity: '2025-08-30',
      notes: 'Convite enviado, aguardando resposta',
      documents: ['Convite enviado'],
      mentor: 'João Silva',
      nextSteps: 'Aguardar confirmação do candidato'
    },
    {
      id: 4,
      name: 'Fernanda Lima',
      email: 'fernanda.lima@jointecnologia.com.br',
      phone: '(11) 66666-6666',
      department: 'RH',
      position: 'Analista de Recursos Humanos',
      startDate: '2025-10-01',
      status: 'pendente',
      onboardingProgress: 0,
      lastActivity: '2025-08-28',
      notes: 'Aguardando aprovação final',
      documents: ['CV', 'Entrevista'],
      mentor: 'Maria Santos',
      nextSteps: 'Aprovar contratação e iniciar processo'
    },
    {
      id: 5,
      name: 'Roberto Almeida',
      email: 'roberto.almeida@jointecnologia.com.br',
      phone: '(11) 55555-5555',
      department: 'Financeiro',
      position: 'Analista Financeiro',
      startDate: '2025-09-10',
      status: 'concluido',
      onboardingProgress: 100,
      lastActivity: '2025-09-01',
      notes: 'Onboarding concluído',
      documents: ['Contrato', 'Documentos RH', 'Acesso Sistemas'],
      mentor: 'Pedro Costa',
      nextSteps: 'Nenhuma ação necessária'
    }
  ])

  const [stats] = useState({
    totalEmployees: 156,
    onboardingActive: 23,
    onboardingCompleted: 89,
    pendingApproval: 8,
    invited: 12,
    averageTime: '5.2 dias',
    successRate: '94%'
  })

  const statuses = [
    { value: 'all', label: 'Todos os Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'convidado', label: 'Convidado', color: 'bg-blue-100 text-blue-800' },
    { value: 'ativo', label: 'Ativo', color: 'bg-purple-100 text-purple-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800' }
  ]

  const departments = ['all', 'Desenvolvimento', 'Marketing', 'Vendas', 'RH', 'Financeiro', 'Suporte']

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="h-4 w-4" />
      case 'convidado': return <Mail className="h-4 w-4" />
      case 'ativo': return <UserPlus className="h-4 w-4" />
      case 'concluido': return <CheckCircle className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'convidado': return 'Convidado'
      case 'ativo': return 'Ativo'
      case 'concluido': return 'Concluído'
      default: return 'Desconhecido'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-600'
    if (progress >= 75) return 'bg-blue-600'
    if (progress >= 50) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getOnboardingStatus = (employee: any) => {
    if (employee.status === 'concluido') {
      return 'Onboarding concluído com sucesso'
    } else if (employee.status === 'ativo') {
      return 'Em processo de integração'
    } else if (employee.status === 'convidado') {
      return 'Convite enviado, aguardando resposta'
    } else if (employee.status === 'pendente') {
      return 'Aguardando aprovação final'
    }
    return 'Status desconhecido'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-600">Gerencie a integração de novos funcionários na empresa</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.onboardingCompleted}</span> integrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Onboarding</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.onboardingActive}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">{stats.pendingApproval}</span> pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}</div>
            <p className="text-xs text-muted-foreground">
              Onboardings bem-sucedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTime}</div>
            <p className="text-xs text-muted-foreground">
              Para completar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statuses.slice(1).map((status) => (
          <Card key={status.value} className="text-center">
            <CardContent className="pt-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${status.color} mb-3`}>
                {getStatusIcon(status.value)}
              </div>
              <div className="text-2xl font-bold">
                {employees.filter(emp => emp.status === status.value).length}
              </div>
              <p className="text-sm text-gray-600">{status.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar funcionários por nome, email ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <div className="space-y-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(employee.status)}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(employee.status)}
                      <span>{getStatusText(employee.status)}</span>
                    </div>
                  </Badge>
                  <span className="text-sm text-gray-500">#{employee.id}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Employee Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{employee.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Building className="h-3 w-3" />
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-3 w-3" />
                      <span>{employee.position}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Progress */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progresso do Onboarding:</span>
                  <span className="text-sm font-medium">{employee.onboardingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(employee.onboardingProgress)}`}
                    style={{ width: `${employee.onboardingProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Documents and Next Steps */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Documentos:</p>
                    <div className="space-y-1">
                      {employee.documents.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Próximos Passos:</p>
                    <p className="text-sm font-medium">{employee.nextSteps}</p>
                    {employee.mentor && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Mentor:</p>
                        <p className="text-sm font-medium">{employee.mentor}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status do Onboarding:</p>
                    <p className="font-medium">{getOnboardingStatus(employee)}</p>
                    {employee.notes && (
                      <p className="text-xs text-gray-500 mt-1">{employee.notes}</p>
                    )}
                  </div>
                  <div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>Início: {employee.startDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>Última atividade: {employee.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {employee.status === 'pendente' && (
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  {employee.status === 'convidado' && (
                    <Button size="sm" variant="outline">
                      <Bell className="h-3 w-3 mr-1" />
                      Lembrar
                    </Button>
                  )}
                  {employee.status === 'ativo' && (
                    <Button size="sm" variant="outline">
                      <Send className="h-3 w-3 mr-1" />
                      Enviar Material
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou adicionar novos funcionários
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Funcionário
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie o processo de onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Funcionário
            </Button>
            <Button variant="outline" className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Enviar Lembretes
            </Button>
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
