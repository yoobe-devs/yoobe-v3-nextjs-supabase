import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Criar nova entrega
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário é admin ou manager
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (
      !['admin', 'admin_global', 'superadmin', 'manager'].includes(
        userData.role
      )
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { order_id, delivery_method, recipient, address, notes } = body

    // Validações
    if (!order_id || !delivery_method || !recipient || !address) {
      return NextResponse.json(
        {
          error: 'Dados obrigatórios não fornecidos',
        },
        { status: 400 }
      )
    }

    if (!recipient.name || !recipient.email) {
      return NextResponse.json(
        {
          error: 'Nome e email do destinatário são obrigatórios',
        },
        { status: 400 }
      )
    }

    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.postal_code
    ) {
      return NextResponse.json(
        {
          error: 'Endereço completo é obrigatório',
        },
        { status: 400 }
      )
    }

    // Verificar se o pedido existe e pertence à empresa do usuário
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, company_id, status')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissão para acessar o pedido
    if (
      userData.role === 'manager' &&
      order.company_id !== userData.company_id
    ) {
      return NextResponse.json(
        { error: 'Acesso negado ao pedido' },
        { status: 403 }
      )
    }

    // Gerar código de rastreamento
    const trackingCode = `BR${Date.now().toString().slice(-8)}BR`

    // Criar nova entrega
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert({
        order_id,
        delivery_method,
        tracking_code: trackingCode,
        recipient_name: recipient.name,
        recipient_email: recipient.email,
        recipient_phone: recipient.phone || null,
        street_address: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country || 'Brasil',
        notes: notes || null,
        status: 'pending',
        created_by: user.id,
      })
      .select()
      .single()

    if (deliveryError) {
      console.error('Erro ao criar entrega:', deliveryError)
      return NextResponse.json(
        { error: 'Erro ao criar entrega' },
        { status: 500 }
      )
    }

    // Atualizar status do pedido para "shipped" se ainda não estiver
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      await supabase
        .from('orders')
        .update({
          status: 'shipped',
          tracking_code: trackingCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id)
    }

    // Criar evento de tracking
    await supabase.from('order_tracking_events').insert({
      order_id,
      status: 'shipped',
      location: `${address.city}, ${address.state}`,
      description: `Nova entrega criada - ${delivery_method}`,
      metadata: {
        delivery_id: delivery.id,
        tracking_code: trackingCode,
        delivery_method,
      },
    })

    return NextResponse.json({
      success: true,
      data: delivery,
      message: 'Nova entrega criada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de entregas:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// GET - Listar entregas
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const status = searchParams.get('status')

    // Construir query
    let query = supabase.from('deliveries').select(`
        *,
        orders(
          id,
          order_number,
          status,
          companies(name)
        )
      `)

    // Aplicar filtros
    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Executar query
    const { data: deliveries, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      console.error('Erro ao buscar entregas:', error)
      return NextResponse.json(
        {
          error: 'Erro ao buscar entregas',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deliveries || [],
      count: deliveries?.length || 0,
    })
  } catch (error) {
    console.error('Erro na API de listagem de entregas:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
