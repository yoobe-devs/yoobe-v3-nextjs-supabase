"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Building2,
  Mail,
  Phone
} from "lucide-react"
import { SafeImage } from "@/components/ui/safe-image"
import { toast } from "sonner"

interface Gestor {
  id: string
  name: string
  email: string
  phone: string
  company_id: string
  company_name: string
  company_logo: string
  status: 'active' | 'inactive'
  created_at: string
  last_login: string
}

export default function AdminGestoresPage() {
  const [gestores, setGestores] = useState<Gestor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadGestores()
  }, [])

  const loadGestores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/gestores')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar gestores')
      }

      const data = await response.json()
      setGestores(data.gestores || [])
    } catch (error) {
      console.error('Erro ao carregar gestores:', error)
      toast.error('Erro ao carregar gestores')
    } finally {
      setLoading(false)
    }
  }

  const filteredGestores = gestores.filter(gestor => {
    const matchesSearch = gestor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gestor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gestor.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || gestor.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDeleteGestor = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este gestor?')) return

    try {
      const response = await fetch(`/api/admin/gestores/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Gestor excluído com sucesso!')
        loadGestores()
      } else {
        throw new Error('Erro ao excluir gestor')
      }
    } catch (error) {
      console.error('Erro ao excluir gestor:', error)
      toast.error('Erro ao excluir gestor')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestores</h1>
            <p className="text-gray-600">Gerencie os gestores das empresas</p>
          </div>
        </div>
        <Button onClick={() => router.push('/admin/gestores/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Gestor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Gestores</p>
                <p className="text-2xl font-bold">{gestores.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gestores Ativos</p>
                <p className="text-2xl font-bold">
                  {gestores.filter(g => g.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Empresas com Gestores</p>
                <p className="text-2xl font-bold">
                  {new Set(gestores.map(g => g.company_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Gestores List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gestores</CardTitle>
          <CardDescription>
            {filteredGestores.length} gestor(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando gestores...</span>
            </div>
          ) : filteredGestores.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum gestor encontrado</p>
              <p className="text-sm text-gray-400">
                {searchTerm || filterStatus ? 'Tente ajustar os filtros' : 'Comece adicionando gestores'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGestores.map((gestor) => (
                <div
                  key={gestor.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <SafeImage
                      src={gestor.company_logo}
                      alt={gestor.company_name}
                      size={48}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{gestor.name}</h3>
                      <p className="text-sm text-gray-600">{gestor.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{gestor.company_name}</span>
                        {gestor.phone && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{gestor.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(gestor.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/gestores/${gestor.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/gestores/editar/${gestor.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGestor(gestor.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
