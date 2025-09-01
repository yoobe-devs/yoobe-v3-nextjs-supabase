import { supabase } from '@/lib/supabase'

export interface BaseProduct {
  id: string
  name: string
  description?: string
  category_id?: string
  base_price: number
  base_points_cost: number
  image_url?: string
  specifications?: Record<string, any>
  status: string
  created_at: string
  updated_at: string
  product_categories?: {
    id: string
    name: string
    description?: string
    icon?: string
    color?: string
  }
}

export interface BaseProductCreateInput {
  name: string
  description?: string
  category_id?: string
  base_price: number
  base_points_cost: number
  image_url?: string
  specifications?: Record<string, any>
}

export interface BaseProductUpdateInput extends Partial<BaseProductCreateInput> {
  id: string
}

// Get all base products
export async function getBaseProducts() {
  const { data, error } = await supabase
    .from('base_products')
    .select(`
      *,
      product_categories (
        id,
        name,
        description,
        icon,
        color
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching base products:', error)
    throw error
  }

  return data as BaseProduct[]
}

// Get base product by ID
export async function getBaseProductById(id: string) {
  const { data, error } = await supabase
    .from('base_products')
    .select(`
      *,
      product_categories (
        id,
        name,
        description,
        icon,
        color
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching base product:', error)
    throw error
  }

  return data as BaseProduct
}

// Create new base product
export async function createBaseProduct(product: BaseProductCreateInput) {
  const { data, error } = await supabase
    .from('base_products')
    .insert({
      ...product,
      status: 'active'
    })
    .select(`
      *,
      product_categories (
        id,
        name,
        description,
        icon,
        color
      )
    `)
    .single()

  if (error) {
    console.error('Error creating base product:', error)
    throw error
  }

  return data as BaseProduct
}

// Update base product
export async function updateBaseProduct(product: BaseProductUpdateInput) {
  const { id, ...updateData } = product

  const { data, error } = await supabase
    .from('base_products')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      product_categories (
        id,
        name,
        description,
        icon,
        color
      )
    `)
    .single()

  if (error) {
    console.error('Error updating base product:', error)
    throw error
  }

  return data as BaseProduct
}

// Delete base product (soft delete)
export async function deleteBaseProduct(id: string) {
  const { error } = await supabase
    .from('base_products')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) {
    console.error('Error deleting base product:', error)
    throw error
  }

  return true
}

// Search base products
export async function searchBaseProducts(query: string) {
  const { data, error } = await supabase
    .from('base_products')
    .select(`
      *,
      product_categories (
        id,
        name,
        description,
        icon,
        color
      )
    `)
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching base products:', error)
    throw error
  }

  return data as BaseProduct[]
}
