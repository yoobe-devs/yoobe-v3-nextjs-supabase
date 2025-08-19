import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const redirect = searchParams.get('redirect') || '/'
  const ssoAuthorize = process.env.NEXT_PUBLIC_SSO_AUTHORIZE_URL
  if (!ssoAuthorize) {
    return NextResponse.json({ error: 'SSO não configurado' }, { status: 500 })
  }
  const url = new URL(ssoAuthorize)
  url.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`)
  url.searchParams.set('state', redirect)
  return NextResponse.redirect(url)
}


