"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SafeImage } from "@/components/ui/safe-image"
import { 
  Store, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  Package,
  ShoppingCart,
  Globe,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface Store {
  id: string
  name: string
  domain: string
  status: 'active' | 'inactive' | 'maintenance'
  logo_url?: string
  created_at: string
  companies: { id: string; name: string }
  users_count: number
  products_count: number
  orders_count: number
  revenue: number
}

export default function AdminLojasPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar lojas apenas uma vez
  useEffect(() => {
    const fetchStores = async () => {
      try {
        console.log('🔄 Iniciando carregamento de lojas...')
        setLoading(true)
        setError(null)

        const response = await fetch('/api/stores')
        console.log('📥 Response status:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        console.log('🏪 Número de lojas:', data.stores?.length || 0)

        setStores(data.stores || [])
        toast.success(`Carregadas ${data.stores?.length || 0} lojas`)
      } catch (err) {
        console.error('❌ Erro ao carregar lojas:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        toast.error('Erro ao carregar lojas')
      } finally {
        setLoading(false)
        console.log('✅ Carregamento concluído')
      }
    }

    fetchStores()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando lojas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Erro ao carregar lojas</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Lojas</h1>
          <p className="text-gray-600">Gerencie todas as lojas corporativas do sistema</p>
        </div>
        <Button onClick={() => router.push('/admin/lojas/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Loja
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lojas</CardTitle>
            <Store className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900" data-testid="stores-count">
              {stores.length}
            </div>
            <p className="text-sm text-gray-500">Lojas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <Store className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stores.filter(s => s.status === 'active').length}
            </div>
            <p className="text-sm text-gray-500">Em operação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stores.reduce((sum, store) => sum + store.users_count, 0)}
            </div>
            <p className="text-sm text-gray-500">Usuários ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {stores.reduce((sum, store) => sum + store.revenue, 0).toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Valor total</p>
          </CardContent>
        </Card>
      </div>

      {/* Stores List */}
      <Card>
        <CardHeader>
          <CardTitle>Lojas ({stores.length})</CardTitle>
          <CardDescription>Lista de todas as lojas corporativas</CardDescription>
        </CardHeader>
        <CardContent>
          {stores.length > 0 ? (
            <div className="space-y-4">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <SafeImage
                      src={store.logo_url}
                      alt={store.name}
                      size={48}
                      className="w-12 h-12"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{store.companies?.name || 'Empresa não definida'}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {store.domain}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {store.users_count} usuários
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {store.products_count} produtos
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {store.orders_count} pedidos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R$ {store.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Receita total</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/lojas/${store.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/lojas/editar/${store.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma loja encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando sua primeira loja
              </p>
              <Button onClick={() => router.push('/admin/lojas/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Loja
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
