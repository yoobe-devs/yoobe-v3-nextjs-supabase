import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Obter company_id do usuário
    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa não encontrado' },
        { status: 400 }
      )
    }

    // Buscar configurações da empresa (com fallback se tabela não existir)
    let checkoutV2Enabled = false

    try {
      const { data: settings, error: settingsError } = await supabase
        .from('store_settings')
        .select('settings')
        .eq('tenant_id', companyId)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', settingsError)
        // Se a tabela não existir, usar valor padrão
        if (settingsError.code === 'PGRST205') {
          console.log('Tabela store_settings não existe, usando valor padrão')
          checkoutV2Enabled = false
        } else {
          return NextResponse.json(
            { error: 'Erro ao buscar configurações' },
            { status: 500 }
          )
        }
      } else {
        checkoutV2Enabled = settings?.settings?.checkout_v2_enabled || false
      }
    } catch (error) {
      console.error('Erro ao acessar store_settings:', error)
      checkoutV2Enabled = false
    }

    return NextResponse.json({
      checkout_v2_enabled: checkoutV2Enabled,
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro no GET /api/gestor/settings/checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Obter company_id do usuário
    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa não encontrado' },
        { status: 400 }
      )
    }

    // Parse do body
    const body = await request.json()
    const { checkout_v2_enabled } = body

    if (typeof checkout_v2_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'checkout_v2_enabled deve ser um boolean' },
        { status: 400 }
      )
    }

    // Buscar configurações existentes
    const { data: existingSettings, error: fetchError } = await supabase
      .from('store_settings')
      .select('settings')
      .eq('tenant_id', companyId)
      .single()

    // Preparar novas configurações
    const currentSettings = existingSettings?.settings || {}
    const newSettings = {
      ...currentSettings,
      checkout_v2_enabled,
    }

    // Upsert das configurações
    const { data: updatedSettings, error: upsertError } = await supabase
      .from('store_settings')
      .upsert({
        tenant_id: companyId,
        settings: newSettings,
        updated_at: new Date().toISOString(),
      })
      .select('settings, updated_at')
      .single()

    if (upsertError) {
      console.error('Erro ao salvar configurações:', upsertError)
      return NextResponse.json(
        { error: 'Erro ao salvar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      checkout_v2_enabled,
      updated_at: updatedSettings.updated_at,
    })
  } catch (error) {
    console.error('Erro no PUT /api/gestor/settings/checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
