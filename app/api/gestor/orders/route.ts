import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize } from '@/lib/user-utils'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar pedidos da empresa do gestor
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: authResult.error },
        },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const companyId = user.company_id

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Query base para pedidos
    let query = supabaseService
      .from('orders')
      .select(
        `
        *,
        users (
          id,
          name,
          email
        ),
        order_items (
          id,
          quantity,
          unit_price,
          points_cost,
          company_products (
            id,
            name,
            image_url
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,tracking_code.ilike.%${search}%,shipping_address.ilike.%${search}%`
      )
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Paginação
    const startIndex = (page - 1) * limit
    query = query.range(startIndex, startIndex + limit - 1)

    const { data: orders, error: ordersError, count } = await query

    if (ordersError) {
      console.error('Erro ao buscar pedidos:', ordersError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar pedidos',
            details: ordersError.message,
          },
        },
        { status: 500 }
      )
    }

    // Calcular estatísticas
    const stats = {
      total: count || 0,
      byStatus: {},
      totalValue: 0,
    }

    orders?.forEach(order => {
      stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1
      stats.totalValue += order.total_amount || 0
    })

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats,
        company_id: companyId,
      },
    })
  } catch (error) {
    console.error('Erro na API de pedidos do gestor:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
      },
      { status: 500 }
    )
  }
}
