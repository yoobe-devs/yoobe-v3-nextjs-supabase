"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  TrendingUp,
  Gift,
  Star,
  Coins
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { PointsBalance } from "@/components/ui/points-balance"
import { PointsTransactions } from "@/components/ui/points-transactions"

export default function PointsPage() {
  const mockCompanyId = '550e8400-e29b-41d4-a716-446655440001'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pontos</h1>
            <p className="text-gray-600">Gerencie e acompanhe seus pontos</p>
          </div>
        </div>
        <Button>
          <Gift className="h-4 w-4 mr-2" />
          Resgatar Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PointsBalance companyId={mockCompanyId} />
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pontos Ganhos</p>
                <p className="text-2xl font-bold text-green-600">+800</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pontos Gastos</p>
                <p className="text-2xl font-bold text-red-600">-150</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PointsTransactions companyId={mockCompanyId} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Como Ganhar Pontos
            </CardTitle>
            <CardDescription>
              Descubra as formas de acumular mais pontos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Atividades Diárias</p>
                <p className="text-sm text-gray-600">Faça login diariamente para ganhar pontos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Resgates</p>
                <p className="text-sm text-gray-600">Ganhe pontos ao resgatar produtos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Conquistas</p>
                <p className="text-sm text-gray-600">Complete desafios para pontos extras</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Coins className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Indicações</p>
                <p className="text-sm text-gray-600">Indique amigos e ganhe pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
