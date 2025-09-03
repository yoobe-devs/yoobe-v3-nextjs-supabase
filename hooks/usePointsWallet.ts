import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { WalletBalanceResponse, CreditPointsRequest } from '@/types/points'
import { generateIdempotencyKey } from '@/lib/idempotency'

interface UsePointsWalletReturn {
  balance: number
  loading: boolean
  error: string | null
  refreshBalance: () => Promise<void>
  creditPoints: (
    request: Omit<CreditPointsRequest, 'idempotency_key'>
  ) => Promise<boolean>
}

export function usePointsWallet(): UsePointsWalletReturn {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuário não autenticado')
        setLoading(false)
        return
      }

      const response = await fetch('/api/wallet/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Erro ao obter saldo')
      }

      const data: WalletBalanceResponse = await response.json()
      setBalance(data.data.balance_points)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [supabase.auth])

  const refreshBalance = useCallback(async () => {
    await fetchBalance()
  }, [fetchBalance])

  const creditPoints = useCallback(
    async (
      request: Omit<CreditPointsRequest, 'idempotency_key'>
    ): Promise<boolean> => {
      try {
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setError('Usuário não autenticado')
          return false
        }

        const idempotencyKey = generateIdempotencyKey('credit')
        const fullRequest: CreditPointsRequest = {
          ...request,
          idempotency_key: idempotencyKey,
        }

        const response = await fetch('/api/wallet/credit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fullRequest),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Erro ao creditar pontos')
        }

        // Atualizar saldo localmente
        await refreshBalance()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return false
      }
    },
    [supabase.auth, refreshBalance]
  )

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    balance,
    loading,
    error,
    refreshBalance,
    creditPoints,
  }
}

// Hook para gestores gerenciarem carteiras de outros usuários
interface UsePointsManagementReturn {
  creditUserPoints: (
    userId: string,
    amount: number,
    reason: string
  ) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function usePointsManagement(): UsePointsManagementReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const creditUserPoints = useCallback(
    async (
      userId: string,
      amount: number,
      reason: string
    ): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setError('Usuário não autenticado')
          return false
        }

        const idempotencyKey = generateIdempotencyKey('admin_credit')
        const request: CreditPointsRequest = {
          user_id: userId,
          amount_points: amount,
          reason: reason as 'manual_credit' | 'external_award',
          idempotency_key: idempotencyKey,
          meta: {
            credited_by: user.id,
            credited_at: new Date().toISOString(),
          },
        }

        const response = await fetch('/api/wallet/credit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Erro ao creditar pontos')
        }

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return false
      } finally {
        setLoading(false)
      }
    },
    [supabase.auth]
  )

  return {
    creditUserPoints,
    loading,
    error,
  }
}

// Hook para checkout por pontos
interface UsePointsCheckoutReturn {
  checkoutWithPoints: (
    productId: string,
    qty: number,
    addressId?: string
  ) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function usePointsCheckout(): UsePointsCheckoutReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const checkoutWithPoints = useCallback(
    async (
      productId: string,
      qty: number,
      addressId?: string
    ): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setError('Usuário não autenticado')
          return false
        }

        const idempotencyKey = generateIdempotencyKey('checkout')
        const request = {
          store_product_id: productId,
          qty,
          address_id: addressId,
          idempotency_key: idempotencyKey,
          meta: {
            checkout_by: user.id,
            checkout_at: new Date().toISOString(),
          },
        }

        const response = await fetch('/api/checkout/points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error?.message || 'Erro ao processar checkout'
          )
        }

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return false
      } finally {
        setLoading(false)
      }
    },
    [supabase.auth]
  )

  return {
    checkoutWithPoints,
    loading,
    error,
  }
}
