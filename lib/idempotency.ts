import crypto from 'crypto'

/**
 * Gera uma chave de idempotência única
 */
export function generateIdempotencyKey(prefix: string = 'req'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const hash = crypto
    .createHash('md5')
    .update(`${prefix}_${timestamp}_${random}`)
    .digest('hex')
  return `${prefix}_${timestamp}_${hash.substring(0, 8)}`
}

/**
 * Valida se uma chave de idempotência tem formato válido
 */
export function validateIdempotencyKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false
  }

  // Verificar se tem pelo menos 20 caracteres
  if (key.length < 20) {
    return false
  }

  // Verificar se contém underscore (formato esperado)
  if (!key.includes('_')) {
    return false
  }

  return true
}

/**
 * Gera uma chave de idempotência para um usuário específico
 */
export function generateUserIdempotencyKey(
  userId: string,
  action: string
): string {
  const timestamp = Date.now()
  const hash = crypto
    .createHash('md5')
    .update(`${userId}_${action}_${timestamp}`)
    .digest('hex')
  return `user_${userId}_${action}_${timestamp}_${hash.substring(0, 8)}`
}

/**
 * Gera uma chave de idempotência para uma transação
 */
export function generateTransactionIdempotencyKey(
  userId: string,
  productId: string,
  qty: number
): string {
  const timestamp = Date.now()
  const hash = crypto
    .createHash('md5')
    .update(`${userId}_${productId}_${qty}_${timestamp}`)
    .digest('hex')
  return `txn_${userId}_${productId}_${qty}_${timestamp}_${hash.substring(0, 8)}`
}

/**
 * Gera uma chave de idempotência para webhook
 */
export function generateWebhookIdempotencyKey(
  provider: string,
  eventType: string,
  userId: string,
  timestamp?: number
): string {
  const ts = timestamp || Date.now()
  const hash = crypto
    .createHash('md5')
    .update(`${provider}_${eventType}_${userId}_${ts}`)
    .digest('hex')
  return `webhook_${provider}_${eventType}_${userId}_${ts}_${hash.substring(0, 8)}`
}

/**
 * Extrai informações de uma chave de idempotência
 */
export function parseIdempotencyKey(key: string): {
  type: string
  timestamp: number
  hash: string
  parts: string[]
} {
  const parts = key.split('_')
  const timestamp = parseInt(parts[parts.length - 2]) || 0
  const hash = parts[parts.length - 1] || ''
  const type = parts[0] || 'unknown'

  return {
    type,
    timestamp,
    hash,
    parts,
  }
}

/**
 * Verifica se uma chave de idempotência expirou
 */
export function isIdempotencyKeyExpired(
  key: string,
  maxAgeMs: number = 24 * 60 * 60 * 1000
): boolean {
  try {
    const { timestamp } = parseIdempotencyKey(key)
    const now = Date.now()
    return now - timestamp > maxAgeMs
  } catch {
    return true // Se não conseguir parsear, considerar expirada
  }
}

/**
 * Gera uma chave de idempotência para auditoria
 */
export function generateAuditIdempotencyKey(
  action: string,
  tableName: string,
  recordId: string
): string {
  const timestamp = Date.now()
  const hash = crypto
    .createHash('md5')
    .update(`${action}_${tableName}_${recordId}_${timestamp}`)
    .digest('hex')
  return `audit_${action}_${tableName}_${recordId}_${timestamp}_${hash.substring(0, 8)}`
}
