"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Phone,
  Building,
  Star,
  Calendar
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  type Employee 
} from "@/lib/queries/gestor"

export default function GestorFuncionariosPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const { user, signOut } = useAuth()

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    points_balance: 0
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = async () => {
    try {
      const newEmployee = await createEmployee({
        ...formData,
        status: 'active',
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&size=128`,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      
      if (newEmployee) {
        setEmployees(prev => [newEmployee, ...prev])
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating employee:', error)
    }
  }

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return
    
    try {
      const updatedEmployee = await updateEmployee(editingEmployee.id, formData)
      
      if (updatedEmployee) {
        setEmployees(prev => 
          prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
        )
        setEditingEmployee(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await deleteEmployee(id)
        setEmployees(prev => prev.filter(emp => emp.id !== id))
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      points_balance: 0
    })
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      points_balance: employee.points_balance
    })
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
            <p className="text-gray-600">Gerencie os funcionários da sua empresa</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
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
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar
                    src={employee.avatar_url}
                    alt={employee.name}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {employee.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    {employee.department}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    {employee.points_balance} pontos
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(employee)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingEmployee) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
              </CardTitle>
              <CardDescription>
                {editingEmployee ? 'Atualize as informações do funcionário' : 'Adicione um novo funcionário à empresa'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Cargo</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="Desenvolvedor, Analista, etc."
                />
              </div>
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="TI, RH, Marketing, etc."
                />
              </div>
              <div>
                <Label htmlFor="points">Pontos Iniciais</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points_balance}
                  onChange={(e) => setFormData({...formData, points_balance: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
                >
                  {editingEmployee ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingEmployee(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
