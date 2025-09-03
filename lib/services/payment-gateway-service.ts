// =====================================================
// SERVIÇO DE GATEWAYS DE PAGAMENTO
// YOOBE v3.1.0 - Payment Gateway Service
// =====================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  PaymentGateway,
  GatewayFees,
  PaymentTransaction,
  PaymentWebhook,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  CreateRefundRequest,
  CreateRefundResponse,
  WebhookProcessingRequest,
  WebhookProcessingResponse,
  PaymentStatistics,
  StripeConfig,
  MercadoPagoConfig,
  PayPalConfig,
} from '@/types/advanced-features'

export class PaymentGatewayService {
  private supabase = createClientComponentClient()

  // =====================================================
  // FUNÇÕES PRINCIPAIS DE GATEWAYS
  // =====================================================

  /**
   * Obtém todos os gateways ativos de um tenant
   */
  async getGateways(tenantId: string): Promise<PaymentGateway[]> {
    const { data: gateways, error } = await this.supabase
      .from('payment_gateways')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw new Error(`Erro ao buscar gateways: ${error.message}`)
    return gateways || []
  }

  /**
   * Obtém um gateway específico
   */
  async getGateway(gatewayId: string): Promise<PaymentGateway> {
    const { data: gateway, error } = await this.supabase
      .from('payment_gateways')
      .select('*')
      .eq('id', gatewayId)
      .single()

    if (error || !gateway) throw new Error('Gateway não encontrado')
    return gateway
  }

