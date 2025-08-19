import { supabase } from '@/lib/supabase'
import { apiFetch } from '@/lib/api'

export interface Order {
  id: string
  order_number: string
  user_id?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  payment_method?: 'credit_card' | 'pix' | 'boleto' | 'free' | 'points'
  shipping_address?: any
  notes?: string
  created_at: string
  updated_at: string
  profiles?: {
    name: string
    email: string
  }
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  products?: {
    name: string
    sku?: string
  }
}

export interface OrderCreateInput {
  user_id?: string
  total_amount: number
  payment_method?: string
  shipping_address?: any
  notes?: string
  items: {
    product_id: string
    quantity: number
    unit_price: number
  }[]
}

function isApiMode() {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL)
}

function mapStorefrontOrder(o: any): Order {
  const attrs = o?.attributes || {}
  const now = new Date().toISOString()
  const total = (() => {
    const raw = attrs.total ?? attrs.display_total
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
      const num = Number(raw.replace(/[^0-9.,-]/g, '').replace(',', '.'))
      return isNaN(num) ? 0 : num
    }
    return 0
  })()
  return {
    id: String(o?.id ?? attrs.id ?? Math.random().toString(36).slice(2)),
    order_number: String(attrs.number ?? o?.id ?? ''),
    user_id: undefined,
    status: (attrs.state ?? 'pending') as Order['status'],
    total_amount: total,
    payment_method: undefined,
    shipping_address: attrs?.ship_address || undefined,
    notes: undefined,
    created_at: attrs.created_at ?? now,
    updated_at: attrs.updated_at ?? now,
    profiles: undefined,
    order_items: [],
  }
}

// Get all orders
export async function getOrders() {
  if (isApiMode()) {
    const resp = await apiFetch<any>('/api/v2/storefront/account/orders', {
      query: { sort: '-created_at' },
    })
    const list = Array.isArray(resp?.data) ? resp.data.map(mapStorefrontOrder) : []
    return list as Order[]
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (
        name,
        email
      ),
      order_items (
        *,
        products (
          name,
          sku
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    throw error
  }

  return data as Order[]
}

// Get order by ID
export async function getOrderById(id: string) {
  if (isApiMode()) {
    const resp = await apiFetch<any>(`/api/v2/storefront/account/orders/${id}`)
    const order = resp?.data ? mapStorefrontOrder(resp.data) : null
    if (!order) throw new Error('Pedido não encontrado')
    return order
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (
        name,
        email
      ),
      order_items (
        *,
        products (
          name,
          sku
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    throw error
  }

  return data as Order
}

// Create new order
export async function createOrder(orderData: OrderCreateInput) {
  if (isApiMode()) {
    throw new Error('Criação de pedidos via Storefront requer fluxo de carrinho/checkout. Implementar conforme API.')
  }
  // Create the order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      total_amount: orderData.total_amount,
      payment_method: orderData.payment_method,
      shipping_address: orderData.shipping_address,
      notes: orderData.notes,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    throw orderError
  }

  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    throw itemsError
  }

  return order as Order
}

// Update order status
export async function updateOrderStatus(id: string, status: Order['status']) {
  if (isApiMode()) {
    throw new Error('Atualização de status via API Storefront não suportada neste cliente.')
  }
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    throw error
  }

  return data as Order
}

// Get orders by status
export async function getOrdersByStatus(status: Order['status']) {
  if (isApiMode()) {
    const resp = await apiFetch<any>('/api/v2/storefront/account/orders', {
      query: { 'filter[state_eq]': status, sort: '-created_at' },
    })
    const list = Array.isArray(resp?.data) ? resp.data.map(mapStorefrontOrder) : []
    return list as Order[]
  }
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (
        name,
        email
      ),
      order_items (
        *,
        products (
          name,
          sku
        )
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders by status:', error)
    throw error
  }

  return data as Order[]
}

// Get dashboard metrics
export async function getDashboardMetrics() {
  if (isApiMode()) {
    // Could be derived client-side from orders listing; keeping Supabase logic for now
  }
  // Get total orders count
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'delivered')

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  // Get products sold count
  const { data: itemsData } = await supabase
    .from('order_items')
    .select('quantity, orders!inner(status)')
    .eq('orders.status', 'delivered')

  const productsSold = itemsData?.reduce((sum, item) => sum + item.quantity, 0) || 0

  // Calculate average order value
  const averageOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalOrders: totalOrders || 0,
    totalRevenue,
    productsSold,
    averageOrderValue
  }
}

