"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Loader2
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  type: 'employee_invite' | 'manager_invite' | 'order_notification' | 'order_approved'
  subject: string
  content: string
  variables: string[]
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const supabase = createClientComponentClient()

  const types = ["all", "employee_invite", "manager_invite", "order_notification", "order_approved"]
  const statuses = ["all", "active", "inactive"]

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/templates')
      if (!response.ok) {
        throw new Error('Erro ao buscar templates')
      }
      const result = await response.json()
      const data = result.templates

      if (!data) {
        console.error('Erro ao buscar templates')
        toast.error('Erro ao carregar templates')
        return
      }

      setTemplates(data || [])
    } catch (error) {
      console.error('Erro ao buscar templates:', error)
      toast.error('Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) {
      return
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao excluir template')
        return
      }

      toast.success('Template excluído com sucesso')
      fetchTemplates() // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir template:', error)
      toast.error('Erro ao excluir template')
    }
  }

  const handleCreateTemplate = async (formData: FormData) => {
    try {
      const name = formData.get('name') as string
      const type = formData.get('type') as string
      const subject = formData.get('subject') as string
      const content = formData.get('content') as string
      const variables = (formData.get('variables') as string).split(',').map(v => v.trim()).filter(v => v)

      if (!name || !type || !subject || !content) {
        toast.error('Todos os campos são obrigatórios')
        return
      }

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
          subject,
          content,
          variables,
          status: 'active'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao criar template')
        return
      }

      const result = await response.json()
      const data = result.template

      toast.success('Template criado com sucesso')
      setShowCreateModal(false)
      fetchTemplates()
    } catch (error) {
      console.error('Erro ao criar template:', error)
      toast.error('Erro ao criar template')
    }
  }

  const handleUpdateTemplate = async (formData: FormData) => {
    if (!editingTemplate) return

    try {
      const name = formData.get('name') as string
      const type = formData.get('type') as string
      const subject = formData.get('subject') as string
      const content = formData.get('content') as string
      const status = formData.get('status') as string
      const variables = (formData.get('variables') as string).split(',').map(v => v.trim()).filter(v => v)

      if (!name || !type || !subject || !content) {
        toast.error('Todos os campos são obrigatórios')
        return
      }

      const response = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
          subject,
          content,
          variables,
          status
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao atualizar template')
        return
      }

      const result = await response.json()
      const data = result.template

      toast.success('Template atualizado com sucesso')
      setEditingTemplate(null)
      fetchTemplates()
    } catch (error) {
      console.error('Erro ao atualizar template:', error)
      toast.error('Erro ao atualizar template')
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || template.type === selectedType
    const matchesStatus = selectedStatus === "all" || template.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'employee_invite':
        return <Badge className="bg-blue-100 text-blue-800">Convite Funcionário</Badge>
      case 'manager_invite':
        return <Badge className="bg-purple-100 text-purple-800">Convite Gestor</Badge>
      case 'order_notification':
        return <Badge className="bg-green-100 text-green-800">Notificação Pedido</Badge>
      case 'order_approved':
        return <Badge className="bg-orange-100 text-orange-800">Pedido Aprovado</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando templates...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Templates de Comunicação</h1>
          <p className="text-gray-600">Gerencie os templates de email do sistema</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === "all" ? "Todos os Tipos" : 
                 type === "employee_invite" ? "Convite Funcionário" :
                 type === "manager_invite" ? "Convite Gestor" :
                 type === "order_notification" ? "Notificação Pedido" :
                 type === "order_approved" ? "Pedido Aprovado" : type}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === "all" ? "Todos os Status" : 
                 status === "active" ? "Ativo" :
                 status === "inactive" ? "Inativo" : status}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
          <CardDescription>Lista de todos os templates de comunicação</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length > 0 ? (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {getTypeBadge(template.type)}
                        {getStatusBadge(template.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{template.subject}</p>
                      <p className="text-xs text-gray-400">
                        Variáveis: {template.variables?.join(', ') || 'Nenhuma'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Atualizado em: {new Date(template.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum template encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando seu primeiro template de comunicação
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Novo Template</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleCreateTemplate(new FormData(e.currentTarget))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Template *</label>
                  <Input name="name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                  <select name="type" className="w-full border border-gray-300 rounded-md px-3 py-2" required>
                    <option value="">Selecione um tipo</option>
                    <option value="employee_invite">Convite Funcionário</option>
                    <option value="manager_invite">Convite Gestor</option>
                    <option value="order_notification">Notificação Pedido</option>
                    <option value="order_approved">Pedido Aprovado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assunto *</label>
                  <Input name="subject" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variáveis (separadas por vírgula)</label>
                  <Input name="variables" placeholder="Ex: nome, empresa, pontos" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conteúdo *</label>
                  <textarea 
                    name="content" 
                    rows={10}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Digite o conteúdo do template. Use {{variavel}} para inserir variáveis."
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Criar Template</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
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
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Template</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateTemplate(new FormData(e.currentTarget))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Template *</label>
                  <Input name="name" defaultValue={editingTemplate.name} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                  <select name="type" defaultValue={editingTemplate.type} className="w-full border border-gray-300 rounded-md px-3 py-2" required>
                    <option value="employee_invite">Convite Funcionário</option>
                    <option value="manager_invite">Convite Gestor</option>
                    <option value="order_notification">Notificação Pedido</option>
                    <option value="order_approved">Pedido Aprovado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assunto *</label>
                  <Input name="subject" defaultValue={editingTemplate.subject} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" defaultValue={editingTemplate.status} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variáveis (separadas por vírgula)</label>
                  <Input name="variables" defaultValue={editingTemplate.variables?.join(', ')} placeholder="Ex: nome, empresa, pontos" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conteúdo *</label>
                  <textarea 
                    name="content" 
                    rows={10}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Digite o conteúdo do template. Use {{variavel}} para inserir variáveis."
                    defaultValue={editingTemplate.content}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Salvar Alterações</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingTemplate(null)}
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
