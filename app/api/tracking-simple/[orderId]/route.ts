import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Buscar detalhes do pedido para tracking (versão simplificada)
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Buscar pedido no banco local
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Buscar tracking events do pedido
    const { data: trackingEvents, error: trackingError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', params.orderId)
      .order('timestamp', { ascending: true })

    if (trackingError) {
      console.warn('Erro ao buscar eventos de tracking:', trackingError)
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number || order.id,
        customer_name: order.customer_name || 'Cliente',
        customer_email: order.customer_email || 'cliente@email.com',
        customer_phone: order.customer_phone || '(11) 99999-9999',
        total_amount: order.total_amount || 0,
        status: order.status,
        shipping_address: order.shipping_address || {
          street: 'Endereço não informado',
          city: 'Cidade',
          state: 'SP',
          postal_code: '00000-000',
          country: 'Brasil'
        },
        items: [{
          id: '1',
          name: 'Produto de Teste',
          quantity: 1,
          price: order.total_amount || 0,
        }],
        created_at: order.created_at,
        updated_at: order.updated_at,
        notes: order.notes || 'Pedido de teste para SwagTrack',
      },
      trackingEvents: trackingEvents || [],
    })

  } catch (error) {
    console.error('Erro na API de tracking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    )
  }
}
