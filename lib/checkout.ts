import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function createCheckoutFromCart(userId: string, companyId: string | undefined, paymentMethod: string, shipping: any, billing: any, meta?: Record<string, any>) {
  const { data, error } = await service.rpc('create_checkout_from_cart', {
    p_user: userId,
    p_company: companyId || null,
    p_method: paymentMethod,
    p_shipping: shipping || {},
    p_billing: billing || {},
    p_meta: meta || {}
  })
  if (error) throw error
  return data as string
}

export async function logCheckoutEvent(sessionId: string, userId: string, event: string, payload?: Record<string, any>) {
  const { error } = await service.rpc('log_checkout_event', { p_session: sessionId, p_user: userId, p_event: event, p_payload: payload || {} })
  if (error) throw error
}





