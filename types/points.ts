// Tipos para o Sistema de Resgate por Pontos

export interface WalletAccount {
  id: string
  tenant_id: string
  user_id: string
  status: 'active' | 'blocked'
  created_at: string
}

export interface WalletEntry {
  id: string
  wallet_id: string
  direction: 'credit' | 'debit'
  amount_points: number
  reason: 'external_award' | 'manual_credit' | 'redemption' | 'adjustment'
  ref_type?: 'redemption' | 'webhook' | 'admin_action'
  ref_id?: string
  idempotency_key?: string
  meta?: Record<string, any>
  created_by?: string
  created_at: string
}

export interface PointProvider {
  id: string
  tenant_id: string
  name: string
  hmac_secret: string
  is_active: boolean
  created_at: string
}

export interface WebhookInbox {
  id: string
  tenant_id: string
  provider_id?: string
  event_type: string
  signature?: string
  payload: Record<string, any>
  status: 'received' | 'processed' | 'error' | 'ignored'
  error?: string
  idempotency_key?: string
  processed_at?: string
  created_at: string
}

export interface PointsConversionRule {
  id: string
  tenant_id: string
  status: 'active' | 'scheduled' | 'inactive'
  base_currency: string
  points_per_currency: number
  rounding_mode: 'ceil' | 'floor' | 'round'
  min_points?: number
  max_points?: number
  effective_from: string
  effective_to?: string
  created_by?: string
  created_at: string
}

export interface Redemption {
  id: string
  tenant_id: string
  user_id: string
  store_product_id: string
  qty: number
  payment_method: 'points'
  total_points: number
  status:
    | 'requested'
    | 'approved'
    | 'fulfilled'
    | 'shipped'
    | 'delivered'
    | 'failed'
    | 'cancelled'
  address_id?: string
  track_code?: string
  meta?: Record<string, any>
  idempotency_key?: string
  conversion_snapshot?: Record<string, any>
  created_at: string
  created_by?: string
}

export interface ErrorCatalog {
  id: string
  tenant_id?: string
  error_type: string
  route: string
  stack_trace_hash: string
  context: Record<string, any>
  occurrence_count: number
  first_occurrence: string
  last_occurrence: string
  resolution_notes?: string
  is_resolved: boolean
  created_at: string
}

// Tipos para as APIs

export interface WalletBalanceResponse {
  success: boolean
  data: {
    balance_points: number
    wallet_id: string
    last_updated: string
  }
  error: null
  meta: {
    currency: string
    conversion_rate?: number
  }
}

export interface CreditPointsRequest {
  user_id: string
  amount_points: number
  reason: 'manual_credit' | 'external_award'
  idempotency_key: string
  meta?: Record<string, any>
}

export interface CreditPointsResponse {
  success: boolean
  data: {
    entry_id: string
    new_balance: number
    transaction_id: string
  }
  error: null
  meta: {
    credited_at: string
    credited_by: string
  }
}

export interface PointsConversionRequest {
  points_per_currency: number
  rounding_mode: 'ceil' | 'floor' | 'round'
  min_points?: number
  max_points?: number
  effective_from?: string
  effective_to?: string
}

export interface PointsConversionResponse {
  success: boolean
  data: {
    rule_id: string
    status: string
    preview: {
      brl_100: number
      brl_50: number
      brl_25: number
      brl_10: number
      brl_5: number
    }
  }
  error: null
  meta: {
    created_at: string
    effective_from: string
  }
}

export interface ProductPointsSettings {
  allow_points: boolean
  points_price?: number
  points_override: boolean
  points_override_value?: number
}

export interface PointsPricingResponse {
  success: boolean
  data: {
    store_product_id: string
    price_brl: number
    points_price: number
    conversion_rate: number
    rounding_mode: string
    is_override: boolean
  }
  error: null
  meta: {
    calculated_at: string
    rule_id?: string
  }
}

export interface CheckoutPointsRequest {
  store_product_id: string
  qty: number
  address_id?: string
  idempotency_key: string
  meta?: Record<string, any>
}

export interface CheckoutPointsResponse {
  success: boolean
  data: {
    redemption_id: string
    total_points: number
    status: string
    estimated_delivery?: string
  }
  error: null
  meta: {
    checkout_at: string
    conversion_snapshot: Record<string, any>
  }
}

export interface WebhookGamificationRequest {
  event_type: string
  user_id: string
  points: number
  reason: string
  idempotency_key: string
  meta?: Record<string, any>
}

export interface WebhookGamificationResponse {
  success: boolean
  data: {
    processed: boolean
    wallet_updated: boolean
    points_awarded: number
    new_balance: number
  }
  error: null
  meta: {
    processed_at: string
    provider: string
  }
}

// Tipos para validação

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiError {
  success: false
  error: {
    message: string
    code: string
    details?: ValidationError[]
    timestamp: string
  }
  data: null
  meta: {
    request_id: string
    route: string
  }
}

// Tipos para auditoria

export interface AuditLog {
  id: string
  tenant_id: string
  user_id?: string
  action: string
  table_name: string
  record_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Tipos para relatórios e dashboards

export interface PointsDashboard {
  total_points_distributed: number
  total_redemptions: number
  conversion_rate: number
  top_products: Array<{
    product_id: string
    product_name: string
    redemptions_count: number
    total_points_spent: number
  }>
  recent_activity: Array<{
    type: 'credit' | 'debit' | 'redemption'
    amount: number
    user_name: string
    timestamp: string
  }>
}

export interface RedemptionStatus {
  id: string
  status: string
  status_updated_at: string
  estimated_delivery?: string
  tracking_info?: {
    carrier: string
    track_code: string
    last_update: string
  }
}
