import { supabase } from '@/lib/supabase'

export interface GiftProduct {
  id: string
  shop_id?: string | null
  external_id?: string | null
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface GiftProductCreateInput {
  shop_id?: string
  external_id?: string
  name: string
  description?: string
  price: number
  image_url?: string
  status?: 'active' | 'inactive'
}

export interface GiftProductUpdateInput extends Partial<GiftProductCreateInput> {
  id: string
}

export async function listGiftProducts(): Promise<GiftProduct[]> {
  const { data, error } = await supabase
    .from('gift_products')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []) as GiftProduct[]
}

export async function getGiftProduct(id: string): Promise<GiftProduct> {
  const { data, error } = await supabase
    .from('gift_products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as GiftProduct
}

export async function createGiftProduct(input: GiftProductCreateInput): Promise<GiftProduct> {
  const { data, error } = await supabase
    .from('gift_products')
    .insert({
      ...input,
      status: input.status || 'active',
    })
    .select()
    .single()

  if (error) throw error
  return data as GiftProduct
}

export async function updateGiftProduct(input: GiftProductUpdateInput): Promise<GiftProduct> {
  const { id, ...update } = input
  const { data, error } = await supabase
    .from('gift_products')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as GiftProduct
}

export async function deleteGiftProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('gift_products')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}


