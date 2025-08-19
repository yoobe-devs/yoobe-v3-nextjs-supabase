'use client'

import { useState, useEffect } from 'react'
import { 
  getInventory,
  getInventoryByProductId,
  updateInventoryQuantity,
  updateInventorySettings,
  createInventoryEntry,
  getLowStockItems,
  searchInventory,
  type InventoryItem,
  type InventoryUpdateInput
} from '@/lib/queries/inventory'

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInventory()
      setInventory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedItem = await updateInventoryQuantity(productId, quantity)
      setInventory(prev => 
        prev.map(item => 
          item.product_id === productId ? updatedItem : item
        )
      )
      return updatedItem
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update inventory quantity')
    }
  }

  const updateSettings = async (data: InventoryUpdateInput) => {
    try {
      const updatedItem = await updateInventorySettings(data)
      setInventory(prev => 
        prev.map(item => 
          item.product_id === data.product_id ? updatedItem : item
        )
      )
      return updatedItem
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update inventory settings')
    }
  }

  const createEntry = async (productId: string, initialQuantity = 0) => {
    try {
      const newEntry = await createInventoryEntry(productId, initialQuantity)
      setInventory(prev => [newEntry, ...prev])
      return newEntry
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create inventory entry')
    }
  }

  const searchItems = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchInventory(query)
      setInventory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    updateQuantity,
    updateSettings,
    createEntry,
    search: searchItems
  }
}

export function useInventoryItem(productId: string | null) {
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) {
      setItem(null)
      setLoading(false)
      return
    }

    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getInventoryByProductId(productId)
        setItem(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory item')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [productId])

  return {
    item,
    loading,
    error
  }
}

export function useLowStock() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLowStock = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getLowStockItems()
      setLowStockItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch low stock items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLowStock()
  }, [])

  return {
    lowStockItems,
    loading,
    error,
    refetch: fetchLowStock
  }
}

