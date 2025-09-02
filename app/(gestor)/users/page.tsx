'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  UserPlus, 
  Mail, 
  Users, 
  UserCheck, 
  UserX, 
  Crown,
  Shield,
  User,
  Calendar,
  Building,
  Send,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react'

interface CompanyUser {
  id: string
  email: string
  name: string
  surname: string
  role: 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'
  status: 'active' | 'inactive'
  created_at: string
  last_login?: string
  company_role?: string
}

interface UserInvitation {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'expired'
  invited_by: string
  token: string
  created_at: string
  expires_at: string
  invited_by_user?: {
    name: string
    email: string
  }
}

export default function GestorUsersPage() {
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [invitations, setInvitations] = useState<UserInvitation[]>([])
  const [filteredUsers, setFilteredUsers] = useState<CompanyUser[]>([])
  const [filteredInvitations, setFilteredInvitations] = useState<UserInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'funcionario' as 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario',
    message: ''
  })
  const [userForm, setUserForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    tax_id: '',
    fiscal_regime: '',
    role: 'funcionario' as 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario',
    status: 'active' as 'active' | 'inactive'
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: CompanyUser[] = [
      {
        id: '1',
        email: 'joao.silva@techcorp.com',
        name: 'João',
        surname: 'Silva',
        role: 'gestor',
        status: 'active',
        created_at: '2024-01-10T09:00:00Z',
        last_login: '2024-01-15T14:30:00Z',
        company_role: 'gestor'
      },
      {
        id: '2',
        email: 'maria.santos@techcorp.com',
        name: 'Maria',
        surname: 'Santos',
        role: 'funcionario',
        status: 'active',
        created_at: '2024-01-12T11:00:00Z',
        last_login: '2024-01-15T10:15:00Z',
        company_role: 'funcionario'
      },
      {
        id: '3',
        email: 'carlos.oliveira@techcorp.com',
        name: 'Carlos',
        surname: 'Oliveira',
        role: 'funcionario',
        status: 'inactive',
        created_at: '2024-01-08T16:00:00Z',
        last_login: '2024-01-10T08:45:00Z',
        company_role: 'funcionario'
      }
    ]

    const mockInvitations: UserInvitation[] = [
      {
        id: '1',
        email: 'ana.costa@techcorp.com',
        status: 'pending',
        invited_by: 'joao.silva',
        token: 'token-123',
        created_at: '2024-01-15T10:00:00Z',
        expires_at: '2024-01-22T10:00:00Z',
        invited_by_user: {
          name: 'João Silva',
          email: 'joao.silva@techcorp.com'
        }
      },
      {
        id: '2',
        email: 'pedro.silva@techcorp.com',
        status: 'accepted',
        invited_by: 'joao.silva',
        token: 'token-456',
        created_at: '2024-01-14T14:00:00Z',
        expires_at: '2024-01-21T14:00:00Z',
        invited_by_user: {
          name: 'João Silva',
          email: 'joao.silva@techcorp.com'
        }
      }
    ]

    setUsers(mockUsers)
    setInvitations(mockInvitations)
    setFilteredUsers(mockUsers)
    setFilteredInvitations(mockInvitations)
    setLoading(false)
  }, [])

  // Filter users based on search, role and status
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      superadmin: { variant: 'default', icon: Crown, label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
      admin_gestor: { variant: 'default', icon: Shield, label: 'Admin Gestor', color: 'bg-blue-100 text-blue-800' },
      gestor: { variant: 'default', icon: Shield, label: 'Gestor', color: 'bg-green-100 text-green-800' },
      funcionario: { variant: 'secondary', icon: User, label: 'Funcionário', color: 'bg-gray-100 text-gray-800' }
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.funcionario
    const Icon = config.icon

    return (
      <Badge className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <UserX className="w-3 h-3 mr-1" />
        Inativo
      </Badge>
    )
  }

  const getInvitationStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Calendar, label: 'Pendente' },
      accepted: { variant: 'default', icon: UserCheck, label: 'Aceito' },
      expired: { variant: 'destructive', icon: UserX, label: 'Expirado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSendInvitation = async () => {
    if (!inviteForm.email || !inviteForm.role) return

    const newInvitation: UserInvitation = {
      id: Date.now().toString(),
      email: inviteForm.email,
      status: 'pending',
      invited_by: 'current-user',
      token: `token-${Date.now()}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      invited_by_user: {
        name: 'Você',
        email: 'current@user.com'
      }
    }

    setInvitations(prev => [newInvitation, ...prev])
    setFilteredInvitations(prev => [newInvitation, ...prev])
    
    // Reset form
    setInviteForm({ email: '', role: 'funcionario', message: '' })
    setShowInviteDialog(false)
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setUserForm({
      name: '',
      surname: '',
      email: '',
      phone: '',
      tax_id: '',
      fiscal_regime: '',
      role: 'funcionario',
      status: 'active'
    })
    setShowUserDialog(true)
  }

  const handleEditUser = (user: CompanyUser) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone || '',
      tax_id: user.tax_id || '',
      fiscal_regime: user.fiscal_regime || '',
      role: user.role,
      status: user.status
    })
    setShowUserDialog(true)
  }

  const handleSaveUser = async () => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userForm, updated_at: new Date().toISOString() }
          : user
      ))
    } else {
      // Add new user
      const newUser: CompanyUser = {
        id: Date.now().toString(),
        ...userForm,
        created_at: new Date().toISOString(),
        company_role: userForm.role
      }
      setUsers(prev => [...prev, newUser])
    }

    setShowUserDialog(false)
    setEditingUser(null)
  }

  const handleResendInvitation = async (invitationId: string) => {
    // Mock resend logic
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
        : inv
    ))
  }

  const handleToggleUserStatus = async (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, role: newRole as any, company_role: newRole }
        : user
    ))
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários e Convites</h1>
          <p className="text-muted-foreground">
            Gerencie usuários da empresa e envie convites para novos membros
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowInviteDialog(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Convidar Usuário
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="w-4 h-4 mr-2" />
            Criar Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Membros da empresa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((users.filter(u => u.status === 'active').length / users.length) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'gestor' || u.role === 'admin_gestor').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com permissões elevadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Usuários ({users.length})</TabsTrigger>
          <TabsTrigger value="invitations">Convites ({invitations.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
          {/* Users Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros e Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, sobrenome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Roles</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                    <SelectItem value="admin_gestor">Admin Gestor</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{user.name} {user.surname}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(user.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations" className="space-y-6">
          {/* Invitations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Convites Enviados</CardTitle>
              <CardDescription>
                {invitations.length} convite(s) enviado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviado por</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getInvitationStatusBadge(invitation.status)}
                      </TableCell>
                      <TableCell>
                        {invitation.invited_by_user?.name || invitation.invited_by}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(invitation.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(invitation.expires_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {invitation.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvitation(invitation.id)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Reenviar
                            </Button>
                          )}
                          
                          {invitation.status === 'expired' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvitation(invitation.id)}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Renovar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite por email para um novo membro da empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="usuario@empresa.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select 
                value={inviteForm.role} 
                onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funcionario">Funcionário</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="admin_gestor">Admin Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Mensagem (opcional)</label>
              <Textarea
                placeholder="Mensagem personalizada para o convite..."
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowInviteDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendInvitation}
                disabled={!inviteForm.email}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Atualize as informações do usuário' : 'Crie um novo usuário na empresa'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sobrenome</label>
                <Input
                  value={userForm.surname}
                  onChange={(e) => setUserForm(prev => ({ ...prev, surname: e.target.value }))}
                  placeholder="Sobrenome"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@empresa.com"
                disabled={!!editingUser} // Não permitir editar email
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={userForm.phone}
                  onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="text-sm font-medium">CPF/CNPJ</label>
                <Input
                  value={userForm.tax_id}
                  onChange={(e) => setUserForm(prev => ({ ...prev, tax_id: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Regime Fiscal</label>
              <Input
                value={userForm.fiscal_regime}
                onChange={(e) => setUserForm(prev => ({ ...prev, fiscal_regime: e.target.value }))}
                placeholder="Simples Nacional"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select 
                  value={userForm.role} 
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="admin_gestor">Admin Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={userForm.status} 
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUserDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveUser}
                disabled={!userForm.name || !userForm.surname || !userForm.email}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingUser ? 'Atualizar' : 'Criar'} Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
