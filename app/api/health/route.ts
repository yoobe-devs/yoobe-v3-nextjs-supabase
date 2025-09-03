import { NextResponse } from 'next/server'

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  let supabaseHealthy: boolean | undefined = undefined
  if (supabaseUrl) {
    try {
      const ctrl = new AbortController()
      const id = setTimeout(() => ctrl.abort(), 3000)
      const r = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, { signal: ctrl.signal })
      clearTimeout(id)
      supabaseHealthy = r.ok
    } catch {
      supabaseHealthy = false
    }
  }

  return NextResponse.json({
    status: 'ok',
    time: new Date().toISOString(),
    appUrl,
    supabaseUrl,
    supabaseHealthy,
  })
}

