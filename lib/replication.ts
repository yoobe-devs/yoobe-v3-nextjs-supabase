import { createClient } from '@supabase/supabase-js'
import { audit } from './audit'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export interface ReplicationJob {
  id: string
  quoteId: string
  companyId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error?: string
  createdAt: string
  updatedAt: string
}

export interface ReplicationResult {
  success: boolean
  replicatedProducts: number
  errors: string[]
  metadata: Record<string, any>
}

/**
 * Process a single replication job
 */
export async function processReplicationJob(jobId: string): Promise<ReplicationResult> {
  try {
    // Get job details
    const { data: job, error: jobError } = await service
      .from('product_replications')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (jobError || !job) {
      throw new Error(`Job não encontrado: ${jobId}`)
    }
    
    // Update status to processing
    await service
      .from('product_replications')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', jobId)
    
    // Get quote details with items
    const { data: quote, error: quoteError } = await service
      .from('quotes')
      .select(`
        *,
        quote_items (
          *,
          products (*)
        )
      `)
      .eq('id', job.quoteId)
      .single()
    
    if (quoteError || !quote) {
      throw new Error(`Orçamento não encontrado: ${job.quoteId}`)
    }
    
    const replicatedProducts: string[] = []
    const errors: string[] = []
    
    // Process each product in the quote
    for (const item of quote.quote_items || []) {
      try {
        const product = item.products
        if (!product) {
          errors.push(`Produto não encontrado para item: ${item.id}`)
          continue
        }
        
        // Replicate product to company's catalog
        const { data: replicatedProduct, error: replicateError } = await service
          .from('company_products') // Assuming this table exists for company-specific products
          .upsert({
            company_id: job.companyId,
            base_product_id: product.id,
            name: product.name,
            description: product.description,
            sku: `${product.sku}-${job.companyId.slice(0, 8)}`,
            points: product.points,
            price: product.price,
            active: true,
            replicated_from_quote: job.quoteId,
            replicated_at: new Date().toISOString()
          }, {
            onConflict: 'company_id,base_product_id'
          })
          .select()
          .single()
        
        if (replicateError) {
          errors.push(`Erro ao replicar produto ${product.name}: ${replicateError.message}`)
        } else {
          replicatedProducts.push(replicatedProduct.id)
        }
        
      } catch (itemError) {
        errors.push(`Erro ao processar item ${item.id}: ${itemError instanceof Error ? itemError.message : 'Erro desconhecido'}`)
      }
    }
    
    // Update job status
    const finalStatus = errors.length === 0 ? 'completed' : 'failed'
    const errorMessage = errors.length > 0 ? errors.join('; ') : undefined
    
    await service
      .from('product_replications')
      .update({ 
        status: finalStatus, 
        error: errorMessage,
        updated_at: new Date().toISOString() 
      })
      .eq('id', jobId)
    
    // Log audit
    await audit(
      'replication_completed',
      'product_replications',
      jobId,
      {
        quoteId: job.quoteId,
        companyId: job.companyId,
        status: finalStatus,
        replicatedProducts: replicatedProducts.length,
        errors: errors.length
      }
    )
    
    return {
      success: finalStatus === 'completed',
      replicatedProducts: replicatedProducts.length,
      errors,
      metadata: {
        quoteId: job.quoteId,
        companyId: job.companyId,
        totalItems: quote.quote_items?.length || 0
      }
    }
    
  } catch (error) {
    // Update job status to failed
    await service
      .from('product_replications')
      .update({ 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        updated_at: new Date().toISOString() 
      })
      .eq('id', jobId)
    
    // Log audit
    await audit(
      'replication_failed',
      'product_replications',
      jobId,
      {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    )
    
    return {
      success: false,
      replicatedProducts: 0,
      errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
      metadata: {}
    }
  }
}

/**
 * Process all queued replication jobs
 */
export async function processAllQueuedReplications(): Promise<{
  processed: number
  successful: number
  failed: number
  results: ReplicationResult[]
}> {
  try {
    // Get all queued jobs
    const { data: queuedJobs, error: fetchError } = await service
      .from('product_replications')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
    
    if (fetchError) {
      throw new Error(`Erro ao buscar jobs em fila: ${fetchError.message}`)
    }
    
    if (!queuedJobs || queuedJobs.length === 0) {
      return { processed: 0, successful: 0, failed: 0, results: [] }
    }
    
    const results: ReplicationResult[] = []
    let successful = 0
    let failed = 0
    
    // Process each job
    for (const job of queuedJobs) {
      const result = await processReplicationJob(job.id)
      results.push(result)
      
      if (result.success) {
        successful++
      } else {
        failed++
      }
    }
    
    // Log summary
    await audit(
      'replication_batch_completed',
      'system',
      undefined,
      {
        totalProcessed: queuedJobs.length,
        successful,
        failed,
        timestamp: new Date().toISOString()
      }
    )
    
    return {
      processed: queuedJobs.length,
      successful,
      failed,
      results
    }
    
  } catch (error) {
    // Log error
    await audit(
      'replication_batch_failed',
      'system',
      undefined,
      {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }
    )
    
    throw error
  }
}

/**
 * Get replication statistics
 */
export async function getReplicationStats(): Promise<{
  total: number
  queued: number
  processing: number
  completed: number
  failed: number
}> {
  const { data, error } = await service
    .from('product_replications')
    .select('status')
  
  if (error) {
    throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
  }
  
  const stats = {
    total: data?.length || 0,
    queued: data?.filter(item => item.status === 'queued').length || 0,
    processing: data?.filter(item => item.status === 'processing').length || 0,
    completed: data?.filter(item => item.status === 'completed').length || 0,
    failed: data?.filter(item => item.status === 'failed').length || 0
  }
  
  return stats
}

/**
 * Retry failed replication
 */
export async function retryFailedReplication(jobId: string): Promise<ReplicationResult> {
  // Reset job status to queued
  await service
    .from('product_replications')
    .update({ 
      status: 'queued', 
      error: null,
      updated_at: new Date().toISOString() 
    })
    .eq('id', jobId)
  
  // Process the job
  return await processReplicationJob(jobId)
}

/**
 * Clean up old completed replications (optional maintenance)
 */
export async function cleanupOldReplications(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const { data, error } = await service
    .from('product_replications')
    .delete()
    .eq('status', 'completed')
    .lt('updated_at', cutoffDate.toISOString())
    .select('id')
  
  if (error) {
    throw new Error(`Erro ao limpar replications antigas: ${error.message}`)
  }
  
  return data?.length || 0
}
