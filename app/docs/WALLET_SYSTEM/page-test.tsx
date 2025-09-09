'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, CreditCard } from 'lucide-react'

export default function WalletSystemPageTest() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            Sistema de Carteira v3.1.0
          </h1>
          <p className="text-gray-600 mt-2">
            Gestão completa de pontos, transações e sistema de crédito/debito da
            plataforma Yoobe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Funcionamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Esta é uma versão de teste simplificada da página do Sistema de
            Carteira.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

