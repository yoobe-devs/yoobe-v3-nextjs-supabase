'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

interface FunnelChartProps {
  storeId: string
  period: string
}

export function FunnelChart({ storeId, period }: FunnelChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [storeId, period])

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
      })

      const response = await fetch(`/api/v2/gestor/analytics/funnel?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data.funnel || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funil:', error)
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

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumo do Funil */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-sm text-gray-600">{item.name}</div>
            <div className="text-xs text-gray-500">{item.percentage}%</div>
          </div>
        ))}
      </div>

      {/* Gráfico de Barras */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12 }}
              width={120}
            />
            <Tooltip
              formatter={(value, name) => [value, 'Quantidade']}
              labelFormatter={label => `Etapa: ${label}`}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Análise de Conversão */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Análise de Conversão</h4>
        <div className="space-y-1 text-sm">
          {data.map((item, index) => {
            if (index === 0) return null
            const prevItem = data[index - 1]
            const conversionRate =
              prevItem.value > 0
                ? Math.round((item.value / prevItem.value) * 100)
                : 0
            const dropoff = prevItem.value - item.value

            return (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">
                  {prevItem.name} → {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">
                    {conversionRate}%
                  </span>
                  <span className="text-red-600 text-xs">(-{dropoff})</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
