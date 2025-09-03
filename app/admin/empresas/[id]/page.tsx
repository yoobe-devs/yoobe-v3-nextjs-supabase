"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Store,
  Package,
  Calendar,
  Loader2,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  website: string
  description: string
  logo_url?: string
  status: string
  points_rate: number
  allow_points_only: boolean
  allow_mixed_payment: boolean
  created_at: string
  updated_at: string
}

export default function CompanyViewPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCompany(data.company)
      } else {
        throw new Error('Empresa não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
      toast.error('Erro ao carregar empresa')
      router.push('/admin/empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Empresa excluída com sucesso!')
        router.push('/admin/empresas')
      } else {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao excluir empresa')
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir empresa')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando empresa...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Empresa não encontrada
            </h3>
            <Button onClick={() => router.push('/admin/empresas')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Empresas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/empresas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às Empresas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Logo da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <SafeImage
                src={company.logo_url}
                alt={company.name}
                size={400}
                className="aspect-square w-full"
              />
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{company.name}</CardTitle>
                    <CardDescription>
                      Empresa cliente do sistema
                    </CardDescription>
                  </div>
                  {getStatusBadge(company.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-blue-600">{company.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-semibold text-green-600">{company.phone || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <p className="font-semibold text-purple-600">{company.website || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Localização</p>
                      <p className="font-semibold text-orange-600">
                        {company.city && company.state ? `${company.city}, ${company.state}` : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taxa de Pontos</span>
                  <span className="font-medium">{company.points_rate || 0.1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Apenas Pontos</span>
                  <Badge variant={company.allow_points_only ? "default" : "secondary"}>
                    {company.allow_points_only ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pagamento Misto</span>
                  <Badge variant={company.allow_mixed_payment ? "default" : "secondary"}>
                    {company.allow_mixed_payment ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            {company.address && (
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{company.address}</p>
                    {company.city && <p className="text-sm text-gray-600">{company.city}</p>}
                    {company.state && <p className="text-sm text-gray-600">{company.state}</p>}
                    {company.zip_code && <p className="text-sm text-gray-600">CEP: {company.zip_code}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Descrição */}
            {company.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{company.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`/admin/empresas/editar/${company.id}`)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Empresa
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
