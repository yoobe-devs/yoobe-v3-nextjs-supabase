import { NextRequest, NextResponse } from 'next/server'
import { isAuthXEnabled } from './feature'

type Handler = (req: NextRequest, ctx?: any) => Promise<NextResponse> | NextResponse

export function withAuthX(handler: Handler): Handler {
  return async (req: NextRequest, ctx?: any) => {
    if (!isAuthXEnabled()) {
      return NextResponse.json({ error: 'AuthX disabled' }, { status: 404 })
    }
    // TODO: validar sessão/token, injetar user/tenant no contexto
    return handler(req, ctx)
  }
}

