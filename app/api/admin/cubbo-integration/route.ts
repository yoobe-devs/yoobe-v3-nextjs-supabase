import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar configuração de integração Cubbo global
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas admins' }, { status: 403 })
    }

    // Buscar configuração de integração global
    const { data: integration, error: integrationError } = await supabaseService
      .from('cubbo_integrations')
      .select('*')
      .eq('is_global', true)
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
    console.error('Erro na API de integração Cubbo global:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar/atualizar configuração de integração Cubbo global
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Apenas admins' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      cubbo_api_key, 
      cubbo_warehouse_id, 
      cubbo_company_id,
      sync_products,
      sync_orders,
      sync_inventory
    } = body

    // Validar dados obrigatórios
    if (!cubbo_api_key) {
      return NextResponse.json({ error: 'API Key do Cubbo é obrigatória' }, { status: 400 })
    }

    // Inserir ou atualizar configuração global
    const { data: integration, error: upsertError } = await supabaseService
      .from('cubbo_integrations')
      .upsert({
        is_global: true,
        cubbo_api_key,
        cubbo_warehouse_id,
        cubbo_company_id,
        sync_products: sync_products ?? true,
        sync_orders: sync_orders ?? true,
        sync_inventory: sync_inventory ?? true,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'is_global'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Erro ao salvar integração:', upsertError)
      return NextResponse.json({ error: 'Erro ao salvar integração' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Integração Cubbo global configurada com sucesso',
      integration 
    })

  } catch (error) {
    console.error('Erro na API de integração Cubbo global:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
