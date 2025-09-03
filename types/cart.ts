// =====================================================
// TIPOS DO SISTEMA DE CARRINHO, CHECKOUT E AUDITORIA
// YOOBE v3.1.0 - TypeScript Types
// =====================================================

// =====================================================
// TIPOS BASE
// =====================================================

export type CartStatus = 'active' | 'abandoned' | 'converted' | 'expired'
export type CheckoutStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
export type ShipmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'failed'
export type NFEStatus =
  | 'pending'
  | 'generated'
  | 'sent'
  | 'delivered'
  | 'failed'
export type CheckoutEventType =
  | 'started'
  | 'payment_attempt'
  | 'payment_success'
  | 'payment_failed'
  | 'completed'
  | 'cancelled'

// =====================================================
// INTERFACES PRINCIPAIS
// =====================================================

export interface Cart {
  id: string
  user_id: string
  tenant_id: string
  status: CartStatus
  total_amount: number
  total_items: number
  expires_at: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CustomerMeta {
  id: string
  user_id: string
  tenant_id: string
  shipping_address: Address
  billing_address: Address
  phone?: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CheckoutSession {
  id: string
  cart_id: string
  user_id: string
  tenant_id: string
  status: CheckoutStatus
  payment_intent_id?: string
  payment_method?: string
  amount_total: number
  currency: string
  expires_at: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CheckoutEvent {
  id: string
  checkout_session_id: string
  event_type: CheckoutEventType
  event_data: Record<string, any>
  created_at: string
}

export interface ShipmentIntent {
  id: string
  checkout_session_id: string
  shipping_method: string
  shipping_cost: number
  estimated_delivery?: string
  tracking_code?: string
  status: ShipmentStatus
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface NFEExport {
  id: string
  checkout_session_id: string
  nfe_number?: string
  nfe_key?: string
  status: NFEStatus
  xml_content?: string
  pdf_url?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  tenant_id: string
  user_id?: string
  action: string
  table_name: string
  record_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// =====================================================
// INTERFACES AUXILIARES
// =====================================================

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  country: string
}

export interface CartWithItems extends Cart {
  items: CartItem[]
}

export interface CheckoutSessionWithDetails extends CheckoutSession {
  cart: CartWithItems
  events: CheckoutEvent[]
  shipment?: ShipmentIntent
  nfe?: NFEExport
}

// =====================================================
// TIPOS PARA REQUESTS/REQUISIÇÕES
// =====================================================

export interface AddToCartRequest {
  product_id: string
  quantity: number
  metadata?: Record<string, any>
}

export interface UpdateCartItemRequest {
  quantity: number
  metadata?: Record<string, any>
}

export interface StartCheckoutRequest {
  shipping_address: Address
  billing_address?: Address
  payment_method: string
  metadata?: Record<string, any>
}

export interface UpdateCustomerMetaRequest {
  shipping_address?: Address
  billing_address?: Address
  phone?: string
  preferences?: Record<string, any>
}

// =====================================================
// TIPOS PARA RESPONSES/RESPOSTAS
// =====================================================

export interface CartResponse {
  success: boolean
  data?: CartWithItems
  error?: string
}

export interface CheckoutResponse {
  success: boolean
  data?: CheckoutSessionWithDetails
  error?: string
}

export interface CustomerMetaResponse {
  success: boolean
  data?: CustomerMeta
  error?: string
}

// =====================================================
// TIPOS PARA FILTROS E PAGINAÇÃO
// =====================================================

export interface CartFilters {
  status?: CartStatus
  user_id?: string
  tenant_id?: string
  created_after?: string
  created_before?: string
}

export interface CheckoutFilters {
  status?: CheckoutStatus
  user_id?: string
  tenant_id?: string
  payment_method?: string
  created_after?: string
  created_before?: string
}

export interface AuditLogFilters {
  user_id?: string
  tenant_id?: string
  action?: string
  table_name?: string
  created_after?: string
  created_before?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// =====================================================
// TIPOS PARA ESTATÍSTICAS
// =====================================================

export interface CartStatistics {
  total_carts: number
  active_carts: number
  abandoned_carts: number
  converted_carts: number
  total_value: number
  average_cart_value: number
}

export interface CheckoutStatistics {
  total_sessions: number
  completed_sessions: number
  failed_sessions: number
  total_revenue: number
  conversion_rate: number
}

// =====================================================
// TIPOS PARA WEBHOOKS E NOTIFICAÇÕES
// =====================================================

export interface PaymentWebhook {
  event_type: string
  payment_intent_id: string
  amount: number
  currency: string
  status: string
  metadata: Record<string, any>
  timestamp: string
}

export interface ShipmentWebhook {
  event_type: string
  tracking_code: string
  status: ShipmentStatus
  estimated_delivery?: string
  metadata: Record<string, any>
  timestamp: string
}

// =====================================================
// TIPOS PARA VALIDAÇÃO
// =====================================================

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// =====================================================
// TIPOS PARA CONFIGURAÇÕES
// =====================================================

export interface CartConfig {
  max_items: number
  max_value: number
  expiration_days: number
  allow_anonymous: boolean
}

export interface CheckoutConfig {
  session_timeout_minutes: number
  require_shipping_address: boolean
  require_billing_address: boolean
  supported_payment_methods: string[]
  supported_currencies: string[]
}

export interface AuditConfig {
  log_user_actions: boolean
  log_ip_addresses: boolean
  log_user_agents: boolean
  retention_days: number
  sensitive_fields: string[]
}
