"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportData {
  sales: {
    labels: string[]
    data: number[]
  }
  products: {
    labels: string[]
    data: number[]
  }
  users: {
    labels: string[]
    data: number[]
  }
  revenue: {
    total: number
    growth: number
    monthly: number[]
  }
}

export default function RelatoriosPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [reportData, setReportData] = useState<ReportData>({
    sales: { labels: [], data: [] },
    products: { labels: [], data: [] },
    users: { labels: [], data: [] },
    revenue: { total: 0, growth: 0, monthly: [] }
  })

  useEffect(() => {
    loadReportData()
  }, [period])

  const loadReportData = async () => {
    setLoading(true)
    try {
      // Simular dados de relatório (em produção viria das APIs)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockData: ReportData = {
        sales: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          data: [65, 59, 80, 81, 56, 55]
        },
        products: {
          labels: ['Vestuário', 'Acessórios', 'Tecnologia', 'Escritório'],
          data: [300, 250, 180, 120]
        },
        users: {
          labels: ['Ativos', 'Inativos', 'Novos', 'Premium'],
          data: [450, 120, 80, 50]
        },
        revenue: {
          total: 125000,
          growth: 12.5,
          monthly: [10000, 12000, 15000, 18000, 20000, 22000]
        }
      }

      setReportData(mockData)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      toast.error('Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      toast.info(`Exportando relatório em ${format.toUpperCase()}...`)
      
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Relatório exportado com sucesso!`)
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      toast.error('Erro ao exportar relatório')
    }
  }

  const SimpleBarChart = ({ data, labels, title, color = "blue" }: any) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {labels.map((label: string, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600">{label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className={`bg-${color}-500 h-4 rounded-full transition-all duration-500`}
                style={{ 
                  width: `${(data[index] / Math.max(...data)) * 100}%`,
                  backgroundColor: color === 'blue' ? '#3b82f6' : 
                                 color === 'green' ? '#10b981' : 
                                 color === 'purple' ? '#8b5cf6' : '#f59e0b'
                }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-right">{data[index]}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const LineChart = ({ data, labels, title }: any) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-48 flex items-end justify-between gap-2">
        {data.map((value: number, index: number) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t transition-all duration-500"
              style={{ 
                height: `${(value / Math.max(...data)) * 100}%`,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-gray-500 mt-1">{labels[index]}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando relatórios...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-2">Análises e insights da plataforma</p>
          </div>
          <div className="flex gap-2">
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
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                R$ {reportData.revenue.total.toLocaleString('pt-BR')}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+{reportData.revenue.growth}%</span>
                <span className="text-sm text-gray-500">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {reportData.sales.data.reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Total de pedidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {reportData.users.data[0]}
              </div>
              <p className="text-sm text-gray-500 mt-2">Usuários ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Mês</CardTitle>
              <CardDescription>Evolução das vendas no período</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={reportData.sales.data}
                labels={reportData.sales.labels}
                title="Vendas Mensais"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos por Categoria</CardTitle>
              <CardDescription>Distribuição de produtos</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={reportData.products.data}
                labels={reportData.products.labels}
                title="Produtos por Categoria"
                color="green"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários por Status</CardTitle>
              <CardDescription>Distribuição de usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={reportData.users.data}
                labels={reportData.users.labels}
                title="Usuários por Status"
                color="purple"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
              <CardDescription>Evolução da receita</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={reportData.revenue.monthly}
                labels={['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']}
                title="Receita Mensal"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
