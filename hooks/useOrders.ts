'use client'

import { useState, useEffect } from 'react'
import { 
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrdersByStatus,
  getDashboardMetrics,
  type Order,
  type OrderCreateInput
} from '@/lib/queries/orders'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const createNewOrder = async (orderData: OrderCreateInput) => {
    try {
      const newOrder = await createOrder(orderData)
      setOrders(prev => [newOrder, ...prev])
      return newOrder
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create order')
    }
  }

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status)
      setOrders(prev => 
        prev.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      )
      return updatedOrder
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update order status')
    }
  }

  const filterByStatus = async (status: Order['status']) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOrdersByStatus(status)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    create: createNewOrder,
    updateStatus,
    filterByStatus
  }
}

export function useOrder(id: string | null) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setOrder(null)
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getOrderById(id)
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  return {
    order,
    loading,
    error
  }
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    productsSold: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardMetrics()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  }
}

