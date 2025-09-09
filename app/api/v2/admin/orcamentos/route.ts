import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Listar orçamentos para o admin (pipeline CRM)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabaseService.from('budgets').select('*')

    // Filtrar por status se especificado
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Ordenar por data de criação (mais recentes primeiro)
    query = query.order('created_at', { ascending: false })

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: orcamentos, error } = await query

    if (error) {
      console.error('Erro ao buscar orçamentos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar orçamentos' },
        { status: 500 }
      )
    }

    // Enriquecer dados com relacionamentos
    const enrichedOrcamentos = await Promise.all(
      (orcamentos || []).map(async orcamento => {
        // Buscar itens do orçamento
        const { data: budgetItems } = await supabaseService
          .from('budget_items')
          .select(
            `
            id,
            base_product_id,
            quantity,
            custom_price,
            custom_points_cost,
            notes,
            base_products (
              id,
              name,
              base_price,
              base_points_cost
            )
          `
          )
          .eq('budget_id', orcamento.id)

        // Buscar empresa
        const { data: company } = await supabaseService
          .from('companies')
          .select('id, name')
          .eq('id', orcamento.company_id)
          .single()

        // Buscar usuário (manager)
        const { data: user } = await supabaseService
          .from('users')
          .select('id, name, email')
          .eq('id', orcamento.manager_id)
          .single()

        return {
          ...orcamento,
          budget_items: budgetItems || [],
          companies: company,
          users: user,
        }
      })
    )

    // Buscar total de registros para paginação
    let countQuery = supabaseService
      .from('budgets')
      .select('*', { count: 'exact', head: true })

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Erro ao contar orçamentos:', countError)
    }

    // Agrupar por status para estatísticas
    const { data: statusCounts, error: statusError } = await supabaseService
      .from('budgets')
      .select('status')
      .not('status', 'is', null)

    let statusStats: Record<string, number> = {}
    if (!statusError && statusCounts) {
      statusCounts.forEach((item: any) => {
        statusStats[item.status] = (statusStats[item.status] || 0) + 1
      })
    }

    return NextResponse.json({
      success: true,
      data: enrichedOrcamentos,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      statusStats,
    })
  } catch (error) {
    console.error('Erro na API de orçamentos admin v2:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
