import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { store_id, resgate_por_tags_enabled } = body

    if (!store_id || typeof resgate_por_tags_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'store_id e resgate_por_tags_enabled são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar configuração da loja
    const { data: updatedSettings, error: updateError } = await supabase
      .from('store_settings')
      .update({
        resgate_por_tags_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', store_id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar configurações:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')

    if (!storeId) {
      return NextResponse.json(
        { error: 'store_id é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar configurações da loja
    const { data: settings, error: fetchError } = await supabase
      .from('store_settings')
      .select('resgate_por_tags_enabled')
      .eq('store_id', storeId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar configurações:', fetchError)
      return NextResponse.json(
        { error: 'Erro ao buscar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      settings: settings || { resgate_por_tags_enabled: false },
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

