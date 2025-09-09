import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateAndAuthorize } from '@/lib/user-utils'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Listar pedidos
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const user_id = searchParams.get('user_id') || ''

    let query = supabaseService
      .from('orders')
      .select(
        `
        id,
        user_id,
        company_id,
        total_amount,
        points_used,
        payment_method,
        status,
        shipping_address,
        order_number,
        tracking_code,
        created_at,
        updated_at,
        companies!inner(
          id,
          name
        ),
        users!inner(
          id,
          name,
          email
        )
      `,
        { count: 'exact' }
      )
      .eq('company_id', companyId)

    // Aplicar filtros
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,tracking_code.ilike.%${search}%,shipping_address.ilike.%${search}%`
      )
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar pedidos',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    // Calcular estatísticas
    const totalOrders = data?.length || 0
    const pendingOrders = data?.filter(o => o.status === 'pending').length || 0
    const confirmedOrders =
      data?.filter(o => o.status === 'confirmed').length || 0
    const totalValue =
      data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: data,
      meta: {
        stats: {
          totalOrders,
          pendingOrders,
          confirmedOrders,
          totalValue,
        },
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        company_id: companyId,
      },
    })
  } catch (error) {
    console.error('Erro na API de pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar pedido
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      user_id,
      status,
      total_amount,
      points_used,
      currency,
      items,
      shipping_address,
      notes,
    } = body

    // Validações
    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Usuário é obrigatório',
          },
        },
        { status: 400 }
      )
    }

    if (total_amount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valor total deve ser positivo',
          },
        },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const { data: foundUser } = await supabaseService
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single()

    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Usuário não encontrado',
          },
        },
        { status: 400 }
      )
    }

    // Gerar número do pedido e código de rastreamento
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`
    const trackingCode = `TRK-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`

    // Criar pedido
    const { data, error } = await supabaseService
      .from('orders')
      .insert({
        company_id: companyId,
        user_id,
        status: status || 'pending',
        total_amount: total_amount || 0,
        points_used: points_used || 0,
        payment_method: 'mixed',
        shipping_address,
        order_number: orderNumber,
        tracking_code: trackingCode,
      })
      .select(
        `
        id,
        user_id,
        company_id,
        total_amount,
        points_used,
        payment_method,
        status,
        shipping_address,
        order_number,
        tracking_code,
        created_at,
        companies!inner(
          id,
          name
        ),
        users!inner(
          id,
          name,
          email
        )
      `
      )
      .single()

    if (error) {
      console.error('Erro ao criar pedido:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao criar pedido',
            details: error.message,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { order: data },
      message: 'Pedido criado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
