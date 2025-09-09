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
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface RankChartProps {
  storeId: string
  type: 'employees' | 'products'
}

export function RankChart({ storeId, type }: RankChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [storeId, type])

  const loadData = async () => {
    if (!storeId) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        store_id: storeId,
        type,
        limit: '5',
      })

      const response = await fetch(`/api/v2/gestor/analytics/top?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data.items || [])
      }
    } catch (error) {
      console.error(`Erro ao carregar top ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (type === 'employees') {
    return (
      <div className="space-y-4">
        {/* Lista de Funcionários */}
        <div className="space-y-3">
          {data.map((employee, index) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`}
                  />
                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{employee.name}</div>
                  <div className="text-xs text-gray-500">{employee.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {employee.engagementScore}
                </div>
                <div className="text-xs text-gray-500">pontos</div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de Barras */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10 }}
                width={80}
              />
              <Tooltip formatter={value => [value, 'Engagement Score']} />
              <Bar
                dataKey="engagementScore"
                fill="#8884d8"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (type === 'products') {
    return (
      <div className="space-y-4">
        {/* Lista de Produtos */}
        <div className="space-y-3">
          {data.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">📦</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">
                    {product.views} visualizações
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {product.conversionRate}%
                </div>
                <div className="text-xs text-gray-500">conversão</div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de Barras */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10 }}
                width={80}
              />
              <Tooltip formatter={value => [value, 'Taxa de Conversão (%)']} />
              <Bar
                dataKey="conversionRate"
                fill="#82ca9d"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return null
}
