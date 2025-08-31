'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Mail,
  Phone,
  Building,
  UserPlus,
  Send,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  email: string
  full_name: string
  name: string
  avatar_url: string
  role: string
  department: string
  position: string
  points_balance: number
  status: string
  created_at: string
}

export default function FuncionariosPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [updatingEmployee, setUpdatingEmployee] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    full_name: '',
    department: '',
    position: '',
    role: 'user'
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/gestor/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
      toast.error('Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteEmployee = async () => {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'employee_invite',
          to: inviteData.email,
          data: {
            employee_name: inviteData.full_name,
            department: inviteData.department,
            position: inviteData.position,
            invite_url: `http://localhost:3002/auth/register?invite=${inviteData.email}`
          }
        })
      })

      if (response.ok) {
        toast.success('Convite enviado com sucesso!')
        setShowInviteDialog(false)
        setInviteData({
          email: '',
          full_name: '',
          department: '',
          position: '',
          role: 'user'
        })
      } else {
        throw new Error('Erro ao enviar convite')
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error)
      toast.error('Erro ao enviar convite')
    }
  }

  const handleUpdateEmployee = async (formData: FormData) => {
    if (!editingEmployee) return

    try {
      setUpdatingEmployee(true)
      
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const department = formData.get('department') as string
      const position = formData.get('position') as string
      const status = formData.get('status') as string

      // Validações
      if (!name || !email) {
        toast.error('Nome e email são obrigatórios')
        return
      }

      // Atualizar funcionário via API
      const response = await fetch(`/api/gestor/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          department,
          position,
          status
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao atualizar funcionário')
        return
      }

      toast.success('Funcionário atualizado com sucesso')
      setEditingEmployee(null)
      loadEmployees() // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error)
      toast.error('Erro ao atualizar funcionário')
    } finally {
      setUpdatingEmployee(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) {
      return
    }

    try {
      const response = await fetch(`/api/gestor/employees/${employeeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Funcionário excluído com sucesso')
        loadEmployees() // Recarregar lista
      } else {
        const result = await response.json()
        toast.error(result.error || 'Erro ao excluir funcionário')
      }
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error)
      toast.error('Erro ao excluir funcionário')
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || !selectedDepartment || employee.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const departments = Array.from(new Set(employees.map(emp => emp.department)))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando funcionários...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
              <p className="text-gray-600 mt-2">
                Gerencie os funcionários da sua empresa
              </p>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Convidar Funcionário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Convidar Novo Funcionário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                      placeholder="funcionario@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      value={inviteData.full_name}
                      onChange={(e) => setInviteData({ ...inviteData, full_name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={inviteData.department}
                      onChange={(e) => setInviteData({ ...inviteData, department: e.target.value })}
                      placeholder="Departamento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={inviteData.position}
                      onChange={(e) => setInviteData({ ...inviteData, position: e.target.value })}
                      placeholder="Cargo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Select
                      value={inviteData.role}
                      onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Funcionário</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInviteEmployee} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Convite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">
                {employees.filter(emp => emp.status === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">
                Diferentes departamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(emp => emp.role === 'manager').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Com permissões de gestão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.reduce((sum, emp) => sum + emp.points_balance, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Pontos distribuídos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Employees List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
            <CardDescription>
              {filteredEmployees.length} funcionário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {employee.avatar_url ? (
                        <img
                          src={employee.avatar_url}
                          alt={employee.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{employee.full_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </span>
                        {employee.department && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {employee.department}
                          </span>
                        )}
                        {employee.position && (
                          <span>{employee.position}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{employee.points_balance} pontos</div>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedDepartment 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece convidando seu primeiro funcionário'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Funcionário</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateEmployee(new FormData(e.currentTarget))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                  <Input name="name" defaultValue={editingEmployee.full_name} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <Input name="email" type="email" defaultValue={editingEmployee.email} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <Input name="department" defaultValue={editingEmployee.department} placeholder="Ex: TI, RH, Vendas" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <Input name="position" defaultValue={editingEmployee.position} placeholder="Ex: Desenvolvedor, Analista" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" defaultValue={editingEmployee.status} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingEmployee(null)}
                    className="flex-1"
                    disabled={updatingEmployee}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1"
                    disabled={updatingEmployee}
                  >
                    {updatingEmployee ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
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
