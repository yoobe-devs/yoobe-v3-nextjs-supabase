// Tipos para o sistema de resgate - Loja de Brindes

export interface StoreConfig {
  id: string
  company_id: string
  store_name: string
  store_description?: string
  store_domain?: string
  logo_url?: string
  banner_url?: string
  theme: 'light' | 'dark' | 'custom'
  currency: string
  language: string
  is_active: boolean
  allow_reviews: boolean
  show_prices: boolean
  contact_email?: string
  contact_phone?: string
  contact_address?: any
  working_hours?: string
  payment_methods: string[]
  created_at: string
  updated_at: string
}

export interface UserPoints {
  id: string
  user_id: string
  points_balance: number
  total_earned: number
  total_spent: number
  last_updated: string
  created_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  transaction_type: 'earn' | 'spend' | 'expire' | 'adjustment'
  points_amount: number
  description?: string
  reference_id?: string
  reference_type?: string
  created_at: string
}

export interface ShoppingCart {
  id: string
  user_id: string
  session_id?: string
  created_at: string
  updated_at: string
  items?: CartItem[]
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  claim_method: 'points' | 'credit_card' | 'pix' | 'boleto' | 'free'
  created_at: string
  product?: Product
}

export interface ShippingAddress {
  id: string
  user_id: string
  is_default: boolean
  recipient_name: string
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  additional_info?: string
  created_at: string
  updated_at: string
}

export interface OrderTracking {
  id: string
  order_id: string
  tracking_code?: string
  carrier?: string
  status: 'pending' | 'shipped' | 'delivered' | 'returned'
  status_details?: string
  estimated_delivery?: string
  actual_delivery?: string
  tracking_url?: string
  created_at: string
  updated_at: string
}

export interface ApiIntegration {
  id: string
  integration_type: 'workvivo' | 'cubbo' | 'olist' | 'payment_gateway'
  is_active: boolean
  api_key?: string
  api_secret?: string
  base_url?: string
  webhook_url?: string
  config?: any
  last_sync?: string
  created_at: string
  updated_at: string
}

export interface IntegrationLog {
  id: string
  integration_id: string
  action: 'sync' | 'webhook' | 'error'
  status: 'success' | 'error' | 'pending'
  request_data?: any
  response_data?: any
  error_message?: string
  created_at: string
}

export interface Promotion {
  id: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed' | 'free_shipping' | 'points_multiplier'
  discount_value?: number
  min_order_value?: number
  max_discount?: number
  start_date?: string
  end_date?: string
  is_active: boolean
  usage_limit?: number
  used_count: number
  applicable_products?: string[]
  applicable_users?: string[]
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  promotion_id: string
  user_id?: string
  is_used: boolean
  used_at?: string
  expires_at?: string
  created_at: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  order_id: string
  rating: number
  title?: string
  comment?: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'order_status' | 'points_earned' | 'promotion' | 'system'
  title: string
  message: string
  is_read: boolean
  read_at?: string
  action_url?: string
  created_at: string
}

// Tipos para APIs externas
export interface WorkvivoEmployee {
  id: string
  name: string
  email: string
  department?: string
  position?: string
  hire_date?: string
  is_active: boolean
}

export interface CubboShipment {
  id: string
  tracking_code: string
  status: string
  estimated_delivery?: string
  actual_delivery?: string
  tracking_url?: string
  carrier: string
}

export interface OlistProduct {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  stock: number
  category?: string
}

export interface PaymentGatewayTransaction {
  id: string
  amount: number
  currency: string
  payment_method: string
  status: 'pending' | 'approved' | 'declined' | 'refunded'
  transaction_id?: string
  created_at: string
}

// Tipos para formulários
export interface CheckoutForm {
  shipping_address: ShippingAddress
  payment_method: string
  use_points: boolean
  points_amount?: number
  coupon_code?: string
}

export interface ResgateFilters {
  category?: string
  price_min?: number
  price_max?: number
  claim_method?: string
  in_stock?: boolean
  sort_by?: 'name' | 'price' | 'popularity' | 'newest'
  sort_order?: 'asc' | 'desc'
}

// Tipos para estado da aplicação
export interface ResgateState {
  cart: ShoppingCart | null
  userPoints: UserPoints | null
  shippingAddresses: ShippingAddress[]
  notifications: Notification[]
  isLoading: boolean
  error: string | null
}


