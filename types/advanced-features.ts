// =====================================================
// TIPOS PARA FUNCIONALIDADES AVANÇADAS
// YOOBE v3.1.0 - Advanced Features Types
// =====================================================

// =====================================================
// SISTEMA DE CUPONS DE DESCONTO
// =====================================================

export type DiscountType = 'percentage' | 'fixed' | 'free_shipping'

export interface DiscountCoupon {
  id: string
  tenant_id: string
  code: string
  name: string
  description?: string
  discount_type: DiscountType
  discount_value: number
  min_order_value: number
  max_discount?: number
  usage_limit?: number
  usage_count: number
  user_usage_limit: number
  valid_from: string
  valid_until?: string
  is_active: boolean
  applicable_products?: string[]
  applicable_categories?: string[]
  excluded_products?: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  checkout_session_id: string
  discount_amount: number
  order_total: number
  used_at: string
  metadata: Record<string, any>
}

export interface CouponValidationRequest {
  code: string
  order_total: number
  user_id?: string
  products?: string[]
  categories?: string[]
}

export interface CouponValidationResult {
  valid: boolean
  error?: string
  coupon_id?: string
  discount_type?: DiscountType
  discount_value?: number
  min_order_value?: number
  max_discount?: number
  calculated_discount?: number
}

// =====================================================
// SISTEMA DE MÚLTIPLAS MOEDAS
// =====================================================

