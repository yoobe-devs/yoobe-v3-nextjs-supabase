import { supabase } from '@/lib/supabase'

export interface ClientProduct {
  id: string
  client_id: string
  base_product_id: string
  name?: string
  description?: string
  price?: number
  final_sku: string
  ean_13?: string
  status: string
  stock_quantity: number
  margin_pct: number
  created_at: string
  updated_at: string
  base_products?: {
    id: string
    name: string
    description?: string
    base_price: number
    sku?: string | null
    image_url?: string | null
    specifications?: Record<string, any>
  }
  client_pricing_tiers?: ClientPricingTier[]
  client_product_images?: ClientProductImage[]
}

export interface ClientProductImage {
  id: string
  client_product_id: string
  image_url: string
  bucket_key?: string
  is_cover: boolean
  sort_order: number
  created_at: string
}

export interface ClientPricingTier {
  id: string
  client_product_id: string
  min_qty: number
  unit_price?: number
  discount_pct?: number
  created_at: string
}

export interface ClientProductCreateInput {
  client_id: string
  base_product_id: string
  name?: string
  description?: string
  price?: number
  final_sku?: string
  ean_13?: string
  status?: string
  stock_quantity?: number
  margin_pct?: number
}

export interface ClientProductUpdateInput extends Partial<ClientProductCreateInput> {
  id: string
}

export async function getClientProducts(clientId: string) {
  const { data, error } = await supabase
    .from('client_products')
    .select(`
      *,
      base_products (
        id, name, description, base_price, sku, image_url, specifications
      ),
      client_pricing_tiers (*),
      client_product_images (*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ClientProduct[]
}

export async function getClientProductById(id: string) {
  const { data, error } = await supabase
    .from('client_products')
    .select(`
      *,
      base_products (
        id, name, description, base_price, sku, image_url, specifications
      ),
      client_pricing_tiers (*),
      client_product_images (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ClientProduct
}

export async function createClientProduct(input: ClientProductCreateInput) {
  // Buscar o produto base para calcular preço, se necessário
  const { data: base, error: baseErr } = await supabase
    .from('base_products')
    .select('*')
    .eq('id', input.base_product_id)
    .single()
  if (baseErr || !base) throw baseErr || new Error('Base product not found')

  const price = input.price ?? Number((base.base_price * (1 + (input.margin_pct ?? 0) / 100)).toFixed(2))

  const { data, error } = await supabase
    .from('client_products')
    .insert({
      client_id: input.client_id,
      base_product_id: input.base_product_id,
      name: input.name ?? base.name,
      description: input.description ?? base.description,
      price,
      final_sku: input.final_sku ?? null,
      ean_13: input.ean_13 ?? null,
      status: input.status ?? 'active',
      stock_quantity: input.stock_quantity ?? 0,
      margin_pct: input.margin_pct ?? 0
    })
    .select('*')
    .single()

  if (error) throw error
  return data as ClientProduct
}

export async function updateClientProduct(input: ClientProductUpdateInput) {
  const { id, ...update } = input
  const { data, error } = await supabase
    .from('client_products')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as ClientProduct
}

export async function deleteClientProduct(id: string) {
  const { error } = await supabase
    .from('client_products')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

export async function getClientProductPricing(productId: string, quantity: number) {
  const { data, error } = await supabase
    .from('client_pricing_tiers')
    .select('*')
    .eq('client_product_id', productId)
    .lte('min_qty', quantity)
    .order('min_qty', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data ?? null) as ClientPricingTier | null
}

export async function calculateClientProductPrice(productId: string, quantity: number) {
  const product = await getClientProductById(productId)
  const tier = await getClientProductPricing(productId, quantity)
  let unitPrice = product.price ?? product.base_products?.base_price ?? 0
  if (tier) {
    if (tier.unit_price) unitPrice = tier.unit_price
    else if (tier.discount_pct) unitPrice = Number((unitPrice * (1 - tier.discount_pct / 100)).toFixed(2))
  }
  return { unitPrice, totalPrice: Number((unitPrice * quantity).toFixed(2)), pricingTier: tier }
}


