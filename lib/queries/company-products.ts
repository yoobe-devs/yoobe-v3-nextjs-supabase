import { supabase } from '@/lib/supabase'

export interface CompanyProduct {
  id: string
  company_id: string
  base_product_id: string
  name?: string
  description?: string
  price?: number
  points_cost?: number
  final_sku: string
  ean_13?: string
  status: string
  stock_quantity: number
  margin_pct: number
  is_active: boolean
  created_at: string
  updated_at: string
  base_products?: {
    id: string
    name: string
    description?: string
    base_price: number
    base_points_cost?: number
    sku?: string | null
    image_url?: string | null
    specifications?: Record<string, any>
  }
  company_pricing_tiers?: CompanyPricingTier[]
  company_product_images?: CompanyProductImage[]
}

export interface CompanyProductImage {
  id: string
  company_product_id: string
  image_url: string
  bucket_key?: string
  is_cover: boolean
  sort_order: number
  created_at: string
}

export interface CompanyPricingTier {
  id: string
  company_product_id: string
  min_qty: number
  unit_price?: number
  unit_points?: number
  discount_pct?: number
  created_at: string
}

export interface CompanyProductCreateInput {
  company_id: string
  base_product_id: string
  name?: string
  description?: string
  price?: number
  points_cost?: number
  final_sku?: string
  ean_13?: string
  status?: string
  stock_quantity?: number
  margin_pct?: number
  is_active?: boolean
}

export interface CompanyProductUpdateInput
  extends Partial<CompanyProductCreateInput> {
  id: string
}

export async function getCompanyProducts(companyId: string) {
  const { data, error } = await supabase
    .from('company_products')
    .select(
      `
      *,
      base_products (
        id, name, description, base_price, base_points_cost, sku, image_url, specifications
      ),
      company_pricing_tiers (*),
      company_product_images (*)
    `
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as CompanyProduct[]
}

export async function getCompanyProductById(id: string) {
  const { data, error } = await supabase
    .from('company_products')
    .select(
      `
      *,
      base_products (
        id, name, description, base_price, base_points_cost, sku, image_url, specifications
      ),
      company_pricing_tiers (*),
      company_product_images (*)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data as CompanyProduct
}

export async function createCompanyProduct(input: CompanyProductCreateInput) {
  // Buscar o produto base para calcular preço, se necessário
  const { data: base, error: baseErr } = await supabase
    .from('base_products')
    .select('*')
    .eq('id', input.base_product_id)
    .single()
  if (baseErr || !base) throw baseErr || new Error('Base product not found')

  const price =
    input.price ??
    Number((base.base_price * (1 + (input.margin_pct ?? 0) / 100)).toFixed(2))

  const points_cost =
    input.points_cost ??
    Number(
      (base.base_points_cost * (1 + (input.margin_pct ?? 0) / 100)).toFixed(0)
    )

  const { data, error } = await supabase
    .from('company_products')
    .insert({
      company_id: input.company_id,
      base_product_id: input.base_product_id,
      name: input.name ?? base.name,
      description: input.description ?? base.description,
      price,
      points_cost,
      final_sku: input.final_sku ?? null,
      ean_13: input.ean_13 ?? null,
      status: input.status ?? 'active',
      stock_quantity: input.stock_quantity ?? 0,
      margin_pct: input.margin_pct ?? 0,
      is_active: input.is_active ?? true,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as CompanyProduct
}

export async function updateCompanyProduct(input: CompanyProductUpdateInput) {
  const { id, ...update } = input
  const { data, error } = await supabase
    .from('company_products')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as CompanyProduct
}

export async function deleteCompanyProduct(id: string) {
  const { error } = await supabase
    .from('company_products')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

export async function getCompanyProductPricing(
  productId: string,
  quantity: number
) {
  const { data, error } = await supabase
    .from('company_pricing_tiers')
    .select('*')
    .eq('company_product_id', productId)
    .lte('min_qty', quantity)
    .order('min_qty', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data ?? null) as CompanyPricingTier | null
}

export async function calculateCompanyProductPrice(
  productId: string,
  quantity: number
) {
  const product = await getCompanyProductById(productId)
  const tier = await getCompanyProductPricing(productId, quantity)
  let unitPrice = product.price ?? product.base_products?.base_price ?? 0
  let unitPoints =
    product.points_cost ?? product.base_products?.base_points_cost ?? 0

  if (tier) {
    if (tier.unit_price) unitPrice = tier.unit_price
    else if (tier.discount_pct)
      unitPrice = Number((unitPrice * (1 - tier.discount_pct / 100)).toFixed(2))

    if (tier.unit_points) unitPoints = tier.unit_points
    else if (tier.discount_pct)
      unitPoints = Number(
        (unitPoints * (1 - tier.discount_pct / 100)).toFixed(0)
      )
  }

  return {
    unitPrice,
    unitPoints,
    totalPrice: Number((unitPrice * quantity).toFixed(2)),
    totalPoints: unitPoints * quantity,
    pricingTier: tier,
  }
}
