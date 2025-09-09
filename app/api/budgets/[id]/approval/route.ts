import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const approvalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  comments: z.string().optional(),
  rejection_reason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const querySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  approver_id: z.string().uuid().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const budgetId = params.id
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      status: searchParams.get('status'),
      approver_id: searchParams.get('approver_id'),
    })

    // Verificar se o orçamento existe e se o usuário tem acesso
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, company_id, status')
      .eq('id', budgetId)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { success: false, error: { message: 'Orçamento não encontrado' } },
        { status: 404 }
      )
    }

    // Verificar acesso ao orçamento
    if (authResult.user.role === 'admin' && budget.company_id !== authResult.user.company_id) {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado ao orçamento' } },
        { status: 403 }
      )
    }

    // Buscar aprovações do orçamento
    let approvalsQuery = supabaseService
      .from('budget_approvals')
      .select(`
        id,
        status,
        comments,
        approved_at,
        rejection_reason,
        metadata,
        created_at,
        updated_at,
        approver_id,
        users (
          id,
          name,
          email
        )
      `)
      .eq('budget_id', budgetId)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (query.status) {
      approvalsQuery = approvalsQuery.eq('status', query.status)
    }
    if (query.approver_id) {
      approvalsQuery = approvalsQuery.eq('approver_id', query.approver_id)
    }

    const { data: approvals, error: approvalsError } = await approvalsQuery

    if (approvalsError) {
      console.error('Erro ao buscar aprovações:', approvalsError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro interno do servidor' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        budget_id: budgetId,
        approvals: approvals || [],
      },
    })
  } catch (error) {
    console.error('Erro na API de aprovações:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Parâmetros inválidos', details: error.errors } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const budgetId = params.id
    const body = await request.json()
    const approvalData = approvalSchema.parse(body)

    // Verificar se o orçamento existe e se o usuário tem acesso
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, company_id, status, title')
      .eq('id', budgetId)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { success: false, error: { message: 'Orçamento não encontrado' } },
        { status: 404 }
      )
    }

    // Verificar acesso ao orçamento
    if (authResult.user.role === 'admin' && budget.company_id !== authResult.user.company_id) {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado ao orçamento' } },
        { status: 403 }
      )
    }

    // Verificar se o orçamento pode ser aprovado/rejeitado
    if (!['pending', 'draft'].includes(budget.status)) {
      return NextResponse.json(
        { success: false, error: { message: 'Orçamento não pode ser aprovado/rejeitado no status atual' } },
        { status: 400 }
      )
    }

    // Verificar se já existe uma aprovação pendente
    const { data: existingApproval, error: existingError } = await supabaseService
      .from('budget_approvals')
      .select('id, status')
      .eq('budget_id', budgetId)
      .eq('status', 'pending')
      .single()

    if (existingApproval) {
      return NextResponse.json(
        { success: false, error: { message: 'Já existe uma aprovação pendente para este orçamento' } },
        { status: 400 }
      )
    }

    // Criar aprovação
    const approvalRecord = {
      budget_id: budgetId,
      approver_id: authResult.user.id,
      status: approvalData.status,
      comments: approvalData.comments,
      rejection_reason: approvalData.rejection_reason,
      metadata: approvalData.metadata,
      approved_at: approvalData.status === 'approved' ? new Date().toISOString() : null,
    }

    const { data: approval, error: approvalError } = await supabaseService
      .from('budget_approvals')
      .insert([approvalRecord])
      .select(`
        id,
        status,
        comments,
        approved_at,
        rejection_reason,
        metadata,
        created_at,
        updated_at,
        approver_id,
        users (
          id,
          name,
          email
        )
      `)
      .single()

    if (approvalError) {
      console.error('Erro ao criar aprovação:', approvalError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao criar aprovação' } },
        { status: 500 }
      )
    }

    // Atualizar status do orçamento
    const newBudgetStatus = approvalData.status === 'approved' ? 'approved' : 'rejected'
    const { error: budgetUpdateError } = await supabaseService
      .from('budgets')
      .update({ 
        status: newBudgetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', budgetId)

    if (budgetUpdateError) {
      console.error('Erro ao atualizar status do orçamento:', budgetUpdateError)
    }

    // Se aprovado, iniciar processo de replicação
    if (approvalData.status === 'approved') {
      try {
        await initiateProductReplication(budgetId, authResult.user.id)
      } catch (replicationError) {
        console.error('Erro ao iniciar replicação:', replicationError)
        // Não falhar a aprovação por causa da replicação
      }
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'create',
        table_name: 'budget_approvals',
        record_id: approval.id,
        user_id: authResult.user.id,
        changes: approvalRecord,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    // Criar notificação
    await supabaseService.from('notifications').insert([
      {
        type: 'budget',
        title: `Orçamento ${approvalData.status === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
        message: `O orçamento "${budget.title}" foi ${approvalData.status === 'approved' ? 'aprovado' : 'rejeitado'}${approvalData.comments ? `: ${approvalData.comments}` : ''}`,
        priority: approvalData.status === 'approved' ? 'high' : 'medium',
        company_id: budget.company_id,
        budget_id: budgetId,
        data: {
          budget_title: budget.title,
          approval_status: approvalData.status,
          approver_name: authResult.user.name,
        },
      },
    ])

    return NextResponse.json({
      success: true,
      data: { 
        approval,
        budget_status_updated: newBudgetStatus,
      },
    })
  } catch (error) {
    console.error('Erro na API de aprovações:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Dados inválidos', details: error.errors } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// Função para iniciar replicação de produtos
async function initiateProductReplication(budgetId: string, userId: string) {
  // Buscar itens do orçamento
  const { data: budgetItems, error: itemsError } = await supabaseService
    .from('budget_items')
    .select(`
      id,
      base_product_id,
      quantity,
      unit_price,
      total_price,
      base_products (
        id,
        name,
        description,
        base_price,
        images,
        specifications,
        features,
        available_colors,
        available_sizes,
        customization_options
      )
    `)
    .eq('budget_id', budgetId)

  if (itemsError || !budgetItems) {
    throw new Error('Erro ao buscar itens do orçamento')
  }

  // Buscar uploads relacionados ao orçamento
  const { data: uploads, error: uploadsError } = await supabaseService
    .from('file_uploads')
    .select('id, file_path, file_type, budget_item_id')
    .eq('budget_id', budgetId)
    .eq('status', 'completed')

  if (uploadsError) {
    console.error('Erro ao buscar uploads:', uploadsError)
  }

  // Criar replicações para cada item
  const replications = []
  for (const item of budgetItems) {
    const itemUploads = uploads?.filter(upload => upload.budget_item_id === item.id) || []
    
    // Criar produto replicado
    const { data: replicatedProduct, error: productError } = await supabaseService
      .from('products')
      .insert([{
        name: `${item.base_products.name} - Personalizado`,
        description: item.base_products.description,
        base_product_id: item.base_product_id,
        company_id: (await supabaseService.from('budgets').select('company_id').eq('id', budgetId).single()).data?.company_id,
        price: item.unit_price,
        points_cost: Math.round(item.unit_price * 0.1), // 10% do preço em pontos
        status: 'active',
        images: item.base_products.images || [],
        specifications: item.base_products.specifications || {},
        customizations: {
          quantity: item.quantity,
          original_price: item.base_products.base_price,
          custom_price: item.unit_price,
        },
        stock_quantity: item.quantity,
        created_by: userId,
      }])
      .select('id')
      .single()

    if (productError) {
      console.error('Erro ao criar produto replicado:', productError)
      continue
    }

    // Criar registro de replicação
    const { data: replication, error: replicationError } = await supabaseService
      .from('product_replications')
      .insert([{
        budget_id: budgetId,
        base_product_id: item.base_product_id,
        replicated_product_id: replicatedProduct.id,
        replication_type: 'automatic',
        status: 'completed',
        customizations: {
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        },
        artwork_files: itemUploads.map(upload => ({
          id: upload.id,
          file_path: upload.file_path,
          file_type: upload.file_type,
        })),
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        created_by: userId,
      }])
      .select('id')
      .single()

    if (replicationError) {
      console.error('Erro ao criar replicação:', replicationError)
    } else {
      replications.push(replication)
    }
  }

  return replications
}

