import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/auth/login', 
    '/auth/register', 
    '/auth/callback', 
    '/auth/verify', 
    '/store', 
    '/minha-loja',
    '/loja-brindes',
    '/configuracoes',
    '/contato',
    '/pedidos',
    '/privacidade',
    '/swag-track',
    '/termos',
    '/ativar-produtos',
    '/catalogo',
    '/criar-kit',
    '/onboarding',
    '/estoque',
    '/produtos',
    '/usuarios',
    '/choose-environment', 
    '/legacy', 
    '/test-login',
    '/test-gestor',
    '/test-gestor-redirect',
    '/test-simple',
    '/api/auth/callback',
    '/test-system'
  ]
  
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Se não há sessão e não é uma rota pública, redirecionar para login
  if (!session && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Se há sessão e está tentando acessar login, redirecionar para choose-environment
  if (session && req.nextUrl.pathname === '/auth/login') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/choose-environment'
    return NextResponse.redirect(redirectUrl)
  }

  // Permitir acesso a rotas públicas mesmo com sessão
  if (isPublicRoute) {
    return res
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}


