'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  UserPlus, 
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
  Trash2,
  BarChart3,
  Settings
} from 'lucide-react'

export default function FuncionariosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const [employees] = useState([
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@jointecnologia.com.br',
      phone: '(11) 99999-9999',
      position: 'Desenvolvedor Full Stack',
      department: 'Tecnologia',
      status: 'ativo',
      hireDate: '2024-01-15',
      lastAccess: '2025-01-02 14:30',
      points: 1250,
      redemptions: 8,
      orders: 12
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@jointecnologia.com.br',
      phone: '(11) 88888-8888',
      position: 'Designer UX/UI',
      department: 'Design',
      status: 'ativo',
      hireDate: '2024-03-20',
      lastAccess: '2025-01-02 13:45',
      points: 890,
      redemptions: 5,
      orders: 7
    },
    {
      id: 3,
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@jointecnologia.com.br',
      phone: '(11) 77777-7777',
      position: 'Product Manager',
      department: 'Produto',
      status: 'ativo',
      hireDate: '2024-02-10',
      lastAccess: '2025-01-02 12:15',
      points: 2100,
      redemptions: 15,
      orders: 22
    },
    {
      id: 4,
      name: 'Ana Costa',
      email: 'ana.costa@jointecnologia.com.br',
      phone: '(11) 66666-6666',
      position: 'QA Engineer',
      department: 'Qualidade',
      status: 'inativo',
      hireDate: '2024-06-01',
      lastAccess: '2024-12-15 16:20',
      points: 450,
      redemptions: 3,
      orders: 4
    }
  ])

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'inativo': return 'bg-red-100 text-red-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <CheckCircle className="h-4 w-4" />
      case 'inativo': return <XCircle className="h-4 w-4" />
      case 'pendente': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Funcionários</h1>
          <p className="text-gray-600">Gerencie sua equipe, acompanhe atividades e pontos.</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{employees.filter(e => e.status === 'ativo').length}</span> ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.reduce((sum, e) => sum + e.points, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round(employees.reduce((sum, e) => sum + e.points, 0) / employees.length)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Resgates</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.reduce((sum, e) => sum + e.redemptions, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round(employees.reduce((sum, e) => sum + e.redemptions, 0) / employees.length)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.reduce((sum, e) => sum + e.orders, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round(employees.reduce((sum, e) => sum + e.orders, 0) / employees.length)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Encontre funcionários específicos rapidamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou cargo..."
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
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários ({filteredEmployees.length})</CardTitle>
          <CardDescription>Lista completa de funcionários da empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs text-gray-500">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Building className="h-3 w-3 mr-1" />
                        {employee.department}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusIcon(employee.status)}
                        {employee.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Contratado em {new Date(employee.hireDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{employee.points} pts</div>
                    <p className="text-xs text-gray-500">
                      {employee.redemptions} resgates, {employee.orders} pedidos
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerenciar funcionários e atividades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <UserPlus className="h-6 w-6 mb-2" />
              <span>Adicionar Funcionário</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              <span>Enviar Convites</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Relatórios</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span>Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
