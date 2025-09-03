import { NextRequest, NextResponse } from 'next/server'
import { PaymentWebhookDTO } from '@/lib/validation'
import { processPaymentWebhook } from '@/lib/payments'
import { audit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    // Validate webhook signature (implement based on your provider)
    const signature = req.headers.get('x-signature') || req.headers.get('x-webhook-signature')
    if (!signature) {
      console.warn('Webhook sem assinatura recebido')
      // In production, you should validate the signature
      // For now, we'll proceed but log a warning
    }
    
    const body = await req.json()
    const webhook = PaymentWebhookDTO.parse(body)
    
    // Process the webhook
    const payment = await processPaymentWebhook(webhook)
    
    // Log successful webhook processing
    await audit('payment_webhook_success', 'webhooks', 'system', undefined, {
      externalId: webhook.externalId,
      status: webhook.status,
      amount: webhook.amount,
      provider: 'external'
    })
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Webhook processado com sucesso',
        paymentId: payment.id,
        status: payment.status
      }
    })
    
  } catch (error: any) {
    const message = error?.message || 'Erro interno do servidor'
    
    // Log webhook error
    try {
      await audit('payment_webhook_error', 'webhooks', 'system', undefined, {
        error: message,
        body: await req.text().catch(() => 'Unable to read body'),
        headers: Object.fromEntries(req.headers.entries())
      })
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }
    
    // Return error response
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 400 })
  }
}

// Handle GET requests (for webhook verification)
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint ativo',
    timestamp: new Date().toISOString()
  })
}
