// Workvivo Points API scaffolding
// This client centralizes balance/award/reverse calls and supports a mock mode via WORKVIVO_MOCK=1

type IdentifierType = 'email' | 'sub' | 'employeeId'

export type AwardRequest = {
  identifier: string
  identifierType: IdentifierType
  amount: number
  reason?: string
  idempotencyKey: string
  metadata?: Record<string, any>
}

export type ReverseRequest = {
  identifier?: string
  identifierType?: IdentifierType
  amount?: number
  reason?: string
  idempotencyKey?: string
  transactionId?: string
}

export class WorkvivoApi {
  private baseUrl: string
  private clientId?: string
  private clientSecret?: string
  private tokenUrl?: string
  private scopes?: string
  private static cachedToken: { accessToken: string; expiresAt: number } | null = null

  constructor() {
    this.baseUrl = process.env.WORKVIVO_API_BASE || 'https://api.workvivo.com'
    this.clientId = process.env.WORKVIVO_CLIENT_ID
    this.clientSecret = process.env.WORKVIVO_CLIENT_SECRET
    this.tokenUrl = process.env.WORKVIVO_TOKEN_URL
    this.scopes = process.env.WORKVIVO_SCOPES || 'points.read points.write users.read'
  }

  private mockEnabled() {
    return process.env.WORKVIVO_MOCK === '1'
  }

  private async getAccessToken(): Promise<string> {
    if (this.mockEnabled()) return 'mock-token'
    if (!this.clientId || !this.clientSecret || !this.tokenUrl) {
      throw new Error('Missing Workvivo OAuth credentials (WORKVIVO_CLIENT_ID/SECRET, WORKVIVO_TOKEN_URL)')
    }
    const now = Math.floor(Date.now() / 1000)
    if (WorkvivoApi.cachedToken && WorkvivoApi.cachedToken.expiresAt > now + 30) {
      return WorkvivoApi.cachedToken.accessToken
    }
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: this.scopes!,
    })
    const res = await fetch(this.tokenUrl!, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) {
      throw new Error(`Workvivo token error: ${res.status}`)
    }
    const json: any = await res.json()
    WorkvivoApi.cachedToken = {
      accessToken: json.access_token,
      expiresAt: now + (json.expires_in || 3600),
    }
    return WorkvivoApi.cachedToken.accessToken
  }

  async getBalance(identifier: string, identifierType: IdentifierType) {
    if (this.mockEnabled()) {
      return { identifier, identifierType, balance: 1234, currency: 'PTS', updatedAt: new Date().toISOString() }
    }
    const token = await getSafeToken(async () => this.getAccessToken())
    const url = `${this.baseUrl}/v1/points/balance?identifier=${encodeURIComponent(identifier)}&type=${identifierType}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Workvivo balance error: ${res.status}`)
    return await res.json()
  }

  async awardPoints(req: AwardRequest) {
    if (this.mockEnabled()) {
      return {
        status: 'ok',
        transactionId: `mock-${req.idempotencyKey}`,
        amount: req.amount,
        reason: req.reason ?? 'award',
      }
    }
    const token = await getSafeToken(async () => this.getAccessToken())
    const url = `${this.baseUrl}/v1/points/award`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}`, 'Idempotency-Key': req.idempotencyKey },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(`Workvivo award error: ${res.status}`)
    return await res.json()
  }

  async reversePoints(req: ReverseRequest) {
    if (this.mockEnabled()) {
      return {
        status: 'ok',
        reversed: true,
        transactionId: req.transactionId || `mock-rev-${req.idempotencyKey}`,
      }
    }
    const token = await getSafeToken(async () => this.getAccessToken())
    const url = `${this.baseUrl}/v1/points/reverse`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(`Workvivo reverse error: ${res.status}`)
    return await res.json()
  }
}

async function getSafeToken(fn: () => Promise<string>) {
  try {
    return await fn()
  } catch (e) {
    // reset cache and retry once
    ;(WorkvivoApi as any).cachedToken = null
    return await fn()
  }
}

