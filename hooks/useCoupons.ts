// =====================================================
// HOOK: USO DE CUPONS DE DESCONTO
// YOOBE v3.1.0 - Coupon Hook
// =====================================================

import { useState, useCallback } from 'react'
import { couponService } from '@/lib/services/coupon-service'
import {
  DiscountCoupon,
  CouponValidationRequest,
  CouponValidationResult,
  ApplyCouponRequest,
  RemoveCouponRequest,
  CouponStatistics,
} from '@/types/advanced-features'

interface UseCouponsOptions {
  tenantId: string
}

interface UseCouponsReturn {
  // Estado dos cupons
  appliedCoupon: DiscountCoupon | null
  validationResult: CouponValidationResult | null
  isLoading: boolean
  error: string | null

  // Funções de cupons
  validateCoupon: (
    request: CouponValidationRequest
  ) => Promise<CouponValidationResult>
  applyCoupon: (request: ApplyCouponRequest) => Promise<boolean>
  removeCoupon: (request: RemoveCouponRequest) => Promise<boolean>
  getCouponStatistics: () => Promise<CouponStatistics>

  // Estados de operação
  isValidating: boolean
  isApplying: boolean
  isRemoving: boolean
  isGettingStats: boolean
}

export function useCoupons(options: UseCouponsOptions): UseCouponsReturn {
  const { tenantId } = options

  // Estados
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(
    null
  )
  const [validationResult, setValidationResult] =
    useState<CouponValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados de operação
  const [isValidating, setIsValidating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isGettingStats, setIsGettingStats] = useState(false)

  // =====================================================
  // FUNÇÕES PRINCIPAIS
  // =====================================================

  /**
   * Valida um cupom de desconto
   */
  const validateCoupon = useCallback(
    async (
      request: CouponValidationRequest
    ): Promise<CouponValidationResult> => {
      try {
        setIsValidating(true)
        setError(null)

        const result = await couponService.validateCoupon(request, tenantId)
        setValidationResult(result)

        if (!result.valid) {
          setError(result.error || 'Cupom inválido')
        }

        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao validar cupom'
        setError(errorMessage)
        console.error('Erro ao validar cupom:', err)
        throw err
      } finally {
        setIsValidating(false)
      }
    },
    [tenantId]
  )

  /**
   * Aplica um cupom a uma sessão de checkout
   */
  const applyCoupon = useCallback(
    async (request: ApplyCouponRequest): Promise<boolean> => {
      try {
        setIsApplying(true)
        setError(null)

        const result = await couponService.applyCoupon(request)

        if (result.success && result.data) {
          setAppliedCoupon(result.data.coupon)
          setValidationResult(null) // Limpar validação anterior
          return true
        } else {
          setError(result.error || 'Erro ao aplicar cupom')
          return false
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao aplicar cupom'
        setError(errorMessage)
        console.error('Erro ao aplicar cupom:', err)
        return false
      } finally {
        setIsApplying(false)
      }
    },
    []
  )

  /**
   * Remove um cupom de uma sessão de checkout
   */
  const removeCoupon = useCallback(
    async (request: RemoveCouponRequest): Promise<boolean> => {
      try {
        setIsRemoving(true)
        setError(null)

        const result = await couponService.removeCoupon(request)

        if (result.success) {
          setAppliedCoupon(null)
          return true
        } else {
          setError(result.error || 'Erro ao remover cupom')
          return false
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao remover cupom'
        setError(errorMessage)
        console.error('Erro ao remover cupom:', err)
        return false
      } finally {
        setIsRemoving(false)
      }
    },
    []
  )

  /**
   * Obtém estatísticas de cupons
   */
  const getCouponStatistics =
    useCallback(async (): Promise<CouponStatistics> => {
      try {
        setIsGettingStats(true)
        setError(null)

        const stats = await couponService.getCouponStatistics(tenantId)
        return stats
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao obter estatísticas'
        setError(errorMessage)
        console.error('Erro ao obter estatísticas de cupons:', err)
        throw err
      } finally {
        setIsGettingStats(false)
      }
    }, [tenantId])

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  /**
   * Limpa o cupom aplicado
   */
  const clearAppliedCoupon = useCallback(() => {
    setAppliedCoupon(null)
    setValidationResult(null)
    setError(null)
  }, [])

  /**
   * Limpa erros
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Verifica se há um cupom aplicado
   */
  const hasAppliedCoupon = useCallback(() => {
    return appliedCoupon !== null
  }, [appliedCoupon])

  /**
   * Obtém o valor do desconto aplicado
   */
  const getAppliedDiscount = useCallback(() => {
    if (!appliedCoupon || !validationResult) return 0
    return validationResult.calculated_discount || 0
  }, [appliedCoupon, validationResult])

  /**
   * Obtém o tipo de desconto aplicado
   */
  const getAppliedDiscountType = useCallback(() => {
    if (!appliedCoupon) return null
    return appliedCoupon.discount_type
  }, [appliedCoupon])

  /**
   * Formata o valor do desconto para exibição
   */
  const formatDiscount = useCallback((discount: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${discount}%`
      case 'fixed':
        return `R$ ${discount.toFixed(2)}`
      case 'free_shipping':
        return 'Frete Grátis'
      default:
        return `R$ ${discount.toFixed(2)}`
    }
  }, [])

  return {
    // Estado
    appliedCoupon,
    validationResult,
    isLoading: isValidating || isApplying || isRemoving || isGettingStats,
    error,

    // Funções principais
    validateCoupon,
    applyCoupon,
    removeCoupon,
    getCouponStatistics,

    // Estados de operação
    isValidating,
    isApplying,
    isRemoving,
    isGettingStats,

    // Funções auxiliares (não expostas na interface, mas úteis internamente)
    clearAppliedCoupon,
    clearError,
    hasAppliedCoupon,
    getAppliedDiscount,
    getAppliedDiscountType,
    formatDiscount,
  }
}
