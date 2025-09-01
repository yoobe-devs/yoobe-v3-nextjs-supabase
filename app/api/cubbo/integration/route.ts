import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getCubboService } from '@/lib/services/cubbo'

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar configuração de integração
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar configuração de integração
    const { data: integration, error: integrationError } = await supabaseService
      .from('cubbo_integrations')
      .select('*')
      .eq('store_id', userData.store_id)
      .single()

    if (integrationError && integrationError.code !== 'PGRST116') {
      console.error('Erro ao buscar integração:', integrationError)
      return NextResponse.json({ error: 'Erro ao buscar integração' }, { status: 500 })
    }

    return NextResponse.json({ 
      integration: integration || null,
      hasIntegration: !!integration
    })

  } catch (error) {
    console.error('Erro na API de integração Cubbo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar/atualizar configuração de integração
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      cubbo_api_key, 
      cubbo_warehouse_id, 
      cubbo_company_id,
      olist_api_key,
      olist_company_id,
      sync_products,
      sync_orders,
      sync_inventory
    } = body

    // Validar dados obrigatórios
    if (!cubbo_api_key) {
      return NextResponse.json({ error: 'API Key do Cubbo é obrigatória' }, { status: 400 })
    }

    // Testar conexão com Cubbo
    try {
      const cubboService = new (await import('@/lib/services/cubbo')).CubboService(
        cubbo_api_key, 
        process.env.CUBBO_BASE_URL || 'https://api.cubbo.com/v1'
      )
      
      // Testar API fazendo uma chamada simples
      await cubboService.getAvailableCarriers()
    } catch (cubboError) {
      console.error('Erro ao testar conexão com Cubbo:', cubboError)
      return NextResponse.json({ 
        error: 'Falha na conexão com Cubbo. Verifique a API Key.' 
      }, { status: 400 })
    }

    // Inserir ou atualizar configuração
    const { data: integration, error: upsertError } = await supabaseService
      .from('cubbo_integrations')
      .upsert({
        store_id: userData.store_id,
        cubbo_api_key,
        cubbo_warehouse_id,
        cubbo_company_id,
        olist_api_key,
        olist_company_id,
        sync_products: sync_products ?? true,
        sync_orders: sync_orders ?? true,
        sync_inventory: sync_inventory ?? true,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'store_id'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Erro ao salvar integração:', upsertError)
      return NextResponse.json({ error: 'Erro ao salvar integração' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Integração configurada com sucesso',
      integration 
    })

  } catch (error) {
    console.error('Erro na API de integração Cubbo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Desativar integração
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Desativar integração
    const { error: updateError } = await supabaseService
      .from('cubbo_integrations')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('store_id', userData.store_id)

    if (updateError) {
      console.error('Erro ao desativar integração:', updateError)
      return NextResponse.json({ error: 'Erro ao desativar integração' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Integração desativada com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de integração Cubbo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
