import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @api {get} /api/gestor/store-config Obter configurações da loja
 * @apiName GetStoreConfig
 * @apiGroup Gestor
 * @apiDescription Obtém as configurações atuais da loja do gestor
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    // Verificar se é gestor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado. Apenas gestores podem acessar.' } },
        { status: 403 }
      )
    }

    // Buscar configurações da loja
    const { data: storeConfig, error: configError } = await supabase
      .from('store_configs')
      .select('*')
      .eq('tenant_id', user.company_id)
      .single()

    if (configError && configError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar configurações:', configError)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar configurações' } },
        { status: 500 }
      )
    }

    // Se não existir configuração, retornar padrão
    if (!storeConfig) {
      return NextResponse.json({
        success: true,
        data: {
          tenant_id: user.company_id,
          name: 'Minha Loja',
          slug: 'minha-loja',
          domain: '',
          description: 'Descrição da minha loja',
          primary_color: '#3B82F6',
          secondary_color: '#1E40AF',
          logo_url: '',
          favicon_url: '',
          contact_email: '',
          contact_phone: '',
          address: '',
          policies: {
            return_policy: '',
            shipping_policy: '',
            privacy_policy: '',
            terms_of_service: ''
          },
          features: {
            points_enabled: true,
            cash_enabled: true,
            mixed_payment: true,
            auto_activation: false,
            email_notifications: true,
            sms_notifications: false
          },
          limits: {
            max_points_per_order: 50000,
            max_cash_per_order: 5000,
            min_order_value: 50,
            max_order_value: 10000
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        message: 'Configurações padrão carregadas'
      })
    }

    return NextResponse.json({
      success: true,
      data: storeConfig
    })

  } catch (error) {
    console.error('Erro na API de configurações da loja:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

/**
 * @api {put} /api/gestor/store-config Atualizar configurações da loja
 * @apiName UpdateStoreConfig
 * @apiGroup Gestor
 * @apiDescription Atualiza as configurações da loja do gestor
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    // Verificar se é gestor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .single()

    if (userError || !user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado. Apenas gestores podem acessar.' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      slug,
      domain,
      description,
      primary_color,
      secondary_color,
      logo_url,
      favicon_url,
      contact_email,
      contact_phone,
      address,
      policies,
      features,
      limits
    } = body

    // Validação dos campos obrigatórios
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Nome e slug são obrigatórios' } },
        { status: 400 }
      )
    }

    // Validar slug (apenas letras, números e hífens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Slug deve conter apenas letras minúsculas, números e hífens' } },
        { status: 400 }
      )
    }

    // Verificar se slug já existe em outra empresa
    const { data: existingSlug } = await supabase
      .from('store_configs')
      .select('id')
      .eq('slug', slug)
      .neq('tenant_id', user.company_id)
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Slug já está em uso por outra empresa' } },
        { status: 409 }
      )
    }

    // Verificar se já existe configuração
    const { data: existingConfig } = await supabase
      .from('store_configs')
      .select('id')
      .eq('tenant_id', user.company_id)
      .single()

    let storeConfig
    let configError

    if (existingConfig) {
      // Atualizar configuração existente
      const { data: updatedConfig, error: updateError } = await supabase
        .from('store_configs')
        .update({
          name,
          slug,
          domain,
          description,
          primary_color,
          secondary_color,
          logo_url,
          favicon_url,
          contact_email,
          contact_phone,
          address,
          policies,
          features,
          limits,
          updated_by: session.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id)
        .select()
        .single()

      storeConfig = updatedConfig
      configError = updateError
    } else {
      // Criar nova configuração
      const { data: newConfig, error: createError } = await supabase
        .from('store_configs')
        .insert({
          tenant_id: user.company_id,
          name,
          slug,
          domain,
          description,
          primary_color,
          secondary_color,
          logo_url,
          favicon_url,
          contact_email,
          contact_phone,
          address,
          policies,
          features,
          limits,
          created_by: session.user.id,
          updated_by: session.user.id
        })
        .select()
        .single()

      storeConfig = newConfig
      configError = createError
    }

    if (configError) {
      console.error('Erro ao salvar configurações:', configError)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao salvar configurações' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabase
      .from('audit_log')
      .insert({
        event_type: existingConfig ? 'store_config_updated' : 'store_config_created',
        actor_id: session.user.id,
        role: user.role,
        tenant_id: user.company_id,
        target: 'store_configs',
        payload: { 
          action: existingConfig ? 'update' : 'create',
          config_id: storeConfig.id,
          slug,
          name
        }
      })

    // Atualizar URL da loja se necessário
    if (process.env.STORE_URL_UPDATE_WEBHOOK) {
      try {
        await fetch(process.env.STORE_URL_UPDATE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: user.company_id,
            slug,
            domain,
            action: 'update'
          })
        })
      } catch (webhookError) {
        console.warn('Erro ao atualizar URL da loja:', webhookError)
      }
    }

    return NextResponse.json({
      success: true,
      data: storeConfig,
      message: existingConfig ? 'Configurações atualizadas com sucesso' : 'Configurações criadas com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de configurações da loja:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

/**
 * @api {delete} /api/gestor/store-config Deletar configurações da loja
 * @apiName DeleteStoreConfig
 * @apiGroup Gestor
 * @apiDescription Deleta as configurações da loja do gestor
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    // Verificar se é gestor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado. Apenas gestores podem acessar.' } },
        { status: 403 }
      )
    }

    // Verificar se existe configuração
    const { data: existingConfig } = await supabase
      .from('store_configs')
      .select('id, slug')
      .eq('tenant_id', user.company_id)
      .single()

    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Configurações não encontradas' } },
        { status: 404 }
      )
    }

    // Deletar configuração
    const { error: deleteError } = await supabase
      .from('store_configs')
      .delete()
      .eq('id', existingConfig.id)

    if (deleteError) {
      console.error('Erro ao deletar configurações:', deleteError)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao deletar configurações' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabase
      .from('audit_log')
      .insert({
        event_type: 'store_config_deleted',
        actor_id: session.user.id,
        role: user.role,
        tenant_id: user.company_id,
        target: 'store_configs',
        payload: { 
          action: 'delete',
          config_id: existingConfig.id,
          slug: existingConfig.slug
        }
      })

    // Remover URL da loja se necessário
    if (process.env.STORE_URL_UPDATE_WEBHOOK) {
      try {
        await fetch(process.env.STORE_URL_UPDATE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: user.company_id,
            slug: existingConfig.slug,
            action: 'delete'
          })
        })
      } catch (webhookError) {
        console.warn('Erro ao remover URL da loja:', webhookError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações deletadas com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de configurações da loja:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
