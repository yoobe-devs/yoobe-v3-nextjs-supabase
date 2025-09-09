// Utilities to integrate Workvivo via generic OIDC using `openid-client`.
// Note: Uses dynamic import so the project builds even without the dependency installed when SSO is disabled.

let cachedClient: any | null = null

export async function getWorkvivoClient(): Promise<any> {
  if (cachedClient) return cachedClient

  const issuerUrl = process.env.WORKVIVO_OIDC_ISSUER
  const clientId = process.env.WORKVIVO_OIDC_CLIENT_ID
  const clientSecret = process.env.WORKVIVO_OIDC_CLIENT_SECRET
  const redirectUri = process.env.WORKVIVO_OIDC_REDIRECT_URI

  if (!issuerUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Workvivo OIDC env vars: WORKVIVO_OIDC_ISSUER, WORKVIVO_OIDC_CLIENT_ID, WORKVIVO_OIDC_CLIENT_SECRET, WORKVIVO_OIDC_REDIRECT_URI')
  }

  // Dynamic import to avoid SSR issues if package is missing during scaffold
  const { Issuer } = await import('openid-client')
  const issuer: any = await Issuer.discover(issuerUrl)

  cachedClient = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_basic',
  })

  return cachedClient
}

export async function generatePkce() {
  const { generators } = await import('openid-client')
  const codeVerifier = generators.codeVerifier()
  const codeChallenge = generators.codeChallenge(codeVerifier)
  return { codeVerifier, codeChallenge }
}

export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  }
}
