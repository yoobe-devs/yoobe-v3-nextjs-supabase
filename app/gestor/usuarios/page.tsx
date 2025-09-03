'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  UserPlus,
  Shield,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Crown,
  Briefcase
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'manager' | 'employee' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  company: string
  department: string
  lastLogin: string
  createdAt: string
  totalPoints: number
  totalOrders: number
  totalRedemptions: number
  avatar: string
  address: string
  permissions: string[]
}

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@jointech.com',
      phone: '(11) 99999-9999',
      role: 'manager',
      status: 'active',
      company: 'Join Tecnologia',
      department: 'TI',
      lastLogin: '2025-01-02T10:30:00Z',
      createdAt: '2024-01-15T00:00:00Z',
      totalPoints: 15000,
      totalOrders: 25,
      totalRedemptions: 12,
      avatar: '/avatars/joao.jpg',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      permissions: ['manage_users', 'manage_products', 'view_reports', 'manage_budgets']
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@jointech.com',
      phone: '(11) 88888-8888',
      role: 'employee',
      status: 'active',
      company: 'Join Tecnologia',
      department: 'Marketing',
      lastLogin: '2025-01-01T15:45:00Z',
      createdAt: '2024-03-20T00:00:00Z',
      totalPoints: 8500,
      totalOrders: 18,
      totalRedemptions: 8,
      avatar: '/avatars/maria.jpg',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      permissions: ['view_products', 'place_orders', 'view_points']
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@jointech.com',
      phone: '(11) 77777-7777',
      role: 'employee',
      status: 'pending',
      company: 'Join Tecnologia',
      department: 'Vendas',
      lastLogin: null,
      createdAt: '2024-12-28T00:00:00Z',
      totalPoints: 0,
      totalOrders: 0,
      totalRedemptions: 0,
      avatar: '/avatars/pedro.jpg',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      permissions: ['view_products']
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@jointech.com',
      phone: '(11) 66666-6666',
      role: 'viewer',
      status: 'inactive',
      company: 'Join Tecnologia',
      department: 'RH',
      lastLogin: '2024-11-15T09:20:00Z',
      createdAt: '2024-06-10T00:00:00Z',
      totalPoints: 3200,
      totalOrders: 5,
      totalRedemptions: 2,
      avatar: '/avatars/ana.jpg',
      address: 'Rua Oscar Freire, 200 - São Paulo, SP',
      permissions: ['view_reports']
    }
  ])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800'
      case 'employee': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager': return <Crown className="h-4 w-4" />
      case 'employee': return <Briefcase className="h-4 w-4" />
      case 'viewer': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'manager': return 'Gestor'
      case 'employee': return 'Funcionário'
      case 'viewer': return 'Visualizador'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'inactive': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  const roles = ['manager', 'employee', 'viewer']
  const statuses = ['active', 'inactive', 'pending']

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const totalPoints = users.reduce((sum, u) => sum + u.totalPoints, 0)
  const pendingUsers = users.filter(u => u.status === 'pending').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600">Gerencie gestores, funcionários e permissões da empresa.</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{activeUsers}</span> ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round(totalPoints / totalUsers).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'manager').length}</div>
            <p className="text-xs text-muted-foreground">
              Com permissões avançadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Encontre usuários específicos rapidamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Papéis</option>
                {roles.map(role => (
                  <option key={role} value={role}>{getRoleText(role)}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{getStatusText(status)}</option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>Lista completa de usuários da empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="flex items-center text-sm text-gray-500">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs text-gray-500">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {user.department}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {user.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.totalPoints.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-gray-500">pontos</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.totalOrders}</div>
                    <p className="text-xs text-gray-500">pedidos</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.totalRedemptions}</div>
                    <p className="text-xs text-gray-500">resgates</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleIcon(user.role)}
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusIcon(user.status)}
                        {getStatusText(user.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      Último login:
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
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
                      <BarChart3 className="h-4 w-4" />
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
          <CardDescription>Gerenciar usuários e permissões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <UserPlus className="h-6 w-6 mb-2" />
              <span>Novo Usuário</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              <span>Gerenciar Permissões</span>
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
