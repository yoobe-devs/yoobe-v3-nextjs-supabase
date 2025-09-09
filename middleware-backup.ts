import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  console.log('🔍 Middleware executando para:', path)

  // Rotas públicas - não fazer nada
  const publicRoutes = [
    '/',
    '/auth',
    '/api/health',
    '/api/auth',
    '/api/docs',
    '/docs',
    '/_next',
    '/favicon.ico',
    '/choose-environment',
    '/store',
  ]

  const isPublic = publicRoutes.some(route => path.startsWith(route))

  if (isPublic) {
    console.log('✅ Rota pública, permitindo acesso:', path)
    return NextResponse.next()
  }

  // Rotas protegidas - redirecionar para login
  const protectedRoutes = [
    '/admin',
    '/gestor',
    '/funcionario',
    '/app',
  ]
  
  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  if (isProtected) {
    console.log('🔒 Rota protegida detectada:', path)
    
    // Verificar se já tem redirect param para evitar loops
    const hasRedirect = request.nextUrl.searchParams.has('redirect')

    if (!hasRedirect) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      console.log('🔄 Redirecionando para login:', url.toString())
      return NextResponse.redirect(url)
    }
  }

  console.log('➡️ Continuando para próxima etapa:', path)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
