'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  Edit,
  Eye,
  Plus,
  BarChart3,
  Activity,
  Calendar,
  Target,
} from 'lucide-react'
import Link from 'next/link'

export default function MinhaLojaPage() {
  const [storeStats, setStoreStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 'R$ 0,00',
    monthlyGrowth: '+0%',
    averageOrderValue: 'R$ 0,00',
    conversionRate: '0%',
    customerSatisfaction: '0/5.0',
  })

  const [storeConfig, setStoreConfig] = useState({
    name: '',
    theme: '',
    status: '',
    domain: '',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    language: 'Português',
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStoreData()
    fetchRecentOrders()
    fetchTopProducts()
  }, [])

  const fetchStoreData = async () => {
    try {
      setLoading(true)

      // Buscar dados do usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const companyId = user.user_metadata?.company_id
      const storeId = user.user_metadata?.store_id

      if (!companyId || !storeId) return

      // Buscar estatísticas da loja
      const { data: storeStatsData } = await supabase
        .from('store_stats')
        .select('*')
        .eq('store_id', storeId)
        .single()

      // Buscar produtos da loja
      const { data: productsData } = await supabase
        .from('client_products')
        .select('*')
        .eq('client_id', companyId)

      // Buscar pedidos
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('company_id', companyId)

      // Buscar clientes
      const { data: customersData } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)

      // Calcular estatísticas
      const totalProducts = productsData?.length || 0
      const totalOrders = ordersData?.length || 0
      const totalCustomers = customersData?.length || 0

      const totalRevenue =
        ordersData?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calcular crescimento mensal real
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const currentMonthOrders =
        ordersData?.filter(order => {
          const orderDate = new Date(order.created_at)
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          )
        }) || []

      const lastMonthOrders =
        ordersData?.filter(order => {
          const orderDate = new Date(order.created_at)
          return (
            orderDate.getMonth() === lastMonth &&
            orderDate.getFullYear() === lastMonthYear
          )
        }) || []

      const currentMonthRevenue = currentMonthOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      )
      const lastMonthRevenue = lastMonthOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      )

      const monthlyGrowth =
        lastMonthRevenue > 0
          ? (
              ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
              100
            ).toFixed(1)
          : currentMonthRevenue > 0
            ? '100.0'
            : '0.0'

      // Calcular taxa de conversão real (visitas vs pedidos)
      const totalVisits = await supabase
        .from('store_analytics')
        .select('visits')
        .eq('store_id', storeId)
        .single()

      const conversionRate =
        totalVisits.data?.visits > 0
          ? ((totalOrders / totalVisits.data.visits) * 100).toFixed(1)
          : '0.0'

      // Buscar satisfação real dos clientes
      const satisfactionData = await supabase
        .from('customer_reviews')
        .select('rating')
        .eq('store_id', storeId)

      const avgSatisfaction =
        satisfactionData.data?.length > 0
          ? (
              satisfactionData.data.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / satisfactionData.data.length
            ).toFixed(1)
          : '0.0'

      setStoreStats({
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        monthlyGrowth: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth}%`,
        averageOrderValue: `R$ ${averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        conversionRate: `${conversionRate}%`,
        customerSatisfaction: `${avgSatisfaction}/5.0`,
      })

      // Buscar configuração real da loja
      const { data: storeConfigData } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      // Buscar dados da empresa
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (storeConfigData) {
        setStoreConfig({
          name: storeConfigData.name || companyData?.name || 'Minha Loja',
          theme: storeConfigData.theme || 'Padrão',
          status: storeConfigData.status || 'Ativa',
          domain:
            storeConfigData.domain ||
            `${companyData?.slug || 'loja'}.yoobe.com`,
          currency: storeConfigData.currency || 'BRL',
          timezone: storeConfigData.timezone || 'America/Sao_Paulo',
          language: storeConfigData.language || 'Português',
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados da loja:', error)
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])

  const fetchRecentOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const companyId = user.user_metadata?.company_id
      if (!companyId) return

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3)

      if (orders) {
        setRecentOrders(
          orders.map(order => ({
            id: order.id,
            customer: order.customer_name || 'Cliente',
            product: order.items?.[0]?.name || 'Produto',
            amount: `R$ ${(order.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            status: order.status || 'Processando',
            date: new Date(order.created_at).toLocaleDateString('pt-BR'),
          }))
        )
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error)
    }
  }

  const fetchTopProducts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const companyId = user.user_metadata?.company_id
      if (!companyId) return

      const { data: products } = await supabase
        .from('client_products')
        .select('*')
        .eq('client_id', companyId)
        .eq('status', 'active')
        .limit(3)

      if (products) {
        // Buscar vendas reais de cada produto
        const productsWithSales = await Promise.all(
          products.map(async product => {
            // Buscar pedidos que contêm este produto
            const { data: productOrders } = await supabase
              .from('order_items')
              .select(
                'quantity, order_id, orders!inner(total_amount, created_at)'
              )
              .eq('product_id', product.id)

            const totalSales =
              productOrders?.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              ) || 0
            const totalRevenue =
              productOrders?.reduce((sum, item) => {
                const orderAmount = item.orders?.total_amount || 0
                const itemQuantity = item.quantity || 0
                return sum + orderAmount * itemQuantity
              }, 0) || 0

            // Calcular crescimento mensal do produto
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
            const lastMonthYear =
              currentMonth === 0 ? currentYear - 1 : currentYear

            const currentMonthSales =
              productOrders
                ?.filter(item => {
                  const orderDate = new Date(item.orders?.created_at)
                  return (
                    orderDate.getMonth() === currentMonth &&
                    orderDate.getFullYear() === currentYear
                  )
                })
                .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

            const lastMonthSales =
              productOrders
                ?.filter(item => {
                  const orderDate = new Date(item.orders?.created_at)
                  return (
                    orderDate.getMonth() === lastMonth &&
                    orderDate.getFullYear() === lastMonthYear
                  )
                })
                .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

            const growth =
              lastMonthSales > 0
                ? (
                    ((currentMonthSales - lastMonthSales) / lastMonthSales) *
                    100
                  ).toFixed(1)
                : currentMonthSales > 0
                  ? '100.0'
                  : '0.0'

            return {
              name: product.title || 'Produto',
              sales: totalSales,
              revenue: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              growth: `${growth >= 0 ? '+' : ''}${growth}%`,
            }
          })
        )

        // Ordenar por vendas e pegar os top 3
        const sortedProducts = productsWithSales
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 3)

        setTopProducts(sortedProducts)
      }
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue':
        return 'bg-green-100 text-green-800'
      case 'Em Trânsito':
        return 'bg-blue-100 text-blue-800'
      case 'Processando':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados da loja...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Minha Loja</h1>
          <p className="text-gray-600">
            Gerencie sua loja corporativa e acompanhe o desempenho
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true)
              fetchStoreData()
              fetchRecentOrders()
              fetchTopProducts()
            }}
            disabled={loading}
          >
            <Settings className="h-4 w-4 mr-2" />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Link href="/gestor/configuracoes">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Configurar Loja
            </Button>
          </Link>
          <Link href="/gestor/produtos">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Store Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-6 w-6 mr-3 text-blue-600" />
            {storeConfig.name}
          </CardTitle>
          <CardDescription>
            Sua loja corporativa está funcionando perfeitamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tema</p>
              <p className="font-semibold">{storeConfig.theme}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {storeConfig.status}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Domínio</p>
              <p className="font-semibold text-sm">{storeConfig.domain}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Moeda</p>
              <p className="font-semibold">{storeConfig.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Produtos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pedidos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Pedidos processados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storeStats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">Clientes únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{storeStats.monthlyGrowth}</span>{' '}
              este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storeStats.averageOrderValue}
            </div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storeStats.conversionRate}
            </div>
            <p className="text-xs text-muted-foreground">
              Visitantes → Clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storeStats.customerSatisfaction}
            </div>
            <p className="text-xs text-muted-foreground">
              Avaliação dos clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {storeStats.monthlyGrowth}
            </div>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Pedidos Recentes
            </CardTitle>
            <CardDescription>Últimos pedidos da sua loja</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.product}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.amount}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <Link href="/gestor/pedidos" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos os Pedidos
                </Button>
              </Link>
              <Link href="/gestor/pedidos?action=new" className="flex-1">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Produtos Mais Vendidos
            </CardTitle>
            <CardDescription>Top produtos por vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.sales} vendas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.revenue}</p>
                    <p className="text-sm text-green-600">{product.growth}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <Link href="/gestor/produtos" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos os Produtos
                </Button>
              </Link>
              <Link href="/gestor/produtos?action=new" className="flex-1">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
