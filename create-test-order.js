#!/usr/bin/env node

/**
 * Script para criar pedido de teste e eventos de tracking
 */

const { createClient } = require('@supabase/supabase-js')

async function createTestOrder() {
  console.log('🔧 Criando pedido de teste para SwagTrack...')
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Primeiro, vamos verificar se já existe um pedido ORD-001
    console.log('🔍 Verificando se pedido ORD-001 já existe...')
    
    const { data: existingOrders, error: checkError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('order_number', 'ORD-001')

    if (checkError) {
      console.log('⚠️ Erro ao verificar pedidos existentes:', checkError.message)
      console.log('Continuando com a criação...')
    } else if (existingOrders && existingOrders.length > 0) {
      console.log('✅ Pedido ORD-001 já existe!')
      console.log(`   ID: ${existingOrders[0].id}`)
      
      // Verificar eventos de tracking
      const { data: events, error: eventsError } = await supabase
        .from('order_tracking_events')
        .select('*')
        .eq('order_id', existingOrders[0].id)

      if (eventsError) {
        console.log('⚠️ Erro ao verificar eventos:', eventsError.message)
      } else {
        console.log(`📊 Eventos de tracking: ${events.length}`)
        if (events.length === 0) {
          console.log('🔧 Criando eventos de tracking...')
          await createTrackingEvents(supabase, existingOrders[0].id)
        }
      }
      return
    }

    // Criar pedido de teste
    console.log('🔧 Criando pedido de teste...')
    
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
      items: [
        {
          id: '1',
          name: 'Camiseta Join Tech',
          quantity: 1,
          price: 89.90
        },
        {
          id: '2',
          name: 'Mochila Corporativa',
          quantity: 1,
          price: 129.90
        }
      ],
      notes: 'Pedido de teste para SwagTrack'
    }

    const { data: newOrder, error: createError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()

    if (createError) {
      console.log('❌ Erro ao criar pedido de teste:', createError.message)
      return
    }

    console.log('✅ Pedido de teste criado com sucesso!')
    console.log(`   ID: ${newOrder[0].id}`)
    console.log(`   Número: ${newOrder[0].order_number}`)
    
    // Criar eventos de tracking
    await createTrackingEvents(supabase, newOrder[0].id)

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

async function createTrackingEvents(supabase, orderId) {
  console.log('🔧 Criando eventos de tracking...')
  
  const trackingEvents = [
    {
      order_id: orderId,
      status: 'pending',
      description: 'Pedido criado e aguardando processamento',
      location: 'Centro de Distribuição',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      order_id: orderId,
      status: 'processing',
      description: 'Pedido em processamento',
      location: 'Centro de Distribuição',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      order_id: orderId,
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
    console.log('❌ Erro ao criar eventos de tracking:', eventsError.message)
  } else {
    console.log('✅ Eventos de tracking criados com sucesso!')
    console.log(`   Total de eventos: ${newEvents.length}`)
    
    newEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.status} - ${event.description}`)
    })
  }
}

// Executar
createTestOrder()
