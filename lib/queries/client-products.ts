import { supabase } from '@/lib/supabase'

export interface ClientProduct {
  id: string
  client_id: string
  base_product_id?: string
  name: string
  description?: string
  price: number
  points_cost: number
  category_id?: string
  image_url?: string
  is_active: boolean
  status: string
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface ClientProductCreateInput {
  client_id: string
  base_product_id?: string
  name: string
  description?: string
  price: number
  points_cost?: number
  category_id?: string
  image_url?: string
  is_active?: boolean
  status?: string
  stock_quantity?: number
}

export async function getClientProducts(
  clientId: string
): Promise<ClientProduct[]> {
  try {
    const { data, error } = await supabase
      .from('client_products')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar produtos do cliente:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro em getClientProducts:', error)
    throw error
  }
}

export async function createClientProduct(
  input: ClientProductCreateInput
): Promise<ClientProduct> {
  try {
    const { data, error } = await supabase
      .from('client_products')
      .insert({
        ...input,
        is_active: input.is_active ?? true,
        status: input.status ?? 'active',
        points_cost: input.points_cost ?? 0,
        stock_quantity: input.stock_quantity ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao criar produto do cliente:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro em createClientProduct:', error)
    throw error
  }
}

export async function calculateClientProductPrice(
  productId: string,
  quantity: number = 1
): Promise<{
  product_id: string
  unit_price: number
  quantity: number
  total_price: number
  points_cost: number
  total_points: number
}> {
  try {
    const { data: product, error } = await supabase
      .from('client_products')
      .select('id, price, points_cost')
      .eq('id', productId)
      .single()

    if (error || !product) {
      throw new Error('Produto não encontrado')
    }

    const unitPrice = product.price || 0
    const pointsCost = product.points_cost || 0
    const totalPrice = unitPrice * quantity
    const totalPoints = pointsCost * quantity

    return {
      product_id: productId,
      unit_price: unitPrice,
      quantity,
      total_price: totalPrice,
      points_cost: pointsCost,
      total_points: totalPoints,
    }
  } catch (error) {
    console.error('Erro em calculateClientProductPrice:', error)
    throw error
  }
}







