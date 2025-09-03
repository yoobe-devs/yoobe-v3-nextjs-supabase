import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Observabilidade básica: request id e logs
  const reqId = crypto.randomUUID()
  res.headers.set('x-request-id', reqId)

  // Redirecionar rotas antigas do gestor-app para a nova estrutura /gestor
  try {
    const path = req.nextUrl.pathname
    if (path === '/gestor-app') {
      const url = req.nextUrl.clone(); url.pathname = '/gestor/dashboard'
      return NextResponse.redirect(url)
    }
    const redirects: Record<string, string> = {
      '/gestor-app/users': '/gestor/usuarios',
      '/gestor-app/products': '/gestor/produtos',
      '/gestor-app/quotes': '/gestor/orcamentos',
      '/gestor-app/orders': '/gestor/pedidos',
    }
    if (redirects[path]) {
      const url = req.nextUrl.clone(); url.pathname = redirects[path]
      return NextResponse.redirect(url)
    }
  } catch {}

  // Rate limit simples (in-memory, dev) para endpoints críticos
  try {
    const path = req.nextUrl.pathname
    if (path.startsWith('/api/gestor/products/') && (path.includes('/images') || path.includes('/dupes'))) {
      const ip = req.headers.get('x-forwarded-for') || req.ip || 'local'
      ;(globalThis as any).__rate__ = (globalThis as any).__rate__ || new Map()
      const key = `${ip}:${path}`
      const now = Date.now()
      const windowMs = 60_000
      const limit = 30
      const entry = (globalThis as any).__rate__.get(key) || { count: 0, reset: now + windowMs }
      if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs }
      entry.count += 1
      (globalThis as any).__rate__.set(key, entry)
      if (entry.count > limit) {
        return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } })
      }
    }
  } catch {}

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/', // Landing page
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
    '/test-system',
    '/test-login-simple',
    '/api-docs',
    '/demo',
    '/docs' // Documentação pública
  ]
  
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Se não há sessão e não é uma rota pública, redirecionar para login
  if (!session && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  // RBAC básico: restringe área do gestor a perfis permitidos
  if (session && req.nextUrl.pathname.startsWith('/gestor')) {
    const role = (session.user?.user_metadata as any)?.role
    const allowed = ['gestor', 'manager', 'admin', 'admin_global', 'superadmin']
    if (!allowed.includes(role)) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/choose-environment'
      return NextResponse.redirect(redirectUrl)
    }
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
