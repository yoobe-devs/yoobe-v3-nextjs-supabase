// =====================================================
// SERVIÇO DE CUPONS DE DESCONTO
// YOOBE v3.1.0 - Coupon Service
// =====================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  DiscountCoupon,
  CouponUsage,
  CouponValidationRequest,
  CouponValidationResult,
  ApplyCouponRequest,
  RemoveCouponRequest,
  CouponStatistics,
} from '@/types/advanced-features'

export class CouponService {
  private supabase = createClientComponentClient()

  // =====================================================
  // FUNÇÕES PRINCIPAIS DE CUPONS
  // =====================================================

  /**
   * Valida um cupom de desconto
   */
  async validateCoupon(
    request: CouponValidationRequest,
    tenantId: string
  ): Promise<CouponValidationResult> {
    try {
      // Buscar cupom pelo código
      const { data: coupon, error: couponError } = await this.supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', request.code)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single()

      if (couponError || !coupon) {
        return {
          valid: false,
          error: 'Cupom não encontrado ou inativo',
        }
      }

      // Verificar validade temporal
      const now = new Date()
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return {
          valid: false,
          error: 'Cupom ainda não está disponível',
        }
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return {
          valid: false,
          error: 'Cupom expirado',
        }
      }

      // Verificar limite de uso geral
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return {
          valid: false,
          error: 'Cupom esgotado',
        }
      }

      // Verificar uso por usuário
      if (request.user_id) {
        const { data: userUsage, error: usageError } = await this.supabase
          .from('coupon_usage')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('user_id', request.user_id)

        if (
          !usageError &&
          userUsage &&
          userUsage.length >= coupon.user_usage_limit
        ) {
          return {
            valid: false,
            error: 'Limite de uso por usuário atingido',
          }
        }
      }

      // Verificar valor mínimo
      if (request.order_total < coupon.min_order_value) {
        return {
          valid: false,
          error: `Valor mínimo não atingido: R$ ${coupon.min_order_value.toFixed(2)}`,
        }
      }

      // Verificar produtos aplicáveis
      if (coupon.applicable_products && coupon.applicable_products.length > 0) {
        if (
          !request.products ||
          !this.hasCommonItems(request.products, coupon.applicable_products)
        ) {
          return {
            valid: false,
            error: 'Cupom não aplicável aos produtos selecionados',
          }
        }
      }

      // Verificar produtos excluídos
      if (coupon.excluded_products && coupon.excluded_products.length > 0) {
        if (
          request.products &&
          this.hasCommonItems(request.products, coupon.excluded_products)
        ) {
          return {
            valid: false,
            error: 'Cupom não aplicável aos produtos selecionados',
          }
        }
      }

      // Verificar categorias aplicáveis
      if (
        coupon.applicable_categories &&
        coupon.applicable_categories.length > 0
      ) {
        if (
          !request.categories ||
          !this.hasCommonItems(request.categories, coupon.applicable_categories)
        ) {
          return {
            valid: false,
            error: 'Cupom não aplicável às categorias selecionadas',
          }
        }
      }

      // Calcular desconto
      const calculatedDiscount = this.calculateDiscount(
        coupon,
        request.order_total
      )

