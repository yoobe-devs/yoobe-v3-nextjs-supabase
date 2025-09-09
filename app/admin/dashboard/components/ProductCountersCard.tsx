'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ProductCounters {
  total: number
  active: number
  draft: number
  liberado: number
  inativo: number
  lastUpdated: string
}

export default function ProductCountersCard() {
  const [counters, setCounters] = useState<ProductCounters>({
    total: 0,
    active: 0,
    draft: 0,
    liberado: 0,
    inativo: 0,
    lastUpdated: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductCounters()
  }, [])

  const fetchProductCounters = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando contadores de produtos...')

      const response = await fetch('/api/admin/companies')

      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dados de empresas recebidos:', data)

        // Somar contadores de todas as empresas
        const totalCounters = data.data?.reduce(
          (acc: any, company: any) => {
            return {
              total: acc.total + (company.products_total || 0),
              active: acc.active + (company.products_ativo || 0),
              draft: acc.draft + (company.products_draft || 0),
              liberado: acc.liberado + (company.products_liberado || 0),
              inativo: acc.inativo + (company.products_inativo || 0),
              lastUpdated: company.stats_updated_at || acc.lastUpdated,
            }
          },
          {
            total: 0,
            active: 0,
            draft: 0,
            liberado: 0,
            inativo: 0,
            lastUpdated: '',
          }
        ) || {
          total: 0,
          active: 0,
          draft: 0,
          liberado: 0,
          inativo: 0,
          lastUpdated: '',
        }

        setCounters(totalCounters)
        console.log('✅ Contadores carregados:', totalCounters)
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contadores:', error)
      toast.error('Erro ao carregar contadores de produtos')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'draft':
        return 'text-yellow-600'
      case 'liberado':
        return 'text-blue-600'
      case 'inativo':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'draft':
        return <AlertCircle className="h-4 w-4" />
      case 'liberado':
        return <TrendingUp className="h-4 w-4" />
      case 'inativo':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Contadores de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Contadores de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {counters.total.toLocaleString()}
            </span>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon('active')}
                <span className="text-sm text-green-600">Ativos</span>
              </div>
              <span className="font-semibold text-green-600">
                {counters.active}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon('draft')}
                <span className="text-sm text-yellow-600">Draft</span>
              </div>
              <span className="font-semibold text-yellow-600">
                {counters.draft}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon('liberado')}
                <span className="text-sm text-blue-600">Liberados</span>
              </div>
              <span className="font-semibold text-blue-600">
                {counters.liberado}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon('inativo')}
                <span className="text-sm text-red-600">Inativos</span>
              </div>
              <span className="font-semibold text-red-600">
                {counters.inativo}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          {counters.lastUpdated && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                Atualizado: {new Date(counters.lastUpdated).toLocaleString()}
              </p>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchProductCounters}
            className="w-full mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Atualizar Contadores
          </button>
        </div>
      </CardContent>
    </Card>
  )
}










