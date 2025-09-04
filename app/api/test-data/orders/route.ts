import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST - Criar pedido de teste
export async function POST(request: NextRequest) {
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

    // Criar pedido de teste
    const testOrder = {
      order_number: 'ORD-001',
      customer_name: 'João Silva',
      customer_email: 'joao.silva@email.com',
      customer_phone: '(11) 99999-9999',
      total_amount: 219.80,
      status: 'processing',
      shipping_address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01234-567',
        country: 'Brasil'
      },
      notes: 'Pedido de teste para SwagTrack'
    }

    const { data: newOrder, error: createError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()

    if (createError) {
      console.error('Erro ao criar pedido:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido: ' + createError.message },
        { status: 500 }
      )
    }

    // Criar eventos de tracking
    const trackingEvents = [
      {
        order_id: newOrder[0].id,
        status: 'pending',
        description: 'Pedido criado e aguardando processamento',
        location: 'Centro de Distribuição',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        order_id: newOrder[0].id,
        status: 'processing',
        description: 'Pedido em processamento',
        location: 'Centro de Distribuição',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        order_id: newOrder[0].id,
        status: 'shipped',
        description: 'Pedido enviado para entrega',
        location: 'Centro de Distribuição',
        timestamp: new Date().toISOString()
      }
    ]

    const { data: newEvents, error: eventsError } = await supabase
      .from('order_tracking_events')
      .insert(trackingEvents)
      .select()

    if (eventsError) {
      console.error('Erro ao criar eventos:', eventsError)
      return NextResponse.json(
        { error: 'Pedido criado mas erro ao criar eventos: ' + eventsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: newOrder[0],
      events: newEvents,
      message: 'Pedido de teste criado com sucesso!'
    })

  } catch (error) {
    console.error('Erro na API de dados de teste:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    )
  }
}
