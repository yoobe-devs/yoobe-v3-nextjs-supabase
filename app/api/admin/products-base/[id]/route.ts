import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Tipos
interface ProductBase {
  id: string
  sku: string
  title: string
  description: string
  price_cash: number
  price_points: number
  category: string
  active: boolean
  tenant_id: string
  media: string[]
  variations: any[]
  created_at: string
  updated_at: string
}

interface UpdateProductPayload {
  title?: string
  description?: string
  price_cash?: number
  price_points?: number
  category?: string
  active?: boolean
  media?: string[]
  variations?: any[]
}

// Validação de payload
function validateUpdatePayload(payload: any): payload is UpdateProductPayload {
  if (payload.title !== undefined && typeof payload.title !== 'string') {
    throw new Error('Título deve ser uma string')
  }
  if (payload.description !== undefined && typeof payload.description !== 'string') {
    throw new Error('Descrição deve ser uma string')
  }
  if (payload.price_cash !== undefined && (typeof payload.price_cash !== 'number' || payload.price_cash < 0)) {
    throw new Error('Preço em dinheiro deve ser um número maior ou igual a zero')
  }
  if (payload.price_points !== undefined && (typeof payload.price_points !== 'number' || payload.price_points < 0)) {
    throw new Error('Preço em pontos deve ser um número maior ou igual a zero')
  }
  if (payload.category !== undefined && typeof payload.category !== 'string') {
    throw new Error('Categoria deve ser uma string')
  }
  if (payload.active !== undefined && typeof payload.active !== 'boolean') {
    throw new Error('Status ativo deve ser um booleano')
  }
  return true
}

// Autenticação e autorização
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Verificar token de autorização
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorização é obrigatório')
  }

  const token = authHeader.substring(7)
  
  // Verificar sessão
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    throw new Error('Token inválido ou expirado')
  }

  // Verificar se o usuário tem role de admin_global
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    throw new Error('Usuário não encontrado')
  }

  if (userData.role !== 'admin_global') {
    throw new Error('Acesso negado. Apenas administradores globais podem gerenciar produtos base.')
  }

  return { user, userData }
}

// GET /api/admin/products-base/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autenticação
    const { user, userData } = await authenticateUser(request)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const productId = params.id

    // Buscar produto
    const { data: product, error } = await supabase
      .from('products_base')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'NOT_FOUND', 
              message: 'Produto não encontrado' 
            } 
          },
          { status: 404 }
        )
      }
      
      console.error('Erro ao buscar produto:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DATABASE_ERROR', 
            message: 'Erro ao buscar produto no banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    // Buscar snapshots de estoque
    const { data: stockSnapshots, error: stockError } = await supabase
      .from('stock_snapshots')
      .select('*')
      .eq('product_id', productId)

    if (stockError) {
      console.warn('Erro ao buscar estoque:', stockError)
    }

    // Buscar histórico de auditoria
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_log')
      .select('*')
      .eq('target', 'products_base')
      .eq('target_id', productId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (auditError) {
      console.warn('Erro ao buscar auditoria:', auditError)
    }

    // Montar resposta completa
    const productWithDetails = {
      ...product,
      stock_snapshots: stockSnapshots || [],
      audit_history: auditLogs || []
    }

    return NextResponse.json({
      success: true,
      data: productWithDetails
    })

  } catch (error) {
    console.error('Erro na API de produto base:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Token de autorização')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: error.message 
            } 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Acesso negado')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: error.message 
            } 
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Erro interno do servidor' 
        } 
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products-base/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autenticação
    const { user, userData } = await authenticateUser(request)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const productId = params.id

    // Verificar se o produto existe
    const { data: existingProduct, error: checkError } = await supabase
      .from('products_base')
      .select('*')
      .eq('id', productId)
      .single()

    if (checkError || !existingProduct) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NOT_FOUND', 
            message: 'Produto não encontrado' 
          } 
        },
        { status: 404 }
      )
    }

    // Validar payload
    const payload = await request.json()
    validateUpdatePayload(payload)

    // Preparar dados para atualização
    const updateData = {
      ...payload,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    // Atualizar produto
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products_base')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'UPDATE_ERROR', 
            message: 'Erro ao atualizar produto no banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabase
        .from('audit_log')
        .insert({
          event_type: 'product_base_updated',
          actor_id: user.id,
          role: userData.role,
          tenant_id: userData.company_id,
          target: 'products_base',
          target_id: productId,
          payload: {
            action: 'update',
            previous_data: existingProduct,
            new_data: updateData,
            changes: Object.keys(payload)
          },
          ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria:', auditError)
    }

    // Webhook para notificar mudanças (simulado)
    try {
      // Aqui você pode implementar webhooks para notificar sistemas externos
      console.log(`Webhook: Produto ${productId} foi atualizado por ${user.id}`)
    } catch (webhookError) {
      console.warn('Erro ao enviar webhook:', webhookError)
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Produto atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de produto base:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Título deve ser uma string')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: error.message 
            } 
          },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Token de autorização')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: error.message 
            } 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Acesso negado')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: error.message 
            } 
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Erro interno do servidor' 
        } 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products-base/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autenticação
    const { user, userData } = await authenticateUser(request)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const productId = params.id

    // Verificar se o produto existe
    const { data: existingProduct, error: checkError } = await supabase
      .from('products_base')
      .select('*')
      .eq('id', productId)
      .single()

    if (checkError || !existingProduct) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NOT_FOUND', 
            message: 'Produto não encontrado' 
          } 
        },
        { status: 404 }
      )
    }

    // Verificar se o produto está sendo usado em orçamentos
    const { data: budgetItems, error: budgetError } = await supabase
      .from('budget_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1)

    if (budgetError) {
      console.warn('Erro ao verificar uso em orçamentos:', budgetError)
    }

    if (budgetItems && budgetItems.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'PRODUCT_IN_USE', 
            message: 'Não é possível excluir um produto que está sendo usado em orçamentos' 
          } 
        },
        { status: 409 }
      )
    }

    // Excluir produto
    const { error: deleteError } = await supabase
      .from('products_base')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      console.error('Erro ao excluir produto:', deleteError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DELETE_ERROR', 
            message: 'Erro ao excluir produto do banco de dados' 
          } 
        },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabase
        .from('audit_log')
        .insert({
          event_type: 'product_base_deleted',
          actor_id: user.id,
          role: userData.role,
          tenant_id: userData.company_id,
          target: 'products_base',
          target_id: productId,
          payload: {
            action: 'delete',
            deleted_product: existingProduct
          },
          ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Produto excluído com sucesso'
    }, { status: 204 })

  } catch (error) {
    console.error('Erro na API de produto base:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Token de autorização')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: error.message 
            } 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Acesso negado')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: error.message 
            } 
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Erro interno do servidor' 
        } 
      },
      { status: 500 }
    )
  }
}
