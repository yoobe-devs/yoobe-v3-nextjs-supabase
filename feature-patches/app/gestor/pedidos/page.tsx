'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Package,
  Eye,
  Download,
  Calendar,
  CreditCard,
  MapPin,
  Truck,
  FileText,
  Search,
  Filter,
  ArrowLeft,
} from 'lucide-react'

interface Order {
  id: string
  number: string
  total_amount: number
  status: string
  payment_method: string
  payment_state: string
  confirmed_at: string
  address_snapshot: any
  cart_snapshot: any[]
  redemption_info: any
  tracking_info: any
  invoice_info: any
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const tenantId = user.user_metadata?.tenant_id
      const employeeId = user.user_metadata?.employee_id

      if (!tenantId || !employeeId) return

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('employee_id', employeeId)
        .order('confirmed_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar pedidos:', error)
        return
      }

      setOrders(ordersData || [])
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', className: 'bg-green-500' },
      preparing: { label: 'Preparando', className: 'bg-yellow-500' },
      shipped: { label: 'Enviado', className: 'bg-blue-500' },
      delivered: { label: 'Entregue', className: 'bg-green-600' },
      cancelled: { label: 'Cancelado', className: 'bg-red-500' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-500',
    }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPaymentBadge = (method: string) => {
    const methodConfig = {
      pix: { label: 'PIX', className: 'bg-purple-500' },
      card: { label: 'Cartão', className: 'bg-blue-500' },
      pontos: { label: 'Pontos', className: 'bg-yellow-500' },
      misto: { label: 'Misto', className: 'bg-orange-500' },
    }

    const config = methodConfig[method as keyof typeof methodConfig] || {
      label: method,
      className: 'bg-gray-500',
    }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPaymentStateBadge = (state: string) => {
    const stateConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-500' },
      paid: { label: 'Pago', className: 'bg-green-500' },
      failed: { label: 'Falhou', className: 'bg-red-500' },
    }

    const config = stateConfig[state as keyof typeof stateConfig] || {
      label: state,
      className: 'bg-gray-500',
    }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address_snapshot?.street
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/gestor')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Meus Pedidos</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por número do pedido ou endereço..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os status</option>
                <option value="confirmed">Confirmado</option>
                <option value="preparing">Preparando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Você ainda não fez nenhum pedido.'}
            </p>
            <Button
              onClick={() => router.push('/loja-brindes-preview')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Fazer Primeiro Pedido
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.number}
                        </h3>
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.payment_method)}
                        {getPaymentStateBadge(order.payment_state)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(order.confirmed_at).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>
                            R${' '}
                            {order.total_amount.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                            {order.redemption_info?.total_points && (
                              <span className="ml-1 text-yellow-600">
                                ({order.redemption_info.total_points} pontos)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">
                            {order.address_snapshot?.street},{' '}
                            {order.address_snapshot?.number}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>{order.cart_snapshot?.length || 0} itens</span>
                        </div>

                        {order.tracking_info?.code && (
                          <div className="flex items-center space-x-1">
                            <Truck className="h-4 w-4" />
                            <span>{order.tracking_info.code}</span>
                          </div>
                        )}

                        {order.invoice_info?.number && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{order.invoice_info.number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/gestor/pedidos/${order.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>

                      {order.invoice_info?.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(order.invoice_info.url, '_blank')
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          NF
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
