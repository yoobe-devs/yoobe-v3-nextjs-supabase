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
  Store,
  Building,
  Globe,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Loader2,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  domain: string
  status: string
  logo_url?: string
  created_at: string
  companies: { 
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  users_count: number
  products_count: number
  orders_count: number
  revenue: number
}

export default function StoreViewPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    loadStore()
  }, [id])

  const loadStore = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stores/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setStore(data.store)
      } else {
        throw new Error('Loja não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar loja:', error)
      toast.error('Erro ao carregar loja')
      router.push('/admin/lojas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return

    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Loja excluída com sucesso!')
        router.push('/admin/lojas')
      } else {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao excluir loja')
      }
    } catch (error) {
      console.error('Erro ao excluir loja:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir loja')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>
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
              <p>Carregando loja...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loja não encontrada
            </h3>
            <Button onClick={() => router.push('/admin/lojas')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Lojas
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
            onClick={() => router.push('/admin/lojas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às Lojas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo da Loja */}
          <Card>
            <CardHeader>
              <CardTitle>Logo da Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <SafeImage
                src={store.logo_url}
                alt={store.name}
                size={400}
                className="aspect-square w-full"
              />
            </CardContent>
          </Card>

          {/* Informações da Loja */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{store.name}</CardTitle>
                    <CardDescription>
                      {store.companies?.name || 'Empresa não definida'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(store.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Domínio</p>
                      <p className="font-semibold text-blue-600">{store.domain}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Empresa</p>
                      <p className="font-semibold text-purple-600">{store.companies?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Usuários</p>
                      <p className="font-semibold text-green-600">{store.users_count} ativos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Produtos</p>
                      <p className="font-semibold text-orange-600">{store.products_count} cadastrados</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pedidos</p>
                      <p className="font-semibold text-teal-600">{store.orders_count} realizados</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-600">Receita</p>
                      <p className="font-semibold text-emerald-600">
                        R$ {store.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Criada em {new Date(store.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{store.companies?.name || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{store.companies?.email || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{store.companies?.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Endereço</p>
                  <p className="font-medium">{store.companies?.address || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`/admin/lojas/editar/${store.id}`)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Loja
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
