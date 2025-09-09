import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Função para verificar autenticação
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        const {
          data: { user: tokenUser },
          error: tokenError,
        } = await supabaseService.auth.getUser(token)

        if (!tokenError && tokenUser) {
          user = tokenUser
          authError = null
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }
  }

  return { user, error: authError }
}

// GET - Listar produtos replicados de orçamentos
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    if (!['admin', 'superadmin', 'manager', 'gestor'].includes(userRole)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa não encontrado' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const budgetId = searchParams.get('budget_id')
    const status = searchParams.get('status') || 'all'

    // Construir query base
    let query = supabaseService
      .from('store_products')
      .select(`
        id,
        name,
        price,
        points_cost,
        quantity_available,
        is_active,
        source,
        budget_id,
        created_at,
        updated_at,
        budgets (
          id,
          title,
          status,
          total_amount
        )
      `)
      .eq('store_id', companyId)
      .eq('source', 'budget_approved')

    // Filtrar por orçamento específico se fornecido
    if (budgetId) {
      query = query.eq('budget_id', budgetId)
    }

    // Filtrar por status
    if (status !== 'all') {
      if (status === 'active') {
        query = query.eq('is_active', true)
      } else if (status === 'inactive') {
        query = query.eq('is_active', false)
      }
    }

    const { data: products, error: productsError } = await query
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao buscar produtos replicados:', productsError)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos replicados' },
        { status: 500 }
      )
    }

    // Estatísticas
    const stats = {
      total: products.length,
      active: products.filter(p => p.is_active).length,
      inactive: products.filter(p => !p.is_active).length,
      total_value: products.reduce((sum, p) => sum + (p.price * p.quantity_available), 0)
    }

    return NextResponse.json({
      success: true,
      data: products,
      stats
    })

  } catch (error) {
    console.error('Erro na API de produtos replicados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Ativar/desativar produto replicado
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    if (!['admin', 'superadmin', 'manager', 'gestor'].includes(userRole)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { product_id, is_active } = body

    if (!product_id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'ID do produto e status são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar status do produto
    const { data: updatedProduct, error: updateError } = await supabaseService
      .from('store_products')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', product_id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      )
    }

    // Log da ação
    await supabaseService
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: is_active ? 'product_activated' : 'product_deactivated',
        resource_type: 'store_product',
        resource_id: product_id,
        details: {
          product_name: updatedProduct.name,
          new_status: is_active
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: `Produto ${is_active ? 'ativado' : 'desativado'} com sucesso`,
      data: updatedProduct
    })

  } catch (error) {
    console.error('Erro na API de atualização de produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
