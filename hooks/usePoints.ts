import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface PointBalance {
  company_id: string
  user_id: string
  balance: number
}

interface PointTransaction {
  id: string
  company_id: string
  user_id: string
  type: 'earn' | 'spend' | 'reversal'
  points: number
  source: string
  order_id?: string
  note?: string
  created_at: string
}

export function usePoints(companyId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  // Buscar saldo de pontos
  const fetchBalance = async () => {
    if (!companyId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_point_balances')
        .select('balance')
        .eq('company_id', companyId)
        .single()

      if (error) {
        console.error('Erro ao buscar saldo de pontos:', error)
        setError(error.message)
        return
      }

      setBalance(data?.balance || 0)
    } catch (err) {
      console.error('Erro ao buscar saldo:', err)
      setError('Erro ao carregar saldo de pontos')
    } finally {
      setLoading(false)
    }
  }

  // Buscar transações de pontos
  const fetchTransactions = async () => {
    if (!companyId) return

    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erro ao buscar transações:', error)
        return
      }

      setTransactions(data || [])
    } catch (err) {
      console.error('Erro ao buscar transações:', err)
    }
  }

  // Ganhar pontos (para gamificação)
  const earnPoints = async (points: number, reason?: string) => {
    if (!companyId) return false

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const response = await fetch('/api/points/earn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          userId: user.id,
          points,
          reason
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao ganhar pontos')
      }

      const result = await response.json()
      setBalance(result.balance)
      
      // Atualizar transações
      await fetchTransactions()
      
      return true
    } catch (err) {
      console.error('Erro ao ganhar pontos:', err)
      setError(err instanceof Error ? err.message : 'Erro ao ganhar pontos')
      return false
    }
  }

  // Atualizar dados quando companyId mudar
  useEffect(() => {
    if (companyId) {
      fetchBalance()
      fetchTransactions()
    }
  }, [companyId])

  return {
    balance,
    transactions,
    loading,
    error,
    earnPoints,
    refreshBalance: fetchBalance,
    refreshTransactions: fetchTransactions
  }
}
