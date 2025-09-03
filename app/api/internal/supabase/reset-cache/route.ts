import { NextRequest, NextResponse } from 'next/server'

// Placeholder endpoint used by CI/CD to "reset" Supabase API cache.
// In production, point SUPABASE_RESET_CACHE_WEBHOOK to a real endpoint.

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SUPABASE_RESET_CACHE_SECRET || ''
    if (secret) {
      const auth = req.headers.get('authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.substring(7) : ''
      if (token !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    // No-op: just return success so pipelines can proceed
    return NextResponse.json({ ok: true, message: 'Cache reset placeholder' })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Cache reset placeholder' })
}

