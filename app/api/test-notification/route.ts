import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type = 'info', title, message, action_url } = body

    // Criar notificação de teste
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type,
        title: title || 'Notificação de Teste',
        message: message || 'Esta é uma notificação de teste para verificar o sistema em tempo real.',
        action_url: action_url || null
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar notificação:', error)
      return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      notification: data,
      message: 'Notificação enviada com sucesso!' 
    })

  } catch (error) {
    console.error('Erro na API de teste:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
