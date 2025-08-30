"use client"

import { usePoints } from "@/hooks/usePoints"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { ArrowUp, ArrowDown, RotateCcw, Star } from "lucide-react"

interface PointsTransactionsProps {
  companyId: string
  className?: string
}

export function PointsTransactions({ companyId, className }: PointsTransactionsProps) {
  const { transactions, loading, error } = usePoints(companyId)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'spend':
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'reversal':
        return <RotateCcw className="h-4 w-4 text-orange-600" />
      default:
        return <Star className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'earn':
        return <Badge className="bg-green-100 text-green-800">Ganhou</Badge>
      case 'spend':
        return <Badge className="bg-red-100 text-red-800">Gastou</Badge>
      case 'reversal':
        return <Badge className="bg-orange-100 text-orange-800">Reversão</Badge>
      default:
        return <Badge variant="secondary">Outro</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transações de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando transações...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transações de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-500">Erro ao carregar transações</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transações de Pontos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-4">
              <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhuma transação encontrada</p>
            </div>
          ) : (
            transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-sm">{transaction.note || transaction.source}</p>
                    <p className="text-xs text-gray-600">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </span>
                  {getTransactionBadge(transaction.type)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
