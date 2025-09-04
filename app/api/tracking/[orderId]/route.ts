import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getCubboService } from '@/lib/services/cubbo'

// GET - Buscar detalhes do pedido para tracking
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Buscar pedido no banco local (simplificado para evitar problemas de RLS)
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

    // Se o pedido tem tracking_code, buscar dados da Cubbo
    let cubboTracking = null
    if (order.tracking_code) {
      try {
        const cubboService = getCubboService()
        cubboTracking = await cubboService.getShipmentTracking(order.tracking_code)
      } catch (cubboError) {
        console.warn('Erro ao buscar tracking da Cubbo:', cubboError)
      }
    }

    // Montar resposta com dados completos
    const trackingData = {
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        points_used: order.points_used,
        currency: order.currency,
        created_at: order.created_at,
        updated_at: order.updated_at,
        tracking_code: order.tracking_code,
        shipping_address: order.shipping_address,
        notes: order.notes,
        company: order.companies,
        customer: order.users,
        items: order.order_items
      },
      tracking_events: trackingEvents || [],
      cubbo_tracking: cubboTracking,
      estimated_delivery: order.estimated_delivery,
      actual_delivery: order.actual_delivery
    }

    return NextResponse.json({ 
      success: true,
      data: trackingData 
    })

  } catch (error) {
    console.error('Erro na API de tracking:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

// POST - Atualizar status do pedido (webhook da Cubbo)
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    const { 
      status, 
      tracking_code, 
      estimated_delivery, 
      actual_delivery,
      location,
      description,
      timestamp 
    } = body

    // Atualizar pedido
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (tracking_code) updateData.tracking_code = tracking_code
    if (estimated_delivery) updateData.estimated_delivery = estimated_delivery
    if (actual_delivery) updateData.actual_delivery = actual_delivery

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', params.orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
    }

    // Criar evento de tracking
    const { error: eventError } = await supabase
      .from('order_tracking_events')
      .insert({
        order_id: params.orderId,
        status,
        location,
        description,
        timestamp: timestamp || new Date().toISOString(),
        metadata: {
          tracking_code,
          estimated_delivery,
          actual_delivery
        }
      })

    if (eventError) {
      console.warn('Erro ao criar evento de tracking:', eventError)
    }

    return NextResponse.json({ 
      success: true,
      data: updatedOrder,
      message: 'Status do pedido atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de atualização de tracking:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
