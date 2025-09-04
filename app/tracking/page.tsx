'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Home,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function TrackingSearchPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim()) {
      setError('Por favor, digite o número do pedido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Buscar pedido pelo número
      const response = await fetch(`/api/orders/search?order_number=${encodeURIComponent(orderNumber.trim())}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Pedido não encontrado')
      }

      if (result.data && result.data.length > 0) {
        const order = result.data[0]
        router.push(`/tracking/${order.id}`)
      } else {
        setError('Nenhum pedido encontrado com este número')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Rastreamento de Pedidos
              </h1>
              <p className="text-gray-600 mt-2">
                Acompanhe o status e localização do seu pedido
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Formulário de busca */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Buscar Pedido
            </CardTitle>
            <CardDescription>
              Digite o número do seu pedido para acompanhar o status da entrega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número do Pedido</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="Ex: ORD-123456789-ABC123"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="text-lg"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Rastrear Pedido
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações sobre o rastreamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pedido Confirmado</h3>
                  <p className="text-sm text-gray-600">
                    Seu pedido foi recebido e está sendo processado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Em Trânsito</h3>
                  <p className="text-sm text-gray-600">
                    Seu pedido saiu para entrega
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Entregue</h3>
                  <p className="text-sm text-gray-600">
                    Seu pedido foi entregue com sucesso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ajuda */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Precisa de Ajuda?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Onde encontrar o número do pedido?
                </h4>
                <p className="text-sm text-gray-600">
                  O número do pedido foi enviado por email após a confirmação da compra. 
                  Ele geralmente tem o formato "ORD-" seguido de números e letras.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Não consegue encontrar seu pedido?
                </h4>
                <p className="text-sm text-gray-600">
                  Entre em contato conosco através do email de suporte ou pelo chat online. 
                  Nossa equipe está pronta para ajudar!
                </p>
              </div>

              <div className="pt-4">
                <Link href="/contato">
                  <Button variant="outline" className="w-full">
                    Entrar em Contato
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
