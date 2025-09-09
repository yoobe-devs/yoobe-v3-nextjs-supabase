export function isResgateV2Enabled(): boolean {
  const v = process.env.RESGATE_V2_ENABLED
  return v === '1' || v === 'true'
}

export function parseIdempotencyKey(headers: Headers): string | null {
  const h = headers.get('Idempotency-Key') || headers.get('idempotency-key')
  return h ? h.trim() : null
}

