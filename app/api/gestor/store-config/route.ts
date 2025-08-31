import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar configuração da loja
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar loja do gestor
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select(`
        *,
        companies (
          id,
          name,
          email,
          logo_url
        )
      `)
      .eq('id', userData.store_id)
      .single()

    if (storeError) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Configuração padrão da loja
    const storeConfig = {
      id: store.id,
      name: store.name || `${store.companies.name} Store`,
      description: store.description || `Loja corporativa da ${store.companies.name}`,
      domain: store.domain || store.name?.toLowerCase().replace(/\s+/g, '-') || 'loja',
      logo_url: store.logo_url || store.companies.logo_url,
      banner_url: store.banner_url,
      primary_color: store.primary_color || '#3B82F6',
      secondary_color: store.secondary_color || '#1E40AF',
      accent_color: store.accent_color || '#F59E0B',
      theme: store.theme || 'light',
      layout: store.layout || 'grid',
      status: store.status || 'active',
      company_id: store.company_id,
      settings: {
        enable_points: store.enable_points !== false,
        enable_reviews: store.enable_reviews !== false,
        enable_wishlist: store.enable_wishlist !== false,
        enable_newsletter: store.enable_newsletter !== false,
        require_approval: store.require_approval || false,
        max_points_per_order: store.max_points_per_order || 1000,
        min_order_value: store.min_order_value || 0
      }
    }

    return NextResponse.json(storeConfig)
  } catch (error) {
    console.error('Erro na API de configuração da loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar configuração da loja
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      domain,
      logo_url,
      banner_url,
      primary_color,
      secondary_color,
      accent_color,
      theme,
      layout,
      status,
      settings
    } = body

    // Buscar loja do gestor
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', userData.store_id)
      .single()

    if (storeError) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Atualizar configuração da loja
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({
        name,
        description,
        domain,
        logo_url,
        banner_url,
        primary_color,
        secondary_color,
        accent_color,
        theme,
        layout,
        status,
        enable_points: settings?.enable_points,
        enable_reviews: settings?.enable_reviews,
        enable_wishlist: settings?.enable_wishlist,
        enable_newsletter: settings?.enable_newsletter,
        require_approval: settings?.require_approval,
        max_points_per_order: settings?.max_points_per_order,
        min_order_value: settings?.min_order_value,
        updated_at: new Date().toISOString()
      })
      .eq('id', store.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar loja:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Configuração atualizada com sucesso',
      store: updatedStore
    })
  } catch (error) {
    console.error('Erro na API de configuração da loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
