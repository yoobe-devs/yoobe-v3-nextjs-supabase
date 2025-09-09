'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TimeSeriesChartProps {
  storeId: string
  period: string
}

export function TimeSeriesChart({ storeId, period }: TimeSeriesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState('all')

  useEffect(() => {
    loadData()
  }, [storeId, period, metric])

  const loadData = async () => {
    if (!storeId) return

    try {
      setLoading(true)
      const from = getDateRange(period).from
      const to = getDateRange(period).to

      const params = new URLSearchParams({
        store_id: storeId,
        from,
        to,
        metric,
      })

      const response = await fetch(
        `/api/v2/gestor/analytics/timeseries?${params}`
      )
      const result = await response.json()

      if (result.success) {
        setData(result.data.daily || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados da série temporal:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = (period: string) => {
    const now = new Date()
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return {
      from: from.toISOString(),
      to: now.toISOString(),
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return period === '7d'
      ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      : date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' })
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as métricas</SelectItem>
            <SelectItem value="activeUsers">Usuários Ativos</SelectItem>
            <SelectItem value="productViews">Visualizações</SelectItem>
            <SelectItem value="redeemComplete">Resgates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gráfico */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={value => formatDate(value)}
              formatter={(value, name) => [
                value,
                {
                  activeUsers: 'Usuários Ativos',
                  productViews: 'Visualizações',
                  addToCart: 'Adicionar ao Carrinho',
                  checkoutStart: 'Iniciar Checkout',
                  redeemComplete: 'Resgate Completo',
                  saveForLater: 'Salvar para Depois',
                }[name as string] || name,
              ]}
            />
            <Legend />

            {metric === 'all' || metric === 'activeUsers' ? (
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#8884d8"
                strokeWidth={2}
                name="Usuários Ativos"
              />
            ) : null}

            {metric === 'all' || metric === 'productViews' ? (
              <Line
                type="monotone"
                dataKey="productViews"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Visualizações"
              />
            ) : null}

            {metric === 'all' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="addToCart"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Adicionar ao Carrinho"
                />
                <Line
                  type="monotone"
                  dataKey="checkoutStart"
                  stroke="#ff7300"
                  strokeWidth={2}
                  name="Iniciar Checkout"
                />
                <Line
                  type="monotone"
                  dataKey="redeemComplete"
                  stroke="#ff0000"
                  strokeWidth={2}
                  name="Resgate Completo"
                />
              </>
            ) : null}

            {metric === 'redeemComplete' ? (
              <Line
                type="monotone"
                dataKey="redeemComplete"
                stroke="#ff0000"
                strokeWidth={2}
                name="Resgate Completo"
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
