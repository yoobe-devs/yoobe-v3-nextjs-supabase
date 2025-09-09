import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Listar faturas do gestor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // IDs reais da empresa YOOBE
    const yoobeCompanyId = '550e8400-e29b-41d4-a716-446655440001'
    const yoobeManagerId = '264b2045-aacf-4283-a19b-1d3cf5ef96c8'

    let query = supabaseService
      .from('faturas')
      .select(
        `
        *,
        orcamentos (
          id,
          title,
          description,
          status,
          created_at,
          manager_id,
          companies (
            id,
            name
          ),
          stores (
            id,
            name,
            slug
          ),
          users (
            id,
            name,
            email
          )
        ),
        propostas (
          id,
          version,
          status,
          snapshot,
          created_at,
          accepted_at
        ),
        pagamentos (
          id,
          amount,
          status,
          paid_at,
          provider,
          provider_ref
        )
      `
      )
      .eq('orcamentos.company_id', yoobeCompanyId)
      .eq('orcamentos.manager_id', yoobeManagerId)

    // Filtrar por loja se especificado
    if (storeId) {
      query = query.eq('store_id', storeId)
    }

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

    const { data: faturas, error } = await query

    if (error) {
      console.error('Erro ao buscar faturas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar faturas' },
        { status: 500 }
      )
    }

    // Buscar total de registros para paginação
    let countQuery = supabaseService
      .from('faturas')
      .select('*', { count: 'exact', head: true })
      .eq('orcamentos.company_id', yoobeCompanyId)
      .eq('orcamentos.manager_id', yoobeManagerId)

    if (storeId) {
      countQuery = countQuery.eq('store_id', storeId)
    }

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Erro ao contar faturas:', countError)
    }

    // Calcular estatísticas
    const { data: allFaturas, error: statsError } = await supabaseService
      .from('faturas')
      .select('status, total_amount')
      .eq('orcamentos.company_id', yoobeCompanyId)
      .eq('orcamentos.manager_id', yoobeManagerId)

    let stats = {
      total: 0,
      open: 0,
      paid: 0,
      canceled: 0,
      total_amount: 0,
      paid_amount: 0,
    }

    if (!statsError && allFaturas) {
      allFaturas.forEach((fatura: any) => {
        stats.total++
        stats.total_amount += fatura.total_amount

        if (fatura.status === 'open') {
          stats.open++
        } else if (fatura.status === 'paid') {
          stats.paid++
          stats.paid_amount += fatura.total_amount
        } else if (fatura.status === 'canceled') {
          stats.canceled++
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: faturas || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('Erro na API de financeiro do gestor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
