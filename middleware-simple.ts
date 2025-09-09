import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  console.log('🔍 Middleware executando para:', path)

  // Rotas protegidas - redirecionar para login
  if (
    path.startsWith('/admin') ||
    path.startsWith('/gestor') ||
    path.startsWith('/funcionario')
  ) {
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
