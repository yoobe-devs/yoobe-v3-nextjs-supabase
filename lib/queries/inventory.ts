import { supabase } from '@/lib/supabase'

export interface InventoryItem {
  id: string
  product_id: string
  quantity: number
  min_quantity: number
  max_quantity: number
  updated_at: string
  products?: {
    id: string
    name: string
    sku?: string
    image_url?: string
    price: number
  }
}

export interface InventoryUpdateInput {
  product_id: string
  quantity: number
  min_quantity?: number
  max_quantity?: number
}

// Get all inventory items with product details
export async function getInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (
        id,
        name,
        sku,
        image_url,
        price
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching inventory:', error)
    throw error
  }

  return data as InventoryItem[]
}

// Get inventory for specific product
export async function getInventoryByProductId(productId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (
        id,
        name,
        sku,
        image_url,
        price
      )
    `)
    .eq('product_id', productId)
    .single()

  if (error) {
    console.error('Error fetching inventory for product:', error)
    throw error
  }

  return data as InventoryItem
}

// Update inventory quantity
export async function updateInventoryQuantity(productId: string, quantity: number) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ quantity })
    .eq('product_id', productId)
    .select(`
      *,
      products (
        id,
        name,
        sku,
        image_url,
        price
      )
    `)
    .single()

  if (error) {
    console.error('Error updating inventory quantity:', error)
    throw error
  }

  return data as InventoryItem
}

// Update inventory settings (min/max quantities)
export async function updateInventorySettings(data: InventoryUpdateInput) {
  const { data: result, error } = await supabase
    .from('inventory')
    .update({
      quantity: data.quantity,
      min_quantity: data.min_quantity,
      max_quantity: data.max_quantity
    })
    .eq('product_id', data.product_id)
    .select(`
      *,
      products (
        id,
        name,
        sku,
        image_url,
        price
      )
    `)
    .single()

  if (error) {
    console.error('Error updating inventory settings:', error)
    throw error
  }

  return result as InventoryItem
}

// Create inventory entry for new product
export async function createInventoryEntry(productId: string, initialQuantity = 0) {
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      product_id: productId,
      quantity: initialQuantity,
      min_quantity: 10,
      max_quantity: 1000
    })
    .select(`
      *,
      products (
        id,
        name,
        sku,
        image_url,
        price
      )
    `)
    .single()

  if (error) {
    console.error('Error creating inventory entry:', error)
    throw error
  }

  return data as InventoryItem
}

// Get low stock items (below minimum quantity)
export async function getLowStockItems() {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (
        id,
        name,
        sku,
        image_url,
        price
      )
    `)
    .lt('quantity', 10) // Simple threshold for now
    .order('quantity', { ascending: true })

  if (error) {
    console.error('Error fetching low stock items:', error)
    throw error
  }

  return data as InventoryItem[]
}

// Search inventory items
export async function searchInventory(query: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (
        id,
        name,
        sku,
        image_url,
        price
      )
    `)
    .or(`products.name.ilike.%${query}%,products.sku.ilike.%${query}%`)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error searching inventory:', error)
    throw error
  }

  return data as InventoryItem[]
}

