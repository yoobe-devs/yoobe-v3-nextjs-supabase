'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download
} from 'lucide-react'

interface ReportData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
  customersChange: number
  productsChange: number
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    customer: string
    amount: number
    date: string
  }>
}

export default function RelatoriosPage() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    productsChange: 0,
    topProducts: [],
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    loadReportData()
  }, [period])

  const loadReportData = async () => {
    try {
      // Simular dados de relatório
      setReportData({
        totalRevenue: 12500,
        totalOrders: 89,
        totalCustomers: 156,
        totalProducts: 45,
        revenueChange: 12.5,
        ordersChange: 8.3,
        customersChange: 15.2,
        productsChange: -2.1,
        topProducts: [
          { name: 'Camiseta Join Tecnologia', sales: 25, revenue: 1247.50 },
          { name: 'Mochila Corporativa Join', sales: 18, revenue: 2338.20 },
          { name: 'Caneca Personalizada Join', sales: 32, revenue: 956.80 },
          { name: 'Boné Join', sales: 15, revenue: 598.50 },
          { name: 'Garrafa Térmica Join', sales: 12, revenue: 718.80 }
        ],
        recentOrders: [
          { id: 'ORD-1234', customer: 'João Silva', amount: 150.00, date: '2024-01-15' },
          { id: 'ORD-1235', customer: 'Maria Santos', amount: 89.90, date: '2024-01-14' },
          { id: 'ORD-1236', customer: 'Pedro Costa', amount: 234.50, date: '2024-01-13' },
          { id: 'ORD-1237', customer: 'Ana Oliveira', amount: 67.80, date: '2024-01-12' },
          { id: 'ORD-1238', customer: 'Carlos Lima', amount: 189.90, date: '2024-01-11' }
        ]
      })
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    // Simular exportação
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-${period}dias.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
              <p className="text-gray-600 mt-2">
                Acompanhe o desempenho da sua loja
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportReport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {reportData.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.revenueChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(reportData.revenueChange)}% em relação ao período anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalOrders}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.ordersChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(reportData.ordersChange)}% em relação ao período anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalCustomers}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.customersChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(reportData.customersChange)}% em relação ao período anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalProducts}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.productsChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(reportData.productsChange)}% em relação ao período anterior
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Produtos Mais Vendidos
              </CardTitle>
              <CardDescription>
                Top 5 produtos por volume de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R$ {product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pedidos Recentes
              </CardTitle>
              <CardDescription>
                Últimos 5 pedidos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {order.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Adicionais</CardTitle>
              <CardDescription>
                Outros indicadores importantes para sua loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">R$ {(reportData.totalRevenue / reportData.totalOrders).toFixed(2)}</div>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{Math.round(reportData.totalOrders / reportData.totalCustomers * 100)}%</div>
                  <p className="text-sm text-gray-600">Taxa de Conversão</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{Math.round(reportData.totalRevenue / reportData.totalProducts)}</div>
                  <p className="text-sm text-gray-600">Receita por Produto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
