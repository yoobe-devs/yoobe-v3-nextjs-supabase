'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatCpfInput, validateCpf } from '@/lib/cpf-utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  ArrowLeft,
  Save,
  Tag,
  Users,
  Mail,
  Phone,
  Building,
  GraduationCap,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface AvailableTag {
  id: string
  key: string
  value: string
  description?: string
  color?: string
}

interface Employee {
  id: string
  email: string
  full_name: string
  phone?: string
  department?: string
  position?: string
  role: string
  tags: Array<{
    key: string
    value: string
    description?: string
    color?: string
  }>
}

export default function EditarFuncionarioPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    department: '',
    position: '',
    role: 'user',
    cpf: '',
  })
  const [availableTags, setAvailableTags] = useState<AvailableTag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()

  const employeeId = params.id as string

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        const userRole = user.user_metadata?.role
        if (!['gestor', 'manager', 'admin'].includes(userRole)) {
          setError('Você não tem permissão para editar funcionários')
          return
        }

        await Promise.all([fetchEmployee(), fetchAvailableTags()])
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err)
        setError('Erro ao verificar autenticação')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase, employeeId])

  const fetchEmployee = async () => {
    try {
      const response = await fetch('/api/gestor/employees')
      const data = await response.json()

      if (data.success) {
        const foundEmployee = data.data.find(
          (emp: any) => emp.id === employeeId
        )
        if (foundEmployee) {
          // Buscar tags do funcionário
          const tagsResponse = await fetch(
            `/api/me/tags?userId=${foundEmployee.id}`
          )
          const tagsData = await tagsResponse.json()

          const employeeWithTags = {
            ...foundEmployee,
            tags: tagsData.success ? tagsData.data.tags : [],
          }

          setEmployee(employeeWithTags)
          setFormData({
            email: foundEmployee.email || '',
            full_name: foundEmployee.full_name || '',
            phone: foundEmployee.phone || '',
            department: foundEmployee.department || '',
            position: foundEmployee.position || '',
            role: foundEmployee.role || 'user',
            cpf: foundEmployee.cpf || '',
          })
        } else {
          setError('Funcionário não encontrado')
        }
      } else {
        setError(data.error?.message || 'Erro ao carregar funcionário')
      }
    } catch (err) {
      console.error('Erro ao buscar funcionário:', err)
      setError('Erro ao carregar funcionário')
    }
  }

  const fetchAvailableTags = async () => {
    try {
      const { data: tags, error } = await supabase
        .from('employee_tags_system')
        .select('*')
        .eq('is_active', true)
        .order('key, value')

      if (error) {
        console.error('Erro ao buscar tags disponíveis:', error)
        return
      }

      setAvailableTags(tags || [])
    } catch (err) {
      console.error('Erro ao buscar tags disponíveis:', err)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    // Formatação automática para CPF
    if (field === 'cpf') {
      processedValue = formatCpfInput(value)
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))
    setError(null)
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    // CPF é opcional - não validar aqui, deixar para o backend

    try {
      // Atualizar dados do funcionário
      const response = await fetch(`/api/gestor/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar funcionário')
      }

      // Atualizar tags
      const tagsResponse = await fetch('/api/me/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: employeeId,
          tagIds: selectedTagIds,
        }),
      })

      const tagsData = await tagsResponse.json()

      if (!tagsResponse.ok) {
        console.warn(
          'Funcionário atualizado, mas erro ao atualizar tags:',
          tagsData.error
        )
      }

      setSuccess('Funcionário atualizado com sucesso!')

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/gestor/funcionarios')
      }, 2000)
    } catch (err) {
      console.error('Erro ao atualizar funcionário:', err)
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar funcionário'
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Atualizar selectedTagIds quando employee for carregado
  useEffect(() => {
    if (employee && availableTags.length > 0) {
      const currentTagIds = employee.tags
        .map(
          tag =>
            availableTags.find(t => t.key === tag.key && t.value === tag.value)
              ?.id || ''
        )
        .filter(Boolean)
      setSelectedTagIds(currentTagIds)
    }
  }, [employee, availableTags])

  const groupedTags = availableTags.reduce(
    (acc, tag) => {
      if (!acc[tag.key]) {
        acc[tag.key] = []
      }
      acc[tag.key].push(tag)
      return acc
    },
    {} as Record<string, AvailableTag[]>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/gestor/funcionarios')}
              className="w-full"
            >
              Voltar aos Funcionários
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Funcionário não encontrado</CardTitle>
            <CardDescription>
              O funcionário solicitado não foi encontrado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/gestor/funcionarios')}
              className="w-full"
            >
              Voltar aos Funcionários
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Editar Funcionário
                </h1>
                <p className="text-gray-600">
                  Atualize as informações e tags do funcionário
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {employee.full_name || employee.email}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados pessoais e profissionais do funcionário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={e =>
                      handleInputChange('full_name', e.target.value)
                    }
                    placeholder="Nome completo do funcionário"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="email@empresa.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={e => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                  />
                  <p className="text-sm text-gray-500">
                    CPF não é obrigatório no cadastro, mas será necessário no
                    resgate de produtos
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={e =>
                      handleInputChange('department', e.target.value)
                    }
                    placeholder="Departamento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={e =>
                      handleInputChange('position', e.target.value)
                    }
                    placeholder="Cargo do funcionário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={formData.role}
                    onValueChange={value => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Funcionário</SelectItem>
                      <SelectItem value="manager">Gestor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags de Elegibilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags de Elegibilidade
              </CardTitle>
              <CardDescription>
                Configure as tags que determinarão a elegibilidade do
                funcionário aos produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedTags).map(([key, tags]) => (
                <div key={key} className="space-y-3">
                  <h4 className="font-medium text-base capitalize flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {key}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tags.map(tag => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag.id}
                          checked={selectedTagIds.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <label
                          htmlFor={tag.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: tag.color || '#3B82F6',
                                color: tag.color || '#3B82F6',
                              }}
                            >
                              {tag.value}
                            </Badge>
                            {tag.description && (
                              <span className="text-gray-500 text-xs">
                                {tag.description}
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {availableTags.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhuma tag disponível. Entre em contato com o administrador
                    para configurar as tags da empresa.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Mensagens de Erro/Sucesso */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