  /**
   * Cria um novo gateway
   */
  async createGateway(
    gatewayData: Partial<PaymentGateway>
  ): Promise<PaymentGateway> {
    const { data: gateway, error } = await this.supabase
      .from('payment_gateways')
      .insert(gatewayData)
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar gateway: ${error.message}`)
    return gateway
  }

  /**
   * Atualiza um gateway existente
   */
  async updateGateway(
    id: string,
    updates: Partial<PaymentGateway>
  ): Promise<PaymentGateway> {
    const { data: gateway, error } = await this.supabase
      .from('payment_gateways')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Erro ao atualizar gateway: ${error.message}`)
    return gateway
  }

  /**
   * Desativa um gateway
   */
  async deactivateGateway(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('payment_gateways')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw new Error(`Erro ao desativar gateway: ${error.message}`)
  }

  // =====================================================
  // PROCESSAMENTO DE PAGAMENTOS
  // =====================================================

  /**
   * Processa um pagamento através de um gateway
   */
  async processPayment(
    request: ProcessPaymentRequest
  ): Promise<ProcessPaymentResponse> {
    try {
      // Buscar gateway
      const gateway = await this.getGateway(request.gateway_id)

      // Validar se o gateway suporta o método de pagamento
      if (!gateway.supported_payment_methods.includes(request.payment_method)) {
        return {
          success: false,
          error: `Método de pagamento ${request.payment_method} não suportado por este gateway`,
        }
      }

      // Validar se o gateway suporta a moeda
      if (!gateway.supported_currencies.includes(request.currency_code)) {
        return {
          success: false,
          error: `Moeda ${request.currency_code} não suportada por este gateway`,
        }
      }

      // Processar pagamento baseado no provider
      let paymentResult: any

      switch (gateway.provider) {
        case 'stripe':
          paymentResult = await this.processStripePayment(request, gateway)
          break
        case 'mercadopago':
          paymentResult = await this.processMercadoPagoPayment(request, gateway)
          break
        case 'paypal':
          paymentResult = await this.processPayPalPayment(request, gateway)
          break
        case 'pix':
          paymentResult = await this.processPixPayment(request, gateway)
          break
        case 'boleto':
          paymentResult = await this.processBoletoPayment(request, gateway)
          break
        default:
          return {
            success: false,
            error: `Provider ${gateway.provider} não implementado`,
          }
      }

      if (!paymentResult.success) {
        return paymentResult
      }

      // Criar transação no banco
      const transaction = await this.createPaymentTransaction({
        checkout_session_id: request.checkout_session_id,
        gateway_id: request.gateway_id,
        external_transaction_id: paymentResult.data?.external_id,
        amount: request.payment_data.amount || 0,
        currency_code: request.currency_code,
        payment_method: request.payment_method,
        status: paymentResult.data?.status || 'pending',
        gateway_response: paymentResult.data,
        metadata: request.metadata,
      })

      return {
        success: true,
        data: {
          transaction,
          redirect_url: paymentResult.data?.redirect_url,
          payment_intent: paymentResult.data?.payment_intent,
        },
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      return {
        success: false,
        error: `Erro interno ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  /**
   * Processa pagamento via Stripe
   */
  private async processStripePayment(
    request: ProcessPaymentRequest,
    gateway: PaymentGateway
  ): Promise<ProcessPaymentResponse> {
    try {
      const config = gateway.config as StripeConfig

      // Simular processamento Stripe (em produção, usar SDK real)
      const mockPaymentResult = {
        success: true,
        data: {
          external_id: `stripe_${Date.now()}`,
          status: 'succeeded',
          payment_intent: `pi_${Date.now()}`,
          amount: request.payment_data.amount,
          currency: request.currency_code,
          payment_method: request.payment_method,
        },
      }

      return mockPaymentResult
    } catch (error) {
      return {
        success: false,
        error: `Erro no Stripe: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  /**
   * Processa pagamento via MercadoPago
   */
  private async processMercadoPagoPayment(
    request: ProcessPaymentRequest,
    gateway: PaymentGateway
  ): Promise<ProcessPaymentResponse> {
    try {
      const config = gateway.config as MercadoPagoConfig

      // Simular processamento MercadoPago
      const mockPaymentResult = {
        success: true,
        data: {
          external_id: `mp_${Date.now()}`,
          status: 'pending',
          payment_intent: `payment_${Date.now()}`,
          amount: request.payment_data.amount,
          currency: request.currency_code,
          payment_method: request.payment_method,
          redirect_url: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref_${Date.now()}`,
        },
      }

      return mockPaymentResult
    } catch (error) {
      return {
        success: false,
        error: `Erro no MercadoPago: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  /**
   * Processa pagamento via PayPal
   */
  private async processPayPalPayment(
    request: ProcessPaymentRequest,
    gateway: PaymentGateway
  ): Promise<ProcessPaymentResponse> {
    try {
      const config = gateway.config as PayPalConfig

      // Simular processamento PayPal
      const mockPaymentResult = {
        success: true,
        data: {
          external_id: `paypal_${Date.now()}`,
          status: 'pending',
          payment_intent: `PAY-${Date.now()}`,
          amount: request.payment_data.amount,
          currency: request.currency_code,
          payment_method: request.payment_method,
          redirect_url: `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-${Date.now()}`,
        },
      }

      return mockPaymentResult
    } catch (error) {
      return {
        success: false,
        error: `Erro no PayPal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  /**
   * Processa pagamento via PIX
   */
  private async processPixPayment(
    request: ProcessPaymentRequest,
    gateway: PaymentGateway
  ): Promise<ProcessPaymentResponse> {
    try {
      // Simular processamento PIX
      const mockPaymentResult = {
        success: true,
        data: {
          external_id: `pix_${Date.now()}`,
          status: 'pending',
          payment_intent: `pix_${Date.now()}`,
          amount: request.payment_data.amount,
          currency: request.currency_code,
          payment_method: 'pix',
          qr_code: `data:image/png;base64,${btoa('mock_qr_code_data')}`,
          qr_code_text: `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540510.005802BR5913Teste Empresa6008Brasilia62070503***6304ABCD`,
        },
      }

      return mockPaymentResult
    } catch (error) {
      return {
        success: false,
        error: `Erro no PIX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  /**
   * Processa pagamento via Boleto
   */
  private async processBoletoPayment(
    request: ProcessPaymentRequest,
    gateway: PaymentGateway
  ): Promise<ProcessPaymentResponse> {
    try {
      // Simular processamento Boleto
      const mockPaymentResult = {
        success: true,
        data: {
          external_id: `boleto_${Date.now()}`,
          status: 'pending',
          payment_intent: `boleto_${Date.now()}`,
          amount: request.payment_data.amount,
          currency: request.currency_code,
          payment_method: 'boleto',
          boleto_code: `34191.79001 01043.510047 91020.150008 4 84410026000`,
          due_date: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toISOString(), // 3 dias
          pdf_url: `https://api.example.com/boleto/${Date.now()}.pdf`,
        },
      }

      return mockPaymentResult
    } catch (error) {
      return {
        success: false,
        error: `Erro no Boleto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  // =====================================================
  // GESTÃO DE TRANSAÇÕES
  // =====================================================

  /**
   * Cria uma transação de pagamento
   */
  async createPaymentTransaction(
    transactionData: Partial<PaymentTransaction>
  ): Promise<PaymentTransaction> {
    const { data: transaction, error } = await this.supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar transação: ${error.message}`)
    return transaction
  }

  /**
   * Atualiza status de uma transação
   */
  async updateTransactionStatus(
    transactionId: string,
    status: string,
    gatewayResponse?: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('payment_transactions')
      .update({
        status,
        gateway_response: gatewayResponse,
        processed_at: status === 'succeeded' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)

    if (error) throw new Error(`Erro ao atualizar transação: ${error.message}`)
  }

  /**
   * Obtém transações de uma sessão de checkout
   */
  async getTransactionsByCheckout(
    checkoutSessionId: string
  ): Promise<PaymentTransaction[]> {
    const { data: transactions, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('checkout_session_id', checkoutSessionId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao buscar transações: ${error.message}`)
    return transactions || []
  }

  /**
   * Obtém transação por idempotency_key armazenada em metadata
   */
  async getTransactionByIdempotency(
    checkoutSessionId: string,
    idempotencyKey: string
  ): Promise<PaymentTransaction | null> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('checkout_session_id', checkoutSessionId)
      .contains('metadata', { idempotency_key: idempotencyKey })
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw new Error(`Erro ao buscar transação idempotente: ${error.message}`)
    if (Array.isArray(data) && data.length > 0) return data[0] as PaymentTransaction
    return null
  }

  // =====================================================
  // SISTEMA DE REFUNDS
  // =====================================================

  /**
   * Cria um reembolso
   */
  async createRefund(
    request: CreateRefundRequest
  ): Promise<CreateRefundResponse> {
    try {
      // Buscar transação
      const { data: transaction, error: transactionError } = await this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', request.transaction_id)
        .single()

      if (transactionError || !transaction) {
        return {
          success: false,
          error: 'Transação não encontrada',
        }
      }

      // Validar se a transação pode ser reembolsada
      if (transaction.status !== 'succeeded') {
        return {
          success: false,
          error: 'Transação não pode ser reembolsada',
        }
      }

      // Validar valor do reembolso
      if (request.amount > transaction.amount) {
        return {
          success: false,
          error:
            'Valor do reembolso não pode ser maior que o valor da transação',
        }
      }

      // Processar reembolso no gateway (simulado)
      const refundResult = await this.processGatewayRefund(
        transaction,
        request.amount
      )

      if (!refundResult.success) {
        return refundResult
      }

      // Criar registro de reembolso
      const { data: refund, error: refundError } = await this.supabase
        .from('refunds')
        .insert({
          payment_transaction_id: request.transaction_id,
          amount: request.amount,
          reason: request.reason,
          status: 'completed',
          gateway_refund_id: refundResult.data?.gateway_refund_id,
          processed_at: new Date().toISOString(),
          metadata: request.metadata,
        })
        .select()
        .single()

      if (refundError) {
        return {
          success: false,
          error: `Erro ao criar reembolso: ${refundError.message}`,
        }
      }

      // Atualizar status da transação
      await this.updateTransactionStatus(request.transaction_id, 'refunded')

      return {
        success: true,
        data: refund,
      }
    } catch (error) {
      console.error('Erro ao criar reembolso:', error)
      return {
        success: false,
        error: `Erro interno ao criar reembolso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  /**
   * Processa reembolso no gateway
   */
  private async processGatewayRefund(
    transaction: PaymentTransaction,
    amount: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Simular processamento de reembolso
      const mockRefundResult = {
        success: true,
        data: {
          gateway_refund_id: `refund_${Date.now()}`,
          status: 'completed',
          amount,
          processed_at: new Date().toISOString(),
        },
      }

      return mockRefundResult
    } catch (error) {
      return {
        success: false,
        error: `Erro ao processar reembolso no gateway: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  // =====================================================
  // WEBHOOKS E NOTIFICAÇÕES
  // =====================================================

  /**
   * Processa webhook de um gateway
   */
  async processWebhook(
    request: WebhookProcessingRequest
  ): Promise<WebhookProcessingResponse> {
    try {
      // Buscar gateway
      const gateway = await this.getGateway(request.gateway_id)

      // Validar assinatura do webhook (implementar conforme cada gateway)
      const isValidSignature = await this.validateWebhookSignature(
        request.payload,
        request.signature,
        gateway
      )

      if (!isValidSignature) {
        return {
          success: false,
          processed: false,
          error: 'Assinatura do webhook inválida',
        }
      }

      // Processar evento baseado no tipo
      await this.handleWebhookEvent(
        request.event_type,
        request.payload,
        gateway
      )

      // Registrar webhook processado
      await this.recordWebhook(
        request.gateway_id,
        request.event_type,
        request.payload
      )

      return {
        success: true,
        processed: true,
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      return {
        success: false,
        processed: false,
        error: `Erro interno ao processar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  /**
   * Valida assinatura do webhook
   */
  private async validateWebhookSignature(
    payload: Record<string, any>,
    signature?: string,
    gateway?: PaymentGateway
  ): Promise<boolean> {
    // Implementar validação específica para cada gateway
    // Por enquanto, retorna true para demonstração
    return true
  }

  /**
   * Manipula eventos de webhook
   */
  private async handleWebhookEvent(
    eventType: string,
    payload: Record<string, any>,
    gateway: PaymentGateway
  ): Promise<void> {
    switch (eventType) {
      case 'payment.succeeded':
        await this.handlePaymentSucceeded(payload, gateway)
        break
      case 'payment.failed':
        await this.handlePaymentFailed(payload, gateway)
        break
      case 'payment.refunded':
        await this.handlePaymentRefunded(payload, gateway)
        break
      default:
        console.log(`Evento de webhook não tratado: ${eventType}`)
    }
  }

  /**
   * Manipula pagamento bem-sucedido
   */
  private async handlePaymentSucceeded(
    payload: Record<string, any>,
    gateway: PaymentGateway
  ): Promise<void> {
    try {
      const externalTransactionId = payload.data?.id || payload.id

      // Buscar transação pelo ID externo
      const { data: transaction, error } = await this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('external_transaction_id', externalTransactionId)
        .single()

      if (transaction) {
        await this.updateTransactionStatus(transaction.id, 'succeeded', payload)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento bem-sucedido:', error)
    }
  }

  /**
   * Manipula pagamento falhado
   */
  private async handlePaymentFailed(
    payload: Record<string, any>,
    gateway: PaymentGateway
  ): Promise<void> {
    try {
      const externalTransactionId = payload.data?.id || payload.id

      // Buscar transação pelo ID externo
      const { data: transaction, error } = await this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('external_transaction_id', externalTransactionId)
        .single()

      if (transaction) {
        await this.updateTransactionStatus(transaction.id, 'failed', {
          ...payload,
          error_message: payload.failure_reason || 'Pagamento falhou',
        })
      }
    } catch (error) {
      console.error('Erro ao processar pagamento falhado:', error)
    }
  }

  /**
   * Manipula pagamento reembolsado
   */
  private async handlePaymentRefunded(
    payload: Record<string, any>,
    gateway: PaymentGateway
  ): Promise<void> {
    try {
      const externalTransactionId = payload.data?.id || payload.id

      // Buscar transação pelo ID externo
      const { data: transaction, error } = await this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('external_transaction_id', externalTransactionId)
        .single()

      if (transaction) {
        await this.updateTransactionStatus(transaction.id, 'refunded', payload)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento reembolsado:', error)
    }
  }

  /**
   * Registra webhook recebido
   */
  private async recordWebhook(
    gatewayId: string,
    eventType: string,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('payment_webhooks').insert({
        gateway_id: gatewayId,
        event_type: eventType,
        payload,
        processed: true,
        processed_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erro ao registrar webhook:', error)
    }
  }

  // =====================================================
  // ESTATÍSTICAS E RELATÓRIOS
  // =====================================================

  /**
   * Obtém estatísticas de pagamentos
   */
  async getPaymentStatistics(tenantId: string): Promise<PaymentStatistics> {
    try {
      // Buscar gateways do tenant
      const gateways = await this.getGateways(tenantId)

      // Buscar transações
      const { data: transactions, error: transactionsError } =
        await this.supabase
          .from('payment_transactions')
          .select('*')
          .in(
            'gateway_id',
            gateways.map(g => g.id)
          )

      if (transactionsError)
        throw new Error(
          `Erro ao buscar transações: ${transactionsError.message}`
        )

      const totalTransactions = transactions?.length || 0
      const successfulTransactions =
        transactions?.filter(t => t.status === 'succeeded').length || 0
      const failedTransactions =
        transactions?.filter(t => t.status === 'failed').length || 0
      const totalAmount =
        transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const averageTransaction =
        totalTransactions > 0 ? totalAmount / totalTransactions : 0

      // Distribuição por método de pagamento
      const paymentMethodDistribution: Record<string, number> = {}
      transactions?.forEach(t => {
        paymentMethodDistribution[t.payment_method] =
          (paymentMethodDistribution[t.payment_method] || 0) + 1
      })

      // Performance por gateway
      const gatewayPerformance: Record<string, any> = {}
      gateways.forEach(gateway => {
        const gatewayTransactions =
          transactions?.filter(t => t.gateway_id === gateway.id) || []
        const gatewaySuccessful = gatewayTransactions.filter(
          t => t.status === 'succeeded'
        ).length
        const successRate =
          gatewayTransactions.length > 0
            ? (gatewaySuccessful / gatewayTransactions.length) * 100
            : 0

        gatewayPerformance[gateway.name] = {
          success_rate: successRate,
          total_transactions: gatewayTransactions.length,
          average_processing_time: Math.random() * 5 + 1, // Simulado
        }
      })

      return {
        total_transactions: totalTransactions,
        successful_transactions: successfulTransactions,
        failed_transactions: failedTransactions,
        total_amount: totalAmount,
        average_transaction: averageTransaction,
        payment_method_distribution: paymentMethodDistribution,
        gateway_performance: gatewayPerformance,
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas de pagamento:', error)
      throw error
    }
  }
}

// Instância singleton do serviço
export const paymentGatewayService = new PaymentGatewayService()
