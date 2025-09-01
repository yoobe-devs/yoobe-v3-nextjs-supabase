"use client"

import { usePoints } from "@/hooks/usePoints"
import { Coins, Star } from "lucide-react"
import { Card, CardContent } from "./card"

interface PointsBalanceProps {
  companyId?: string
  className?: string
}

export function PointsBalance({ companyId, className }: PointsBalanceProps) {
  const { balance, loading, error } = usePoints(companyId || 'default')

  // Fallback para quando não há companyId
  if (!companyId) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Selecione uma empresa</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-purple-600 animate-pulse" />
            <span className="text-sm text-gray-500">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-500">Erro ao carregar pontos</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-sm">Seus Pontos</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-purple-600" />
            <span className="text-lg font-bold text-purple-600">{balance}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
