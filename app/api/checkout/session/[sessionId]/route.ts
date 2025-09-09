import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkoutService } from '@/lib/services/checkout-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const sessionId = params.sessionId

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'ID da sessão é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar sessão de checkout
    const session = await checkoutService.getCheckoutSession(sessionId)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a sessão pertence ao usuário
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: session,
    })
  } catch (error) {
    console.error('Erro ao buscar sessão de checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
