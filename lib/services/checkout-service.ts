// =====================================================
// SERVIÇO DE CHECKOUT
// YOOBE v3.1.0 - Checkout Service
// =====================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  CheckoutSession,
  CheckoutSessionWithDetails,
  CheckoutEvent,
  StartCheckoutRequest,
  CheckoutResponse,
  CheckoutFilters,
  PaginationParams,
  CheckoutStatistics,
  PaymentWebhook,
  ShipmentWebhook,
} from '@/types/cart'

export class CheckoutService {
  private supabase = createClientComponentClient()

  // =====================================================
  // FUNÇÕES PRINCIPAIS DO CHECKOUT
  // =====================================================

  /**
   * Cria uma nova sessão de checkout a partir de um carrinho
   */
  async createCheckoutFromCart(
    cartId: string,
    request: StartCheckoutRequest
  ): Promise<CheckoutSession> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se o carrinho existe e pertence ao usuário
    const { data: cart, error: cartError } = await this.supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (cartError || !cart) throw new Error('Carrinho não encontrado')

    // Verificar se já existe uma sessão de checkout para este carrinho
    const { data: existingSession } = await this.supabase
      .from('checkout_sessions')
      .select('id')
      .eq('cart_id', cartId)
      .eq('status', 'pending')
      .single()

    if (existingSession) {
      throw new Error('Já existe uma sessão de checkout para este carrinho')
    }