export interface Currency {
  id: string
  tenant_id: string
  code: string // ISO 4217
  name: string
  symbol: string
  exchange_rate: number
  is_base_currency: boolean
  is_active: boolean
  decimal_places: number
  rounding_mode: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ExchangeRateHistory {
  id: string
  currency_id: string
  exchange_rate: number
  source: string
  valid_from: string
  valid_until?: string
  metadata: Record<string, any>
  created_at: string
}

export interface CurrencyConversionRequest {
  amount: number
  from_currency: string
  to_currency: string
  tenant_id: string
}

export interface CurrencyConversionResult {
  original_amount: number
  converted_amount: number
  from_currency: string
  to_currency: string
  exchange_rate: number
  conversion_date: string
}

// =====================================================
// GATEWAYS DE PAGAMENTO
// =====================================================

export type PaymentProvider =
  | 'stripe'
  | 'mercadopago'
  | 'paypal'
  | 'pagseguro'
  | 'pix'
  | 'boleto'
export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'boleto'
  | 'bank_transfer'
  | 'wallet'
export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
export type FeeType = 'percentage' | 'fixed' | 'mixed'

export interface PaymentGateway {
  id: string
  tenant_id: string
  name: string
  provider: PaymentProvider
  is_active: boolean
  is_test: boolean
  supported_currencies: string[]
  supported_payment_methods: PaymentMethod[]
  config: Record<string, any>
  webhook_url?: string
  webhook_secret?: string
  fees_config: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface GatewayFees {
  id: string
  gateway_id: string
  payment_method: PaymentMethod
  fee_type: FeeType
  percentage_fee: number
  fixed_fee: number
  min_fee: number
  max_fee?: number
  currency_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  checkout_session_id: string
  gateway_id: string
  external_transaction_id?: string
  amount: number
  currency_code: string
  payment_method: PaymentMethod
  status: TransactionStatus
  gateway_response?: Record<string, any>
  error_message?: string
  processed_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PaymentWebhook {
  id: string
  gateway_id: string
  external_webhook_id?: string
  event_type: string
  payload: Record<string, any>
  processed: boolean
  processed_at?: string
  error_message?: string
  retry_count: number
  created_at: string
}

// =====================================================
// SISTEMA DE REFUNDS
// =====================================================

export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Refund {
  id: string
  payment_transaction_id: string
  amount: number
  reason: string
  status: RefundStatus
  gateway_refund_id?: string
  processed_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RefundRequest {
  transaction_id: string
  amount: number
  reason: string
  metadata?: Record<string, any>
}

// =====================================================
// SISTEMA DE ASSINATURAS
// =====================================================

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'unpaid'
  | 'trial'

export interface Subscription {
  id: string
  tenant_id: string
  user_id: string
  plan_id?: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  gateway_subscription_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  tenant_id: string
  name: string
  description?: string
  price: number
  currency_code: string
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  trial_days: number
  features: string[]
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// =====================================================
// REQUISIÇÕES E RESPOSTAS
// =====================================================

export interface ApplyCouponRequest {
  coupon_code: string
  checkout_session_id: string
  tenant_id: string
}

export interface ApplyCouponResponse {
  success: boolean
  data?: {
    coupon: DiscountCoupon
    discount_amount: number
    final_total: number
  }
  error?: string
}

export interface RemoveCouponRequest {
  checkout_session_id: string
  tenant_id: string
}

export interface RemoveCouponResponse {
  success: boolean
  data?: {
    original_total: number
    final_total: number
  }
  error?: string
}

export interface ProcessPaymentRequest {
  checkout_session_id: string
  gateway_id: string
  payment_method: PaymentMethod
  payment_data: Record<string, any>
  currency_code: string
  metadata?: Record<string, any>
}

export interface ProcessPaymentResponse {
  success: boolean
  data?: {
    transaction: PaymentTransaction
    redirect_url?: string
    payment_intent?: string
  }
  error?: string
}

export interface CreateRefundRequest {
  transaction_id: string
  amount: number
  reason: string
  metadata?: Record<string, any>
}

export interface CreateRefundResponse {
  success: boolean
  data?: Refund
  error?: string
}

export interface WebhookProcessingRequest {
  gateway_id: string
  event_type: string
  payload: Record<string, any>
  signature?: string
}

export interface WebhookProcessingResponse {
  success: boolean
  processed: boolean
  error?: string
}

// =====================================================
// CONFIGURAÇÕES E METADADAS
// =====================================================

export interface GatewayConfig {
  api_key: string
  secret_key: string
  webhook_secret?: string
  sandbox_mode?: boolean
  additional_config?: Record<string, any>
}

export interface StripeConfig extends GatewayConfig {
  publishable_key: string
  account_id?: string
  connect_enabled?: boolean
}

export interface MercadoPagoConfig extends GatewayConfig {
  access_token: string
  public_key: string
  integrator_id?: string
}

export interface PayPalConfig extends GatewayConfig {
  client_id: string
  client_secret: string
  mode: 'sandbox' | 'live'
}

export interface CurrencyConfig {
  default_currency: string
  supported_currencies: string[]
  auto_update_rates: boolean
  rate_update_interval: number // em horas
  rate_providers: string[]
}

export interface CouponConfig {
  max_discount_percentage: number
  min_order_value: number
  allow_combine: boolean
  max_coupons_per_order: number
  validation_rules: string[]
}

// =====================================================
// ESTATÍSTICAS E RELATÓRIOS
// =====================================================

export interface CouponStatistics {
  total_coupons: number
  active_coupons: number
  total_usage: number
  total_discount: number
  average_discount: number
  most_used_coupon?: string
  conversion_rate: number
}

export interface PaymentStatistics {
  total_transactions: number
  successful_transactions: number
  failed_transactions: number
  total_amount: number
  average_transaction: number
  payment_method_distribution: Record<PaymentMethod, number>
  gateway_performance: Record<
    string,
    {
      success_rate: number
      total_transactions: number
      average_processing_time: number
    }
  >
}

export interface CurrencyStatistics {
  base_currency: string
  total_currencies: number
  active_currencies: number
  exchange_rate_updates: number
  last_update: string
  conversion_requests: number
}

// =====================================================
// VALIDAÇÕES E CONSTRAINTS
// =====================================================

export interface CouponValidationRules {
  max_discount_percentage: number
  min_order_value: number
  max_usage_per_user: number
  max_total_usage: number
  valid_duration_days: number
  applicable_categories: string[]
  excluded_products: string[]
}

export interface PaymentValidationRules {
  min_amount: number
  max_amount: number
  supported_currencies: string[]
  supported_methods: PaymentMethod[]
  require_authentication: boolean
  require_verification: boolean
}

// =====================================================
// WEBHOOKS E EVENTOS
// =====================================================

export interface WebhookEvent {
  id: string
  gateway_id: string
  event_type: string
  payload: Record<string, any>
  signature?: string
  timestamp: string
  processed: boolean
  retry_count: number
}

export interface WebhookHandler {
  event_type: string
  handler: (
    payload: Record<string, any>,
    gateway: PaymentGateway
  ) => Promise<void>
  priority: number
  retry_on_failure: boolean
  max_retries: number
}

// =====================================================
// UTILITÁRIOS
// =====================================================

export interface CurrencyFormatter {
  format(amount: number, currency: string, locale?: string): string
  parse(formatted: string, currency: string): number
  getSymbol(currency: string): string
  getDecimalPlaces(currency: string): number
}

export interface DiscountCalculator {
  calculate(coupon: DiscountCoupon, order_total: number, items?: any[]): number
  validate(
    coupon: DiscountCoupon,
    order_total: number,
    user_id?: string
  ): boolean
  apply(
    coupon: DiscountCoupon,
    order_total: number
  ): {
    discount_amount: number
    final_total: number
    savings_percentage: number
  }
}

export interface PaymentProcessor {
  process(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse>
  refund(request: CreateRefundRequest): Promise<CreateRefundResponse>
  webhook(event: WebhookEvent): Promise<void>
  getSupportedMethods(): PaymentMethod[]
  getSupportedCurrencies(): string[]
}
