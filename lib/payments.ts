import { createClient } from '@supabase/supabase-js'
import { audit } from './audit'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export type PaymentMethod = 'points' | 'credit_card' | 'pix' | 'debit' | 'boleto' | 'donation'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Payment {
  id: string
  quoteId?: string
  redemptionId?: string
  method: PaymentMethod
  provider?: string
  externalId?: string
  status: PaymentStatus
  amount: number
  createdAt: string
  updatedAt: string
}

export interface PaymentWebhook {
  externalId: string
  status: PaymentStatus
  amount: number
  metadata?: Record<string, any>
}

/**
 * Create a new payment record
 */
export async function createPayment(paymentData: {
  quoteId?: string
  redemptionId?: string
  method: PaymentMethod
  provider?: string
  externalId?: string
  amount: number
}): Promise<Payment> {
  const { data, error } = await service
    .from('payments')
    .insert({
      quote_id: paymentData.quoteId,
      redemption_id: paymentData.redemptionId,
      method: paymentData.method,
      provider: paymentData.provider,
      external_id: paymentData.externalId,
      amount: paymentData.amount,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Erro ao criar pagamento: ${error.message}`)
  }
  
  // Log audit
  await audit(
    'payment_created',
    'payments',
    'system',
    data.id,
    {
      method: paymentData.method,
      amount: paymentData.amount,
      quoteId: paymentData.quoteId,
      redemptionId: paymentData.redemptionId
    }
  )
  
  return data
}

/**
 * Process payment webhook (for external providers)
 */
export async function processPaymentWebhook(webhook: PaymentWebhook): Promise<Payment> {
  try {
    // Find payment by external ID
    const { data: payment, error: fetchError } = await service
      .from('payments')
      .select('*')
      .eq('external_id', webhook.externalId)
      .single()
    
    if (fetchError || !payment) {
      throw new Error(`Pagamento não encontrado para external_id: ${webhook.externalId}`)
    }
    
    // Check if already processed
    if (payment.status === 'paid' || payment.status === 'failed') {
      console.log(`Pagamento ${webhook.externalId} já processado com status: ${payment.status}`)
      return payment
    }
    
    // Update payment status
    const { data: updatedPayment, error: updateError } = await service
      .from('payments')
      .update({ 
        status: webhook.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)
      .select()
      .single()
    
    if (updateError) {
      throw new Error(`Erro ao atualizar pagamento: ${updateError.message}`)
    }
    
    // If payment is successful and it's a quote payment, trigger replication
    if (webhook.status === 'paid' && payment.quote_id) {
      try {
        // Use the RPC function to process quote payment
        const { data: result, error: rpcError } = await service.rpc('process_quote_payment', {
          p_quote_id: payment.quote_id,
          p_payment_method: payment.method,
          p_provider: payment.provider || 'webhook',
          p_external_id: webhook.externalId
        })
        
        if (rpcError) {
          console.error('Erro ao processar pagamento do orçamento:', rpcError)
        }
      } catch (replicationError) {
        console.error('Erro ao disparar replicação:', replicationError)
      }
    }
    
    // Log audit
    await audit(
      'payment_webhook_processed',
      'payments',
      'system',
      payment.id,
      {
        externalId: webhook.externalId,
        status: webhook.status,
        amount: webhook.amount,
        metadata: webhook.metadata
      }
    )
    
    return updatedPayment
    
  } catch (error) {
    // Log error
    await audit(
      'payment_webhook_error',
      'payments',
      'system',
      undefined,
      {
        externalId: webhook.externalId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    )
    
    throw error
  }
}

/**
 * Process points payment (internal)
 */
export async function processPointsPayment(
  userId: string,
  amount: number,
  reason: string,
  quoteId?: string,
  redemptionId?: string
): Promise<Payment> {
  try {
    // Check user wallet balance
    const { data: wallet, error: walletError } = await service
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (walletError || !wallet) {
      throw new Error('Carteira não encontrada')
    }
    
    if (wallet.balance < amount) {
      throw new Error('Saldo insuficiente na carteira')
    }
    
    // Create payment record
    const payment = await createPayment({
      quoteId,
      redemptionId,
      method: 'points',
      amount,
      provider: 'internal'
    })
    
    // Deduct points from wallet
    const { error: debitError } = await service
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id)
    
    if (debitError) {
      throw new Error(`Erro ao debitar carteira: ${debitError.message}`)
    }
    
    // Record wallet transaction
    await service
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        delta: -amount,
        reason,
        related_order_id: quoteId || redemptionId
      })
    
    // Update payment status to paid
    const { data: updatedPayment, error: updateError } = await service
      .from('payments')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)
      .select()
      .single()
    
    if (updateError) {
      throw new Error(`Erro ao atualizar status do pagamento: ${updateError.message}`)
    }
    
    // If it's a quote payment, trigger replication
    if (quoteId) {
      try {
        const { data: result, error: rpcError } = await service.rpc('process_quote_payment', {
          p_quote_id: quoteId,
          p_payment_method: 'points',
          p_provider: 'internal',
          p_external_id: payment.id
        })
        
        if (rpcError) {
          console.error('Erro ao processar pagamento do orçamento:', rpcError)
        }
      } catch (replicationError) {
        console.error('Erro ao disparar replicação:', replicationError)
      }
    }
    
    // Log audit
    await audit(
      'points_payment_processed',
      'payments',
      'system',
      payment.id,
      {
        userId,
        amount,
        reason,
        quoteId,
        redemptionId
      }
    )
    
    return updatedPayment
    
  } catch (error) {
    // Log error
    await audit(
      'points_payment_error',
      'payments',
      'system',
      undefined,
      {
        userId,
        amount,
        reason,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    )
    
    throw error
  }
}

/**
 * Mock payment processing for development/testing
 */
export async function processMockPayment(
  paymentId: string,
  success: boolean = true
): Promise<Payment> {
  const { data: payment, error: fetchError } = await service
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()
  
  if (fetchError || !payment) {
    throw new Error(`Pagamento não encontrado: ${paymentId}`)
  }
  
  const status: PaymentStatus = success ? 'paid' : 'failed'
  
  // Update payment status
  const { data: updatedPayment, error: updateError } = await service
    .from('payments')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id)
    .select()
    .single()
  
  if (updateError) {
    throw new Error(`Erro ao atualizar pagamento: ${updateError.message}`)
  }
  
  // If successful and it's a quote payment, trigger replication
  if (success && payment.quote_id) {
    try {
      const { data: result, error: rpcError } = await service.rpc('process_quote_payment', {
        p_quote_id: payment.quote_id,
        p_payment_method: payment.method,
        p_provider: 'mock',
        p_external_id: payment.id
      })
      
      if (rpcError) {
        console.error('Erro ao processar pagamento do orçamento:', rpcError)
      }
    } catch (replicationError) {
      console.error('Erro ao disparar replicação:', replicationError)
    }
  }
  
  // Log audit
  await audit(
    'mock_payment_processed',
    'payments',
    'system',
    payment.id,
    {
      success,
      method: payment.method,
      amount: payment.amount
    }
  )
  
  return updatedPayment
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: string): Promise<Payment | null> {
  const { data, error } = await service
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()
  
  if (error) return null
  return data
}

/**
 * Get payments by quote ID
 */
export async function getPaymentsByQuote(quoteId: string): Promise<Payment[]> {
  const { data, error } = await service
    .from('payments')
    .select('*')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data || []
}

/**
 * Get payments by redemption ID
 */
export async function getPaymentsByRedemption(redemptionId: string): Promise<Payment[]> {
  const { data, error } = await service
    .from('payments')
    .select('*')
    .eq('redemption_id', redemptionId)
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data || []
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(): Promise<{
  total: number
  pending: number
  paid: number
  failed: number
  totalAmount: number
}> {
  const { data, error } = await service
    .from('payments')
    .select('status, amount')
  
  if (error) {
    throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
  }
  
  const stats = {
    total: data?.length || 0,
    pending: data?.filter(p => p.status === 'pending').length || 0,
    paid: data?.filter(p => p.status === 'paid').length || 0,
    failed: data?.filter(p => p.status === 'failed').length || 0,
    totalAmount: data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  }
  
  return stats
}
