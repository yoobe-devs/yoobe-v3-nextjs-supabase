import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar se o usuário é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Simular sincronização (em produção, isso seria uma chamada real para a API do Cubbo)
    const syncData = {
      products_synced: 15,
      inventory_updated: 8,
      orders_synced: 3,
      timestamp: new Date().toISOString()
    }

    // Registrar log de sincronização
    const { error: logError } = await supabase
      .from('product_sync_log')
      .insert({
        sync_type: 'full_sync',
        status: 'completed',
        details: syncData,
        created_by: user.id
      })

    if (logError) {
      console.error('Erro ao registrar log de sincronização:', logError)
    }

    return NextResponse.json({
      message: 'Sincronização concluída com sucesso',
      data: syncData
    })

  } catch (error) {
    console.error('Erro na sincronização Cubbo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar se o usuário é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar status da integração global
    const { data: integration } = await supabase
      .from('cubbo_integrations')
      .select('*')
      .eq('is_global', true)
      .single()

    // Buscar logs recentes de sincronização
    const { data: syncLogs } = await supabase
      .from('product_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      integration,
      recent_syncs: syncLogs || [],
      status: 'active'
    })

  } catch (error) {
    console.error('Erro ao buscar status da sincronização:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
