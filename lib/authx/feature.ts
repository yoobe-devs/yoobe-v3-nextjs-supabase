export function isAuthXEnabled(): boolean {
  const v = process.env.AUTHX_ENABLED
  return v === '1' || v === 'true'
}

