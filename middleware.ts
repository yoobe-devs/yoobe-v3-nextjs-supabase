import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withMiddlewareProtection } from '@/lib/middleware-protection'

// Função principal do middleware
function middlewareLogic(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rotas públicas - não fazer nada
  const publicRoutes = [
    '/auth',
    '/api',
    '/docs',
    '/_next',
    '/favicon.ico',
    '/choose-environment',
    '/store',
  ]

  const isPublic =
    path === '/' || publicRoutes.some(route => path.startsWith(route))

  if (isPublic) {
    return NextResponse.next()
  }

  // Rotas protegidas - redirecionar para login
  if (
    path.startsWith('/admin') ||
    path.startsWith('/gestor') ||
    path.startsWith('/funcionario')
  ) {
    // Verificar se já tem redirect param para evitar loops
    const hasRedirect = request.nextUrl.searchParams.has('redirect')

    if (!hasRedirect) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Middleware com proteção e monitoramento
export const middleware = withMiddlewareProtection(middlewareLogic)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
