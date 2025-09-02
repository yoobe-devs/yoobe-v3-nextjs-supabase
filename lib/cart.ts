import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function getOrCreateCart(userId: string, companyId?: string) {
  const { data, error } = await service.rpc('get_or_create_cart', { p_user: userId, p_company: companyId || null })
  if (error) throw error
  return data as string
}

export async function addToCart(userId: string, productId: string, quantity: number, unitPrice: number, points: number, metadata?: Record<string, any>) {
  const { error } = await service.rpc('add_to_cart', {
    p_user: userId,
    p_product: productId,
    p_qty: quantity,
    p_unit: unitPrice,
    p_points: points,
    p_meta: metadata || {}
  })
  if (error) throw error
}

export async function clearCart(userId: string) {
  const { error } = await service.rpc('clear_cart', { p_user: userId })
  if (error) throw error
}

export async function getCart(userId: string) {
  // resolve cart id and items snapshot
  const cartId = await getOrCreateCart(userId)
  const { data: items, error } = await service.from('cart_items').select('*').eq('cart_id', cartId)
  if (error) throw error
  const total = (items || []).reduce((sum: number, it: any) => sum + it.quantity * Number(it.unit_price || 0), 0)
  const points = (items || []).reduce((sum: number, it: any) => sum + it.quantity * Number(it.points || 0), 0)
  return {
    items: (items || []).map(it => ({ productId: it.product_id, qty: it.quantity, unitPrice: Number(it.unit_price || 0), points: it.points, metadata: it.metadata || {} })),
    total, points, cartId
  }
}


