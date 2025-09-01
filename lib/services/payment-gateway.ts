import { PaymentGatewayTransaction } from '@/types/resgate'

export class PaymentGatewayService {
  private apiKey: string
  private baseUrl: string
  private gateway: 'stripe' | 'mercadopago' | 'pagseguro' | 'paypal'

  constructor(apiKey: string, baseUrl: string, gateway: 'stripe' | 'mercadopago' | 'pagseguro' | 'paypal') {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.gateway = gateway
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`Payment Gateway API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Payment Gateway API request failed:', error)
      throw error
    }
  }

  // Criar transação
  async createTransaction(transactionData: {
    amount: number
    currency: string
    payment_method: string
    description: string
    customer_email: string
    customer_name: string
    metadata?: Record<string, any>
  }): Promise<PaymentGatewayTransaction> {
    return this.makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    })
  }

  // Processar pagamento com cartão
  async processCardPayment(paymentData: {
    amount: number
    currency: string
    card_number: string
    card_exp_month: number
    card_exp_year: number
    card_cvc: string
    customer_email: string
    customer_name: string
    description: string
    metadata?: Record<string, any>
  }): Promise<PaymentGatewayTransaction> {
    return this.makeRequest('/payments/card', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // Criar pagamento PIX
  async createPixPayment(paymentData: {
    amount: number
    currency: string
    customer_email: string
    customer_name: string
    description: string
    expires_in?: number // segundos
    metadata?: Record<string, any>
  }): Promise<PaymentGatewayTransaction & { pix_code?: string; qr_code?: string }> {
    return this.makeRequest('/payments/pix', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // Criar boleto
  async createBoletoPayment(paymentData: {
    amount: number
    currency: string
    customer_email: string
    customer_name: string
    customer_document: string
    customer_address: {
      street: string
      city: string
      state: string
      postal_code: string
    }
    description: string
    due_date?: string
    metadata?: Record<string, any>
  }): Promise<PaymentGatewayTransaction & { boleto_code?: string; boleto_url?: string }> {
    return this.makeRequest('/payments/boleto', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // Buscar transação por ID
  async getTransaction(transactionId: string): Promise<PaymentGatewayTransaction> {
    return this.makeRequest(`/transactions/${transactionId}`)
  }

  // Atualizar status da transação
  async updateTransactionStatus(transactionId: string, status: string): Promise<PaymentGatewayTransaction> {
    return this.makeRequest(`/transactions/${transactionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Reembolsar transação
  async refundTransaction(transactionId: string, amount?: number, reason?: string): Promise<{
    success: boolean
    refund_id?: string
    amount: number
  }> {
    return this.makeRequest(`/transactions/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  }

  // Cancelar transação
  async cancelTransaction(transactionId: string, reason?: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/transactions/${transactionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Webhook para atualizações de status
  async handleWebhook(webhookData: {
    transaction_id: string
    status: string
    amount: number
    currency: string
    payment_method: string
    timestamp: string
    signature?: string
  }): Promise<{ success: boolean }> {
    // Aqui você pode implementar a lógica para processar webhooks
    // Por exemplo, atualizar o status no banco de dados local
    
    console.log('Payment Gateway webhook received:', webhookData)
    
    return { success: true }
  }

  // Buscar métodos de pagamento disponíveis
  async getAvailablePaymentMethods(): Promise<{
    id: string
    name: string
    type: string
    is_active: boolean
    fees?: {
      percentage: number
      fixed: number
    }
  }[]> {
    return this.makeRequest('/payment-methods')
  }

  // Calcular taxas de pagamento
  async calculateFees(amount: number, payment_method: string): Promise<{
    amount: number
    fee: number
    total: number
    currency: string
  }> {
    return this.makeRequest('/fees/calculate', {
      method: 'POST',
      body: JSON.stringify({ amount, payment_method }),
    })
  }

  // Relatório de transações
  async getTransactionReport(params?: {
    start_date?: string
    end_date?: string
    status?: string
    payment_method?: string
  }): Promise<{
    total_transactions: number
    total_amount: number
    successful_transactions: number
    failed_transactions: number
    average_amount: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method)

    const endpoint = `/reports/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  // Verificar se PIX foi pago
  async checkPixPayment(transactionId: string): Promise<{
    is_paid: boolean
    paid_at?: string
    amount: number
  }> {
    return this.makeRequest(`/payments/pix/${transactionId}/status`)
  }

  // Verificar se boleto foi pago
  async checkBoletoPayment(transactionId: string): Promise<{
    is_paid: boolean
    paid_at?: string
    amount: number
  }> {
    return this.makeRequest(`/payments/boleto/${transactionId}/status`)
  }
}

// Instâncias singleton para diferentes gateways
let stripeService: PaymentGatewayService | null = null
let mercadopagoService: PaymentGatewayService | null = null
let pagseguroService: PaymentGatewayService | null = null
let paypalService: PaymentGatewayService | null = null

export function getPaymentGatewayService(gateway: 'stripe' | 'mercadopago' | 'pagseguro' | 'paypal'): PaymentGatewayService {
  switch (gateway) {
    case 'stripe':
      if (!stripeService) {
        const apiKey = process.env.STRIPE_SECRET_KEY || ''
        const baseUrl = process.env.STRIPE_BASE_URL || 'https://api.stripe.com/v1'
        
        if (!apiKey) {
          throw new Error('STRIPE_SECRET_KEY environment variable is required')
        }
        
        stripeService = new PaymentGatewayService(apiKey, baseUrl, 'stripe')
      }
      return stripeService

    case 'mercadopago':
      if (!mercadopagoService) {
        const apiKey = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
        const baseUrl = process.env.MERCADOPAGO_BASE_URL || 'https://api.mercadopago.com/v1'
        
        if (!apiKey) {
          throw new Error('MERCADOPAGO_ACCESS_TOKEN environment variable is required')
        }
        
        mercadopagoService = new PaymentGatewayService(apiKey, baseUrl, 'mercadopago')
      }
      return mercadopagoService

    case 'pagseguro':
      if (!pagseguroService) {
        const apiKey = process.env.PAGSEGURO_EMAIL || ''
        const baseUrl = process.env.PAGSEGURO_BASE_URL || 'https://ws.pagseguro.uol.com.br/v2'
        
        if (!apiKey) {
          throw new Error('PAGSEGURO_EMAIL environment variable is required')
        }
        
        pagseguroService = new PaymentGatewayService(apiKey, baseUrl, 'pagseguro')
      }
      return pagseguroService

    case 'paypal':
      if (!paypalService) {
        const apiKey = process.env.PAYPAL_CLIENT_ID || ''
        const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com/v1'
        
        if (!apiKey) {
          throw new Error('PAYPAL_CLIENT_ID environment variable is required')
        }
        
        paypalService = new PaymentGatewayService(apiKey, baseUrl, 'paypal')
      }
      return paypalService

    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}


