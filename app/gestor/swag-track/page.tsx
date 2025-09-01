"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react'

interface SwagTracking {
  id: string
  employeeName: string
  productName: string
  orderDate: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  estimatedDelivery?: string
}

export default function SwagTrackPage() {
  const { user } = useAuth()
  const [trackings, setTrackings] = useState<SwagTracking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados de rastreamento
    const loadTrackingData = async () => {
      try {
        // Dados mockados para demonstração
        const mockTrackings: SwagTracking[] = [
          {
            id: '1',
            employeeName: 'João Silva',
            productName: 'Camiseta Corporativa',
            orderDate: '2024-01-15',
            status: 'delivered',
            trackingNumber: 'BR123456789BR',
            estimatedDelivery: '2024-01-20'
          },
          {
            id: '2',
            employeeName: 'Maria Santos',
            productName: 'Caneca Personalizada',
            orderDate: '2024-01-16',
            status: 'shipped',
            trackingNumber: 'BR987654321BR',
            estimatedDelivery: '2024-01-22'
          },
          {
            id: '3',
            employeeName: 'Pedro Costa',
            productName: 'Mochila Corporativa',
            orderDate: '2024-01-17',
            status: 'processing',
            estimatedDelivery: '2024-01-25'
          },
          {
            id: '4',
            employeeName: 'Ana Oliveira',
            productName: 'Garrafa Térmica',
            orderDate: '2024-01-18',
            status: 'pending',
            estimatedDelivery: '2024-01-28'
          },
          {
            id: '5',
            employeeName: 'Carlos Ferreira',
            productName: 'Boné da Empresa',
            orderDate: '2024-01-14',
            status: 'cancelled'
          }
        ]
        
        setTrackings(mockTrackings)
      } catch (error) {
        console.error('Erro ao carregar dados de rastreamento:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrackingData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      case 'processing':
        return <Badge variant="default">Processando</Badge>
      case 'shipped':
        return <Badge variant="default">Enviado</Badge>
      case 'delivered':
        return <Badge variant="default" className="bg-green-600">Entregue</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'processing':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const stats = {
    total: trackings.length,
    pending: trackings.filter(t => t.status === 'pending').length,
    processing: trackings.filter(t => t.status === 'processing').length,
    shipped: trackings.filter(t => t.status === 'shipped').length,
    delivered: trackings.filter(t => t.status === 'delivered').length,
    cancelled: trackings.filter(t => t.status === 'cancelled').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados de rastreamento...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Swag Track</h1>
              <p className="text-gray-600 mt-2">
                Acompanhe o rastreamento de todos os pedidos de brindes
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </Button>
              <Button className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Pedidos totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando processamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processando</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Em preparação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviados</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shipped}</div>
              <p className="text-xs text-muted-foreground">
                Em trânsito
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregues</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">
                Concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
              <p className="text-xs text-muted-foreground">
                Cancelados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tracking List */}
        <Card>
          <CardHeader>
            <CardTitle>Rastreamento de Pedidos</CardTitle>
            <CardDescription>
              Acompanhe o status de todos os pedidos de brindes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackings.map((tracking) => (
                <div key={tracking.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(tracking.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {tracking.employeeName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {tracking.productName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(tracking.status)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Pedido: {tracking.orderDate}</span>
                      {tracking.trackingNumber && (
                        <span>Rastreamento: {tracking.trackingNumber}</span>
                      )}
                      {tracking.estimatedDelivery && (
                        <span>Entrega: {tracking.estimatedDelivery}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
