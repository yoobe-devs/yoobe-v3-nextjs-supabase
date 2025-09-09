"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  ShoppingCart, 
  Gift, 
  Star,
  TrendingUp,
  Heart,
  Clock,
  CheckCircle
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { PointsBalance } from "@/components/ui/points-balance"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getOrders } from '@/lib/queries/orders'

interface StoreStats {
  totalProducts: number
  totalOrders: number
  pointsBalance: number
  favoriteProducts: number
}

interface RecentOrder {
  id: string
  productName: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  date: string
  points: number
}

const mockStats: StoreStats = {
  totalProducts: 156,
  totalOrders: 23,
  pointsBalance: 1250,
  favoriteProducts: 8
}

async function loadRecent(): Promise<RecentOrder[]> {
  try {
    const list = await getOrders()
    return (list || []).slice(0, 5).map((o: any) => ({
      id: o.id,
      productName: o.order_items?.[0]?.products?.name || 'Pedido',
      status: o.status || 'pending',
      date: o.created_at,
      points: 0,
    }))
  } catch {
    return []
  }
}

export default function StoreDashboardPage() {
  const supabase = createClientComponentClient()
  const [stats, setStats] = useState<StoreStats>(mockStats)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    (async () => {
      const data = await loadRecent()
      setRecentOrders(data)
      if (data.length) setStats(s => ({ ...s, totalOrders: data.length }))
    })()
  }, [])

  useEffect(() => {
    // Carregar métricas reais: totalProducts e pointsBalance
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const storeId = user?.user_metadata?.store_id || user?.user_metadata?.company_id
        // totalProducts
        let totalProducts = 0
        if (storeId) {
          const { count } = await supabase
            .from('store_products')
            .select('id', { count: 'exact', head: true })
            .eq('store_id', storeId)
          totalProducts = count || 0
        }
        // pointsBalance do perfil (tabela users)
        let pointsBalance = 0
        if (user?.email) {
          const { data: profile } = await supabase
            .from('users')
            .select('points_balance')
            .eq('email', user.email)
            .maybeSingle()
          pointsBalance = Number(profile?.points_balance || 0)
        }
        // favoritos (se houver tabela user_favorites)
        let favoriteProducts = 0
        try {
          if (user?.id) {
            const { count: favCount } = await supabase
              .from('user_favorites')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
            favoriteProducts = favCount || 0
          }
        } catch {
          favoriteProducts = 0
        }
        setStats(s => ({
          ...s,
          totalProducts,
          pointsBalance,
          favoriteProducts,
        }))
      } catch (e) {
        // mantém mock em caso de erro
      }
    })()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'shipped':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Entregue</Badge>
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minha Loja</h1>
            <p className="text-gray-600">Bem-vindo à sua loja corporativa de resgate</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Heart className="h-4 w-4 mr-2" />
            Favoritos
          </Button>
          <Button>
            <Gift className="h-4 w-4 mr-2" />
            Resgatar Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Produtos Disponíveis</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Meus Pedidos</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <PointsBalance 
          companyId="550e8400-e29b-41d4-a716-446655440001"
          className="h-full"
        />

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold">{stats.favoriteProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Ver Catálogo Completo
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Meus Pedidos
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              Produtos Favoritos
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.location.href = '/store/points'}
            >
              <Star className="h-4 w-4 mr-2" />
              Histórico de Pontos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pedidos Recentes
            </CardTitle>
            <CardDescription>
              Acompanhe seus últimos resgates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-medium">{order.productName}</p>
                    <p className="text-sm text-gray-600">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{order.points} pts</span>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
