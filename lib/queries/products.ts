import { supabase } from '@/lib/supabase'
import { apiFetch } from '@/lib/api'

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

function isApiMode() {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL)
}

function mapStorefrontProduct(p: any): Product {
  const attrs = p?.attributes || {}
  const now = new Date().toISOString()
  const normalizedPrice = (() => {
    const raw = attrs.price ?? attrs.display_price
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
      const num = Number(raw.replace(/[^0-9.,-]/g, '').replace(',', '.'))
      return isNaN(num) ? 0 : num
    }
    return 0
  })()
  return {
    id: String(p?.id ?? attrs.id ?? Math.random().toString(36).slice(2)),
    name: String(attrs.name ?? 'Produto'),
    description: attrs.description ?? undefined,
    price: normalizedPrice,
    image_url: undefined,
    country: 'Brasil',
    sku: attrs.sku ?? undefined,
    claim_methods: Array.isArray(attrs.claim_methods) ? attrs.claim_methods : [],
    status: (attrs.available_on ? 'active' : 'inactive'),
    category_id: undefined,
    created_at: attrs.created_at ?? now,
    updated_at: attrs.updated_at ?? now,
  }
}

// Get all products
export async function getProducts() {
  if (isApiMode()) {
    const resp = await apiFetch<any>('/api/v2/storefront/products', {
      query: { sort: '-created_at' },
    })
    const list = Array.isArray(resp?.data) ? resp.data.map(mapStorefrontProduct) : []
    return list as Product[]
  }

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
  if (isApiMode()) {
    const resp = await apiFetch<any>(`/api/v2/storefront/products/${id}`)
    const prod = resp?.data ? mapStorefrontProduct(resp.data) : null
    if (!prod) throw new Error('Produto não encontrado')
    return prod
  }

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
  if (isApiMode()) {
    // Adjust this endpoint to your admin API if available
    const resp = await apiFetch<any>('/api/v1/products', {
      method: 'POST',
      body: product,
    })
    if (resp?.data) return mapStorefrontProduct(resp.data)
    return {
      id: String(resp?.id ?? Math.random().toString(36).slice(2)),
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      country: product.country || 'Brasil',
      sku: product.sku,
      claim_methods: product.claim_methods || [],
      status: 'active',
      category_id: product.category_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

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
  if (isApiMode()) {
    const resp = await apiFetch<any>(`/api/v1/products/${id}`, {
      method: 'PUT',
      body: updateData,
    })
    return resp?.data ? mapStorefrontProduct(resp.data) : { ...updateData, id } as unknown as Product
  }

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
  if (isApiMode()) {
    await apiFetch(`/api/v1/products/${id}`, { method: 'DELETE' })
    return true
  }

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
  if (isApiMode()) {
    const resp = await apiFetch<any>('/api/v2/storefront/products', {
      query: { 'filter[name_cont]': query, sort: '-created_at' },
    })
    const list = Array.isArray(resp?.data) ? resp.data.map(mapStorefrontProduct) : []
    return list as Product[]
  }

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