      return {
        valid: true,
        coupon_id: coupon.id,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_value: coupon.min_order_value,
        max_discount: coupon.max_discount,
        calculated_discount: calculatedDiscount,
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error)
      return {
        valid: false,
        error: 'Erro interno ao validar cupom',
      }
    }
  }

  /**
   * Aplica um cupom a uma sessão de checkout
   */
  async applyCoupon(request: ApplyCouponRequest): Promise<{
    success: boolean
    data?: {
      coupon: DiscountCoupon
      discount_amount: number
      final_total: number
    }
    error?: string
  }> {
    try {
      // Validar cupom
      const validation = await this.validateCoupon(
        {
          code: request.coupon_code,
          order_total: 0, // Será calculado abaixo
        },
        request.tenant_id
      )

      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        }
      }

      // Buscar sessão de checkout
      const { data: checkoutSession, error: checkoutError } =
        await this.supabase
          .from('checkout_sessions')
          .select('*')
          .eq('id', request.checkout_session_id)
          .single()

      if (checkoutError || !checkoutSession) {
        return {
          success: false,
          error: 'Sessão de checkout não encontrada',
        }
      }

      // Buscar carrinho para calcular total
      const { data: cart, error: cartError } = await this.supabase
        .from('carts')
        .select('total_amount')
        .eq('id', checkoutSession.cart_id)
        .single()

      if (cartError || !cart) {
        return {
          success: false,
          error: 'Carrinho não encontrado',
        }
      }

      // Buscar cupom completo
      const { data: coupon, error: couponError } = await this.supabase
        .from('discount_coupons')
        .select('*')
        .eq('id', validation.coupon_id)
        .single()

      if (couponError || !coupon) {
        return {
          success: false,
          error: 'Cupom não encontrado',
        }
      }

      // Calcular desconto
      const discountAmount = this.calculateDiscount(coupon, cart.total_amount)
      const finalTotal = Math.max(0, cart.total_amount - discountAmount)

      // Atualizar sessão de checkout com cupom
      const { error: updateError } = await this.supabase
        .from('checkout_sessions')
        .update({
          metadata: {
            ...checkoutSession.metadata,
            applied_coupon: {
              id: coupon.id,
              code: coupon.code,
              discount_amount: discountAmount,
              discount_type: coupon.discount_type,
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.checkout_session_id)

      if (updateError) {
        return {
          success: false,
          error: 'Erro ao aplicar cupom',
        }
      }

      return {
        success: true,
        data: {
          coupon,
          discount_amount: discountAmount,
          final_total: finalTotal,
        },
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error)
      return {
        success: false,
        error: 'Erro interno ao aplicar cupom',
      }
    }
  }

  /**
   * Remove um cupom de uma sessão de checkout
   */
  async removeCoupon(request: RemoveCouponRequest): Promise<{
    success: boolean
    data?: {
      original_total: number
      final_total: number
    }
    error?: string
  }> {
    try {
      // Buscar sessão de checkout
      const { data: checkoutSession, error: checkoutError } =
        await this.supabase
          .from('checkout_sessions')
          .select('*')
          .eq('id', request.checkout_session_id)
          .single()

      if (checkoutError || !checkoutSession) {
        return {
          success: false,
          error: 'Sessão de checkout não encontrada',
        }
      }

      // Buscar carrinho para obter total original
      const { data: cart, error: cartError } = await this.supabase
        .from('carts')
        .select('total_amount')
        .eq('id', checkoutSession.cart_id)
        .single()

      if (cartError || !cart) {
        return {
          success: false,
          error: 'Carrinho não encontrado',
        }
      }

      const originalTotal = cart.total_amount
      const appliedCoupon = checkoutSession.metadata?.applied_coupon

      if (!appliedCoupon) {
        return {
          success: false,
          error: 'Nenhum cupom aplicado',
        }
      }

      // Remover cupom da sessão
      const { error: updateError } = await this.supabase
        .from('checkout_sessions')
        .update({
          metadata: {
            ...checkoutSession.metadata,
            applied_coupon: null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.checkout_session_id)

      if (updateError) {
        return {
          success: false,
          error: 'Erro ao remover cupom',
        }
      }

      return {
        success: true,
        data: {
          original_total: originalTotal,
          final_total: originalTotal,
        },
      }
    } catch (error) {
      console.error('Erro ao remover cupom:', error)
      return {
        success: false,
        error: 'Erro interno ao remover cupom',
      }
    }
  }

  /**
   * Registra o uso de um cupom
   */
  async recordCouponUsage(
    couponId: string,
    userId: string,
    checkoutSessionId: string,
    discountAmount: number,
    orderTotal: number
  ): Promise<void> {
    try {
      // Registrar uso
      const { error: usageError } = await this.supabase
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: userId,
          checkout_session_id: checkoutSessionId,
          discount_amount: discountAmount,
          order_total: orderTotal,
        })

      if (usageError) {
        console.error('Erro ao registrar uso do cupom:', usageError)
        return
      }

      // Incrementar contador de uso
      const { error: updateError } = await this.supabase
        .from('discount_coupons')
        .update({
          usage_count: this.supabase.sql`usage_count + 1`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', couponId)

      if (updateError) {
        console.error('Erro ao atualizar contador de uso:', updateError)
      }
    } catch (error) {
      console.error('Erro ao registrar uso do cupom:', error)
    }
  }

  /**
   * Cria um novo cupom
   */
  async createCoupon(
    couponData: Partial<DiscountCoupon>
  ): Promise<DiscountCoupon> {
    const { data: coupon, error } = await this.supabase
      .from('discount_coupons')
      .insert(couponData)
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar cupom: ${error.message}`)
    return coupon
  }

  /**
   * Atualiza um cupom existente
   */
  async updateCoupon(
    id: string,
    updates: Partial<DiscountCoupon>
  ): Promise<DiscountCoupon> {
    const { data: coupon, error } = await this.supabase
      .from('discount_coupons')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Erro ao atualizar cupom: ${error.message}`)
    return coupon
  }

  /**
   * Desativa um cupom
   */
  async deactivateCoupon(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('discount_coupons')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw new Error(`Erro ao desativar cupom: ${error.message}`)
  }

  /**
   * Obtém estatísticas de cupons
   */
  async getCouponStatistics(tenantId: string): Promise<CouponStatistics> {
    const { data: coupons, error: couponsError } = await this.supabase
      .from('discount_coupons')
      .select('*')
      .eq('tenant_id', tenantId)

    if (couponsError)
      throw new Error(`Erro ao buscar cupons: ${couponsError.message}`)

    const { data: usage, error: usageError } = await this.supabase
      .from('coupon_usage')
      .select('discount_amount, order_total')
      .in('coupon_id', coupons?.map(c => c.id) || [])

    if (usageError) throw new Error(`Erro ao buscar uso: ${usageError.message}`)

    const totalCoupons = coupons?.length || 0
    const activeCoupons = coupons?.filter(c => c.is_active).length || 0
    const totalUsage = usage?.length || 0
    const totalDiscount =
      usage?.reduce((sum, u) => sum + u.discount_amount, 0) || 0
    const averageDiscount = totalUsage > 0 ? totalDiscount / totalUsage : 0

    // Cupom mais usado
    const couponUsageCount: Record<string, number> = {}
    usage?.forEach(u => {
      const couponId = u.coupon_id
      couponUsageCount[couponId] = (couponUsageCount[couponId] || 0) + 1
    })

    const mostUsedCoupon = Object.entries(couponUsageCount).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0]

    // Taxa de conversão (uso de cupons vs total de pedidos)
    const conversionRate =
      totalUsage > 0 ? (totalUsage / (totalUsage + 100)) * 100 : 0 // Mock

    return {
      total_coupons: totalCoupons,
      active_coupons: activeCoupons,
      total_usage: totalUsage,
      total_discount: totalDiscount,
      average_discount: averageDiscount,
      most_used_coupon: mostUsedCoupon,
      conversion_rate: conversionRate,
    }
  }

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  /**
   * Calcula o valor do desconto
   */
  private calculateDiscount(
    coupon: DiscountCoupon,
    orderTotal: number
  ): number {
    let discount = 0

    switch (coupon.discount_type) {
      case 'percentage':
        discount = orderTotal * (coupon.discount_value / 100)
        break
      case 'fixed':
        discount = coupon.discount_value
        break
      case 'free_shipping':
        discount = 0 // Será aplicado separadamente
        break
      default:
        discount = 0
    }

    // Aplicar limite máximo
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount
    }

    // Não permitir desconto maior que o total
    if (discount > orderTotal) {
      discount = orderTotal
    }

    return Math.round(discount * 100) / 100
  }

  /**
   * Verifica se há itens em comum entre dois arrays
   */
  private hasCommonItems(array1: string[], array2: string[]): boolean {
    return array1.some(item => array2.includes(item))
  }
}

// Instância singleton do serviço
export const couponService = new CouponService()
