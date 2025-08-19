import { supabase } from '@/lib/supabase'

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

// Get all orders with related data
export async function getOrders() {
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

