import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getDashboardRoute } from '@/lib/auth-redirects'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      // Redirecionar para o dashboard apropriado baseado no role
      const dashboardRoute = getDashboardRoute(session.user)
      return NextResponse.redirect(new URL(dashboardRoute, requestUrl.origin))
    }
  }

  // Fallback: redirecionar para choose-environment se não conseguir determinar o role
  return NextResponse.redirect(
    new URL('/choose-environment', requestUrl.origin)
  )
}
