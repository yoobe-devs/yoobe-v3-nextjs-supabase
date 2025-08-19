import { supabase } from '@/lib/supabase'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  country: string
  sku?: string
  claim_methods: string[]
  status: string
  category_id?: string
  created_at: string
  updated_at: string
}

export interface ProductCreateInput {
  name: string
  description?: string
  price: number
  image_url?: string
  country?: string
  sku?: string
  claim_methods?: string[]
  category_id?: string
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: string
}

// Get all products
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return data as Product[]
}

// Get product by ID
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    throw error
  }

  return data as Product
}

// Create new product
export async function createProduct(product: ProductCreateInput) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      claim_methods: product.claim_methods || [],
      country: product.country || 'Brasil',
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    throw error
  }

  return data as Product
}

// Update product
export async function updateProduct(product: ProductUpdateInput) {
  const { id, ...updateData } = product
  
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    throw error
  }

  return data as Product
}

// Delete product (soft delete)
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    throw error
  }

  return true
}

// Search products
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching products:', error)
    throw error
  }

  return data as Product[]
}

