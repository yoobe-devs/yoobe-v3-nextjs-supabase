import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const querySchema = z.object({
  budget_id: z.string().uuid().optional(),
  base_product_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  replication_type: z.enum(['automatic', 'manual', 'custom']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
})

const createReplicationSchema = z.object({
  budget_id: z.string().uuid(),
  base_product_id: z.string().uuid(),
  replication_type: z.enum(['manual', 'custom']).default('manual'),
  customizations: z.record(z.any()).optional(),
  artwork_files: z.array(z.any()).optional(),
  quantity: z.number().positive().default(1),
  unit_price: z.number().positive(),
  total_price: z.number().positive(),
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
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

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      budget_id: searchParams.get('budget_id'),
      base_product_id: searchParams.get('base_product_id'),
      status: searchParams.get('status'),
      replication_type: searchParams.get('replication_type'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    let replicationsQuery = supabaseService
      .from('product_replications')
      .select(`
        id,
        budget_id,
        base_product_id,
        replicated_product_id,
        replication_type,
        status,
        customizations,
        artwork_files,
        quantity,
        unit_price,
        total_price,
        created_at,
        updated_at,
        created_by,
        budgets (
          id,
          title,
          status,
          company_id
        ),
        base_products (
          id,
          name,
          description,
          base_price
        ),
        products (
          id,
          name,
          price,
          status
        ),
        users (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    // Filtros baseados no usuário autenticado
    if (authResult.user.role === 'manager' || authResult.user.role === 'gestor') {
      // Filtrar por company_id através da tabela budgets
      replicationsQuery = replicationsQuery.eq('budgets.company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      replicationsQuery = replicationsQuery.eq('budgets.company_id', authResult.user.company_id)
    }

    // Aplicar filtros adicionais
    if (query.budget_id) {
      replicationsQuery = replicationsQuery.eq('budget_id', query.budget_id)
    }
    if (query.base_product_id) {
      replicationsQuery = replicationsQuery.eq('base_product_id', query.base_product_id)
    }
    if (query.status) {
      replicationsQuery = replicationsQuery.eq('status', query.status)
    }
    if (query.replication_type) {
      replicationsQuery = replicationsQuery.eq('replication_type', query.replication_type)
    }

    // Paginação
    const limit = query.limit || 50
    const offset = query.offset || 0
    replicationsQuery = replicationsQuery.range(offset, offset + limit - 1)

    const { data: replications, error: replicationsError } = await replicationsQuery

    if (replicationsError) {
      console.error('Erro ao buscar replicações:', replicationsError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro interno do servidor' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        replications: replications || [],
        pagination: {
          limit,
          offset,
          has_more: (replications?.length || 0) === limit,
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de replicações:', error)
    
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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const replicationData = createReplicationSchema.parse(body)

    // Verificar se o orçamento existe e se o usuário tem acesso
    const { data: budget, error: budgetError } = await supabaseService
      .from('budgets')
      .select('id, company_id, status')
      .eq('id', replicationData.budget_id)
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

    // Verificar se o produto base existe
    const { data: baseProduct, error: baseProductError } = await supabaseService
      .from('base_products')
      .select('id, name, description, base_price')
      .eq('id', replicationData.base_product_id)
      .single()

    if (baseProductError || !baseProduct) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto base não encontrado' } },
        { status: 404 }
      )
    }

    // Criar produto replicado
    const { data: replicatedProduct, error: productError } = await supabaseService
      .from('products')
      .insert([{
        name: `${baseProduct.name} - Personalizado`,
        description: baseProduct.description,
        base_product_id: replicationData.base_product_id,
        company_id: budget.company_id,
        price: replicationData.unit_price,
        points_cost: Math.round(replicationData.unit_price * 0.1),
        status: 'active',
        customizations: replicationData.customizations || {},
        stock_quantity: replicationData.quantity,
        created_by: authResult.user.id,
      }])
      .select('id')
      .single()

    if (productError) {
      console.error('Erro ao criar produto replicado:', productError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao criar produto replicado' } },
        { status: 500 }
      )
    }

    // Criar registro de replicação
    const { data: replication, error: replicationError } = await supabaseService
      .from('product_replications')
      .insert([{
        ...replicationData,
        replicated_product_id: replicatedProduct.id,
        status: 'completed',
        created_by: authResult.user.id,
      }])
      .select(`
        id,
        budget_id,
        base_product_id,
        replicated_product_id,
        replication_type,
        status,
        customizations,
        artwork_files,
        quantity,
        unit_price,
        total_price,
        created_at,
        updated_at
      `)
      .single()

    if (replicationError) {
      console.error('Erro ao criar replicação:', replicationError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao criar replicação' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'create',
        table_name: 'product_replications',
        record_id: replication.id,
        user_id: authResult.user.id,
        changes: replicationData,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    // Criar notificação
    await supabaseService.from('notifications').insert([
      {
        type: 'production',
        title: 'Produto Replicado',
        message: `Produto "${baseProduct.name}" foi replicado com sucesso`,
        priority: 'medium',
        company_id: budget.company_id,
        budget_id: replicationData.budget_id,
        data: {
          base_product_name: baseProduct.name,
          replicated_product_id: replicatedProduct.id,
          quantity: replicationData.quantity,
        },
      },
    ])

    return NextResponse.json({
      success: true,
      data: { 
        replication,
        replicated_product_id: replicatedProduct.id,
      },
    })
  } catch (error) {
    console.error('Erro na API de replicações:', error)
    
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

