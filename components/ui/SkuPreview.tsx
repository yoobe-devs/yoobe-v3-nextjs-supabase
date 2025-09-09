import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Package,
} from 'lucide-react'

interface SkuPreviewProps {
  companyId: string
  baseProductId?: string
  onSkuGenerated?: (sku: string) => void
  className?: string
}

interface PreviewData {
  samples: string[]
  company: {
    id: string
    name: string
    client_code?: string
  }
  base_code: string
  next_sequence: number
}

export function SkuPreview({
  companyId,
  baseProductId,
  onSkuGenerated,
  className = '',
}: SkuPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSku, setCopiedSku] = useState<string | null>(null)
  const [count, setCount] = useState(1)

  const fetchPreview = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        company_id: companyId,
        count: count.toString(),
      })

      if (baseProductId) {
        params.append('base_product_id', baseProductId)
      }

      const response = await fetch(`/api/sku/preview?${params}`)
      const data = await response.json()

      if (data.success) {
        setPreviewData(data.data)
        if (data.data.samples.length > 0) {
          onSkuGenerated?.(data.data.samples[0])
        }
      } else {
        setError(data.error?.message || 'Erro ao gerar preview')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchPreview()
    }
  }, [companyId, baseProductId, count])

  const copyToClipboard = async (sku: string) => {
    try {
      await navigator.clipboard.writeText(sku)
      setCopiedSku(sku)
      setTimeout(() => setCopiedSku(null), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const formatSku = (sku: string) => {
    // Destacar partes do SKU: BASECODE-SEQ-CLIENT
    const parts = sku.split('-')
    if (parts.length === 3) {
      return (
        <span className="font-mono">
          <span className="text-blue-600 font-semibold">{parts[0]}</span>
          <span className="text-gray-500">-</span>
          <span className="text-green-600 font-semibold">{parts[1]}</span>
          <span className="text-gray-500">-</span>
          <span className="text-purple-600 font-semibold">{parts[2]}</span>
        </span>
      )
    }
    return <span className="font-mono">{sku}</span>
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview de SKU
          </CardTitle>
          <Button
            onClick={fetchPreview}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="count">Quantidade de exemplos</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="10"
              value={count}
              onChange={e =>
                setCount(
                  Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                )
              }
              className="w-20"
            />
          </div>
        </div>

        {/* Informações da empresa */}
        {previewData && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm text-gray-600">Empresa</Label>
              <p className="font-medium">{previewData.company.name}</p>
              {previewData.company.client_code && (
                <p className="text-sm text-gray-500">
                  Código: {previewData.company.client_code}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm text-gray-600">Base Code</Label>
              <p className="font-medium">{previewData.base_code}</p>
              <p className="text-sm text-gray-500">
                Próximo: {previewData.next_sequence}
              </p>
            </div>
          </div>
        )}

        {/* Preview dos SKUs */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
            <Button
              onClick={fetchPreview}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        ) : previewData ? (
          <div className="space-y-2">
            <Label>SKUs Gerados:</Label>
            {previewData.samples.map((sku, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  <div>
                    {formatSku(sku)}
                    <p className="text-xs text-gray-500">
                      Exemplo #{index + 1}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(sku)}
                  className="flex items-center gap-1"
                >
                  {copiedSku === sku ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {/* Informações adicionais */}
        {previewData && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              • <strong>Base Code:</strong> Código do produto base ou nome
              sanitizado
            </p>
            <p>
              • <strong>Sequência:</strong> Número incremental por empresa
            </p>
            <p>
              • <strong>Client Code:</strong> Código da empresa ou nome
              sanitizado
            </p>
            <p>
              • <strong>Formato:</strong> BASECODE-SEQ-CLIENT
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

