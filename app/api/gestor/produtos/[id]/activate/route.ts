import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @api {put} /api/gestor/produtos/:id/activate Ativar/Desativar produto
 * @apiName ToggleProductActivation
 * @apiGroup Gestor
 * @apiDescription Ativa ou desativa um produto replicado na loja do gestor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const productId = params.id
    
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

    const body = await request.json()
    const { action } = body // 'activate' ou 'deactivate'

    if (!action || !['activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Ação deve ser "activate" ou "deactivate"' } },
        { status: 400 }
      )
    }

    // Verificar se o produto existe e pertence à empresa do gestor
    const { data: product, error: productError } = await supabase
      .from('product_store')
      .select('*')
      .eq('id', productId)
      .eq('tenant_id', user.company_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Produto não encontrado' } },
        { status: 404 }
      )
    }

    // Atualizar status de ativação
    const isActive = action === 'activate'
    const { data: updatedProduct, error: updateError } = await supabase
      .from('product_store')
      .update({
        is_active: isActive,
        updated_by: session.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Erro ao atualizar produto' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabase
      .from('audit_log')
      .insert({
        event_type: `product_${action}d`,
        actor_id: session.user.id,
        role: user.role,
        tenant_id: user.company_id,
        target: 'product_store',
        payload: { 
          product_id: productId, 
          action: action,
          previous_status: product.is_active,
          new_status: isActive
        }
      })

    // Disparar webhook se configurado
    try {
      await fetch(process.env.WEBHOOK_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: `product.${action}d`,
          product_id: productId,
          tenant_id: user.company_id,
          timestamp: new Date().toISOString()
        })
      })
    } catch (webhookError) {
      console.warn('Erro ao disparar webhook:', webhookError)
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: `Produto ${action === 'activate' ? 'ativado' : 'desativado'} com sucesso`
    })

  } catch (error) {
    console.error('Erro na API de ativação de produtos:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
