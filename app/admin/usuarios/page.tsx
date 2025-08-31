"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SafeImage } from "@/components/ui/safe-image"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Building2,
  Store,
  Star,
  Loader2
} from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserViewModal } from "@/components/ui/user-view-modal"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  full_name: string
  email: string
  role: 'admin' | 'user' | 'manager'
  status: 'active' | 'inactive' | 'suspended'
  points_balance: number
  department: string
  position: string
  company_id: string
  avatar_url: string
  created_at: string
  company?: {
    name: string
  }
  orders_count?: number
}

interface Company {
  id: string
  name: string
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [updatingUser, setUpdatingUser] = useState(false)
  const supabase = createClientComponentClient()

  const statuses = ["all", "active", "inactive", "suspended"]
  const roles = ["all", "admin", "user", "manager"]

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('users')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        toast.error('Erro ao carregar usuários')
        return
      }

      // Adicionar contagem de pedidos (mockado por enquanto)
      const usersWithOrders = data?.map(user => ({
        ...user,
        orders_count: Math.floor(Math.random() * 20) + 1 // Mock data
      })) || []

      setUsers(usersWithOrders)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Erro ao buscar empresas:', error)
        return
      }

      setCompanies(data || [])
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    }
  }

  const handleCreateUser = async (formData: FormData) => {
    try {
      setCreatingUser(true)
      
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const role = formData.get('role') as string
      const company_id = formData.get('company_id') as string
      const department = formData.get('department') as string
      const position = formData.get('position') as string
      const password = formData.get('password') as string

      // Validações
      if (!name || !email || !role) {
        toast.error('Nome, email e role são obrigatórios')
        return
      }

      if (role === 'manager' && !company_id) {
        toast.error('Empresa é obrigatória para gestores')
        return
      }

      // Criar usuário via API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          company_id: company_id || null,
          department: department || null,
          position: position || null,
          password: password || null
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao criar usuário')
        return
      }

      toast.success('Usuário criado com sucesso')
      setShowCreateModal(false)
      fetchUsers() // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast.error('Erro ao criar usuário')
    } finally {
      setCreatingUser(false)
    }
  }

  const handleUpdateUser = async (formData: FormData) => {
    if (!editingUser) return

    try {
      setUpdatingUser(true)
      
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const role = formData.get('role') as string
      const company_id = formData.get('company_id') as string
      const department = formData.get('department') as string
      const position = formData.get('position') as string
      const status = formData.get('status') as string
      const password = formData.get('password') as string

      // Validações
      if (!name || !email || !role) {
        toast.error('Nome, email e role são obrigatórios')
        return
      }

      if (role === 'manager' && !company_id) {
        toast.error('Empresa é obrigatória para gestores')
        return
      }

      // Atualizar usuário via API
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          company_id: company_id || null,
          department: department || null,
          position: position || null,
          status,
          password: password || null
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao atualizar usuário')
        return
      }

      toast.success('Usuário atualizado com sucesso')
      setEditingUser(null)
      fetchUsers() // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error('Erro ao atualizar usuário')
    } finally {
      setUpdatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Erro ao excluir usuário:', error)
        toast.error('Erro ao excluir usuário')
        return
      }

      toast.success('Usuário excluído com sucesso')
      fetchUsers() // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast.error('Erro ao excluir usuário')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspenso</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Administrador</Badge>
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800">Gerente</Badge>
      case 'user':
        return <Badge className="bg-gray-100 text-gray-800">Usuário</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando usuários...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === "all" ? "Todos os Status" : 
                 status === "active" ? "Ativo" :
                 status === "inactive" ? "Inativo" :
                 status === "suspended" ? "Suspenso" : status}
              </option>
            ))}
          </select>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === "all" ? "Todos os Roles" : 
                 role === "admin" ? "Administrador" :
                 role === "manager" ? "Gerente" :
                 role === "user" ? "Usuário" : role}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Pontos</th>
                  <th className="text-left py-3 px-4 font-medium">Pedidos</th>
                  <th className="text-left py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={user.avatar_url}
                          alt={user.name || user.full_name}
                          size={40}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{user.name || user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.department && user.position && (
                            <p className="text-xs text-gray-500">{user.position} • {user.department}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{user.company?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{user.points_balance || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Store className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{user.orders_count || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewingUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou termos de busca</p>
        </div>
      )}

      {/* Summary */}
      {filteredUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total de Usuários</p>
                <p className="font-semibold">{filteredUsers.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Usuários Ativos</p>
                <p className="font-semibold">{filteredUsers.filter(u => u.status === 'active').length}</p>
              </div>
              <div>
                <p className="text-gray-600">Administradores</p>
                <p className="font-semibold">{filteredUsers.filter(u => u.role === 'admin').length}</p>
              </div>
              <div>
                <p className="text-gray-600">Total de Pontos</p>
                <p className="font-semibold">{filteredUsers.reduce((sum, user) => sum + (user.points_balance || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {viewingUser && (
        <UserViewModal 
          user={viewingUser} 
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)} 
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleCreateUser(new FormData(e.currentTarget))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                  <Input name="name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <Input name="password" type="password" placeholder="Deixe em branco para gerar automaticamente" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role *</label>
                  <select name="role" className="w-full border border-gray-300 rounded-md px-3 py-2" required>
                    <option value="">Selecione um role</option>
                    <option value="user">Usuário</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Empresa</label>
                  <select name="company_id" className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Selecione uma empresa</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <Input name="department" placeholder="Ex: TI, RH, Vendas" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <Input name="position" placeholder="Ex: Desenvolvedor, Analista" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={creatingUser}>
                    {creatingUser ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      'Criar Usuário'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={creatingUser}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateUser(new FormData(e.currentTarget))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                  <Input name="name" defaultValue={editingUser.name} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <Input name="email" type="email" defaultValue={editingUser.email} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                  <Input name="password" type="password" placeholder="Deixe em branco para manter a atual" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role *</label>
                  <select name="role" defaultValue={editingUser.role} className="w-full border border-gray-300 rounded-md px-3 py-2" required>
                    <option value="user">Usuário</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Empresa</label>
                  <select name="company_id" defaultValue={editingUser.company_id} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Selecione uma empresa</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <Input name="department" defaultValue={editingUser.department} placeholder="Ex: TI, RH, Vendas" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <Input name="position" defaultValue={editingUser.position} placeholder="Ex: Desenvolvedor, Analista" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" defaultValue={editingUser.status} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={updatingUser}>
                    {updatingUser ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingUser(null)}
                    disabled={updatingUser}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
