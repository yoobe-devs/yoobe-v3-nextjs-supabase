import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPrefixes = ['/loja-brindes']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('yoobe_sso_token')?.value
  if (!token) {
    const ssoLoginUrl = process.env.NEXT_PUBLIC_SSO_LOGIN_URL || '/api/auth/login'
    const url = new URL(ssoLoginUrl, request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/loja-brindes/:path*'],
}