    // Criar sessão de checkout
    const { data: session, error } = await this.supabase
      .from('checkout_sessions')
      .insert({
        cart_id: cartId,
        user_id: user.id,
        tenant_id: cart.tenant_id,
        status: 'pending',
        amount_total: cart.total_amount,
        currency: 'BRL',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        metadata: request.metadata || {},
      })
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar checkout: ${error.message}`)

    // Criar evento de início do checkout
    await this.createCheckoutEvent(session.id, 'started', {
      shipping_address: request.shipping_address,
      billing_address: request.billing_address,
      payment_method: request.payment_method,
    })

    return session
  }

  /**
   * Obtém uma sessão de checkout com todos os detalhes
   */
  async getCheckoutSession(
    sessionId: string
  ): Promise<CheckoutSessionWithDetails> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar sessão de checkout
    const { data: session, error: sessionError } = await this.supabase
      .from('checkout_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      throw new Error('Sessão de checkout não encontrada')
    }

    // Buscar carrinho com itens
    const { data: cart, error: cartError } = await this.supabase
      .from('carts')
      .select(
        `
        *,
        cart_items (
          *,
          products (
            id,
            name,
            price,
            images
          )
        )
      `
      )
      .eq('id', session.cart_id)
      .single()

    if (cartError)
      throw new Error(`Erro ao buscar carrinho: ${cartError.message}`)

    // Buscar eventos do checkout
    const { data: events, error: eventsError } = await this.supabase
      .from('checkout_events')
      .select('*')
      .eq('checkout_session_id', sessionId)
      .order('created_at', { ascending: true })

    if (eventsError) {
      throw new Error(`Erro ao buscar eventos: ${eventsError.message}`)
    }

    // Buscar intenção de envio
    const { data: shipment } = await this.supabase
      .from('shipment_intents')
      .select('*')
      .eq('checkout_session_id', sessionId)
      .single()

    // Buscar NFE
    const { data: nfe } = await this.supabase
      .from('nfe_exports')
      .select('*')
      .eq('checkout_session_id', sessionId)
      .single()

    return {
      ...session,
      cart: cart as any,
      events: events || [],
      shipment: shipment || undefined,
      nfe: nfe || undefined,
    }
  }

  /**
   * Atualiza o status de uma sessão de checkout
   */
  async updateCheckoutStatus(
    sessionId: string,
    status: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se a sessão pertence ao usuário
    const { data: session } = await this.supabase
      .from('checkout_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) throw new Error('Sessão de checkout não encontrada')

    // Atualizar status
    const { error } = await this.supabase
      .from('checkout_sessions')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(metadata && { metadata }),
      })
      .eq('id', sessionId)

    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)

    // Criar evento de mudança de status
    await this.createCheckoutEvent(sessionId, status as any, metadata)
  }

  /**
   * Cria um evento de checkout
   */
  async createCheckoutEvent(
    sessionId: string,
    eventType: string,
    eventData?: Record<string, any>
  ): Promise<CheckoutEvent> {
    const { data: event, error } = await this.supabase
      .from('checkout_events')
      .insert({
        checkout_session_id: sessionId,
        event_type: eventType,
        event_data: eventData || {},
      })
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar evento: ${error.message}`)

    return event
  }

  /**
   * Processa webhook de pagamento
   */
  async processPaymentWebhook(webhook: PaymentWebhook): Promise<void> {
    // Buscar sessão de checkout pelo payment_intent_id
    const { data: session, error: sessionError } = await this.supabase
      .from('checkout_sessions')
      .select('id, status')
      .eq('payment_intent_id', webhook.payment_intent_id)
      .single()

    if (sessionError || !session) {
      throw new Error('Sessão de checkout não encontrada')
    }

    // Atualizar status baseado no webhook
    let newStatus = 'processing'
    if (webhook.status === 'succeeded') {
      newStatus = 'completed'
    } else if (webhook.status === 'failed') {
      newStatus = 'failed'
    }

    await this.updateCheckoutStatus(session.id, newStatus, {
      payment_status: webhook.status,
      webhook_data: webhook,
    })
  }

  /**
   * Processa webhook de envio
   */
  async processShipmentWebhook(webhook: ShipmentWebhook): Promise<void> {
    // Buscar intenção de envio pelo tracking_code
    const { data: shipment, error: shipmentError } = await this.supabase
      .from('shipment_intents')
      .select('id, checkout_session_id')
      .eq('tracking_code', webhook.tracking_code)
      .single()

    if (shipmentError || !shipment) {
      throw new Error('Intenção de envio não encontrada')
    }

    // Atualizar status do envio
    const { error } = await this.supabase
      .from('shipment_intents')
      .update({
        status: webhook.status,
        estimated_delivery: webhook.estimated_delivery,
        updated_at: new Date().toISOString(),
        metadata: { webhook_data: webhook },
      })
      .eq('id', shipment.id)

    if (error) throw new Error(`Erro ao atualizar envio: ${error.message}`)

    // Criar evento de checkout para mudança de status do envio
    await this.createCheckoutEvent(
      shipment.checkout_session_id,
      'shipment_updated',
      {
        tracking_code: webhook.tracking_code,
        status: webhook.status,
        estimated_delivery: webhook.estimated_delivery,
      }
    )
  }

  /**
   * Obtém sessões de checkout com filtros e paginação
   */
  async getCheckoutSessions(
    filters: CheckoutFilters,
    pagination: PaginationParams
  ): Promise<CheckoutSession[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    let query = this.supabase
      .from('checkout_sessions')
      .select('*')
      .eq('user_id', user.id)

    // Aplicar filtros
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id)
    if (filters.payment_method)
      query = query.eq('payment_method', filters.payment_method)
    if (filters.created_after)
      query = query.gte('created_at', filters.created_after)
    if (filters.created_before)
      query = query.lte('created_at', filters.created_before)

    // Aplicar paginação
    const offset = (pagination.page - 1) * pagination.limit
    query = query.range(offset, offset + pagination.limit - 1)

    // Aplicar ordenação
    if (pagination.sort_by) {
      query = query.order(pagination.sort_by, {
        ascending: pagination.sort_order === 'asc',
      })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw new Error(`Erro ao buscar sessões: ${error.message}`)

    return data || []
  }

  /**
   * Obtém estatísticas de checkout
   */
  async getCheckoutStatistics(tenantId: string): Promise<CheckoutStatistics> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar estatísticas
    const { data, error } = await this.supabase.rpc('get_checkout_statistics', {
      tenant_id: tenantId,
      user_id: user.id,
    })

    if (error) throw new Error(`Erro ao buscar estatísticas: ${error.message}`)

    return (
      data || {
        total_sessions: 0,
        completed_sessions: 0,
        failed_sessions: 0,
        total_revenue: 0,
        conversion_rate: 0,
      }
    )
  }

  /**
   * Cancela uma sessão de checkout
   */
  async cancelCheckout(sessionId: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se a sessão pertence ao usuário
    const { data: session } = await this.supabase
      .from('checkout_sessions')
      .select('id, status')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) throw new Error('Sessão de checkout não encontrada')

    if (session.status === 'completed') {
      throw new Error('Não é possível cancelar um checkout já completado')
    }

    // Cancelar checkout
    await this.updateCheckoutStatus(sessionId, 'cancelled', {
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
    })
  }
}

// Instância singleton do serviço
export const checkoutService = new CheckoutService()
