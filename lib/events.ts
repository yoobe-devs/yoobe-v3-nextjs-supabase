import { createClient } from '@supabase/supabase-js'
import { audit } from './audit'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export interface CheckoutEvent {
  id: string
  sessionId: string
  userId: string
  event: string
  payload: Record<string, any>
  createdAt: string
}

export type CheckoutEventType = 
  | 'checkout_started'
  | 'payment_method_selected'
  | 'address_updated'
  | 'payment_processed'
  | 'payment_failed'
  | 'checkout_completed'
  | 'checkout_abandoned'
  | 'shipment_queued'
  | 'nfe_requested'
  | 'cart_modified'

/**
 * Log checkout event
 */
export async function logCheckoutEvent(
  sessionId: string,
  userId: string,
  event: CheckoutEventType,
  payload?: Record<string, any>
): Promise<CheckoutEvent> {
  const { data, error } = await service
    .from('checkout_events')
    .insert({
      session_id: sessionId,
      user_id: userId,
      event,
      payload: payload || {}
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Erro ao registrar evento: ${error.message}`)
  }
  
  // Also log to audit system
  await audit(
    `checkout_${event}`,
    'checkout_sessions',
    userId,
    sessionId,
    {
      event,
      payload
    }
  )
  
  return data
}

/**
 * Get checkout events for a session
 */
export async function getCheckoutEvents(sessionId: string): Promise<CheckoutEvent[]> {
  const { data, error } = await service
    .from('checkout_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (error) return []
  return data || []
}

/**
 * Get checkout events for a user
 */
export async function getUserCheckoutEvents(userId: string, limit: number = 50): Promise<CheckoutEvent[]> {
  const { data, error } = await service
    .from('checkout_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) return []
  return data || []
}

/**
 * Track checkout funnel
 */
export async function trackCheckoutFunnel(sessionId: string, step: string, metadata?: Record<string, any>): Promise<void> {
  await logCheckoutEvent(
    sessionId,
    'system', // System event
    'checkout_step_completed' as CheckoutEventType,
    {
      step,
      metadata,
      timestamp: new Date().toISOString()
    }
  )
}

/**
 * Track payment attempt
 */
export async function trackPaymentAttempt(
  sessionId: string,
  userId: string,
  method: string,
  amount: number,
  success: boolean,
  error?: string
): Promise<void> {
  await logCheckoutEvent(
    sessionId,
    userId,
    success ? 'payment_processed' : 'payment_failed',
    {
      method,
      amount,
      error,
      timestamp: new Date().toISOString()
    }
  )
}

/**
 * Track address creation/update during checkout
 */
export async function trackAddressUpdate(
  sessionId: string,
  userId: string,
  addressId: string,
  action: 'created' | 'updated' | 'selected',
  address: Record<string, any>
): Promise<void> {
  await logCheckoutEvent(
    sessionId,
    userId,
    'address_updated',
    {
      addressId,
      action,
      address,
      timestamp: new Date().toISOString()
    }
  )
}

/**
 * Track cart modifications
 */
export async function trackCartModification(
  sessionId: string,
  userId: string,
  action: 'item_added' | 'item_removed' | 'quantity_changed' | 'cart_cleared',
  productId?: string,
  quantity?: number,
  metadata?: Record<string, any>
): Promise<void> {
  await logCheckoutEvent(
    sessionId,
    userId,
    'cart_modified',
    {
      action,
      productId,
      quantity,
      metadata,
      timestamp: new Date().toISOString()
    }
  )
}

/**
 * Get checkout analytics
 */
export async function getCheckoutAnalytics(companyId?: string, days: number = 30): Promise<{
  totalSessions: number
  completedSessions: number
  abandonedSessions: number
  conversionRate: number
  averageOrderValue: number
  topPaymentMethods: Array<{ method: string; count: number }>
  funnelSteps: Record<string, number>
}> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  let query = service
    .from('checkout_sessions')
    .select('*')
    .gte('created_at', cutoffDate.toISOString())
  
  if (companyId) {
    query = query.eq('company_id', companyId)
  }
  
  const { data: sessions, error: sessionsError } = await query
  
  if (sessionsError) {
    throw new Error(`Erro ao buscar sessões: ${sessionsError.message}`)
  }
  
  const totalSessions = sessions?.length || 0
  const completedSessions = sessions?.filter(s => s.status === 'paid').length || 0
  const abandonedSessions = sessions?.filter(s => s.status === 'abandoned').length || 0
  
  // Calculate conversion rate
  const conversionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
  
  // Calculate average order value
  const totalAmount = sessions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
  const averageOrderValue = completedSessions > 0 ? totalAmount / completedSessions : 0
  
  // Get top payment methods
  const paymentMethodCounts: Record<string, number> = {}
  sessions?.forEach(session => {
    const method = session.payment_method || 'unknown'
    paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1
  })
  
  const topPaymentMethods = Object.entries(paymentMethodCounts)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // Get funnel steps
  const funnelSteps: Record<string, number> = {}
  for (const session of sessions || []) {
    const events = await getCheckoutEvents(session.id)
    for (const event of events) {
      funnelSteps[event.event] = (funnelSteps[event.event] || 0) + 1
    }
  }
  
  return {
    totalSessions,
    completedSessions,
    abandonedSessions,
    conversionRate,
    averageOrderValue,
    topPaymentMethods,
    funnelSteps
  }
}

/**
 * Clean up old events (maintenance)
 */
export async function cleanupOldEvents(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const { data, error } = await service
    .from('checkout_events')
    .delete()
    .lt('created_at', cutoffDate.toISOString())
    .select('id')
  
  if (error) {
    throw new Error(`Erro ao limpar eventos antigos: ${error.message}`)
  }
  
  return data?.length || 0
}

/**
 * Export events for analytics
 */
export async function exportEventsForAnalytics(
  startDate: Date,
  endDate: Date,
  eventTypes?: CheckoutEventType[]
): Promise<CheckoutEvent[]> {
  let query = service
    .from('checkout_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })
  
  if (eventTypes && eventTypes.length > 0) {
    query = query.in('event', eventTypes)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Erro ao exportar eventos: ${error.message}`)
  }
  
  return data || []
}
