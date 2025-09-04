#!/usr/bin/env node

/**
 * Script para verificar pedidos no banco de dados
 */

const { createClient } = require('@supabase/supabase-js')

async function checkOrdersDatabase() {
  console.log('🔍 Verificando pedidos no banco de dados...')
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Verificar se a tabela orders existe
    console.log('📋 Verificando tabela orders...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)

    if (ordersError) {
      console.log('❌ Erro ao buscar pedidos:', ordersError.message)
      return
    }

    console.log(`✅ Tabela orders encontrada`)
    console.log(`📊 Total de pedidos: ${orders.length}`)
    console.log('')

    if (orders.length > 0) {
      console.log('📦 Pedidos encontrados:')
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ID: ${order.id}`)
        console.log(`      Número: ${order.order_number || 'N/A'}`)
        console.log(`      Cliente: ${order.customer_name || 'N/A'}`)
        console.log(`      Status: ${order.status || 'N/A'}`)
        console.log(`      Total: R$ ${order.total_amount || 0}`)
        console.log('')
      })
    } else {
      console.log('⚠️ Nenhum pedido encontrado no banco')
      console.log('')
    }

    // Verificar eventos de tracking
    console.log('📋 Verificando eventos de tracking...')
    const { data: trackingEvents, error: trackingError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .limit(5)

    if (trackingError) {
      console.log('❌ Erro ao buscar eventos de tracking:', trackingError.message)
    } else {
      console.log(`✅ Tabela order_tracking_events encontrada`)
      console.log(`📊 Total de eventos: ${trackingEvents.length}`)
      
      if (trackingEvents.length > 0) {
        console.log('📦 Eventos encontrados:')
        trackingEvents.forEach((event, index) => {
          console.log(`   ${index + 1}. ID: ${event.id}`)
          console.log(`      Pedido: ${event.order_id}`)
          console.log(`      Status: ${event.status}`)
          console.log(`      Descrição: ${event.description || 'N/A'}`)
          console.log(`      Data: ${event.timestamp}`)
          console.log('')
        })
      } else {
        console.log('⚠️ Nenhum evento de tracking encontrado')
      }
    }

    // Criar pedido de teste se não existir
    if (orders.length === 0) {
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
      } else {
        console.log('✅ Pedido de teste criado com sucesso!')
        console.log(`   ID: ${newOrder[0].id}`)
        console.log(`   Número: ${newOrder[0].order_number}`)
        
        // Criar eventos de tracking
        console.log('🔧 Criando eventos de tracking...')
        
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
          console.log('❌ Erro ao criar eventos de tracking:', eventsError.message)
        } else {
          console.log('✅ Eventos de tracking criados com sucesso!')
          console.log(`   Total de eventos: ${newEvents.length}`)
        }
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

// Executar
checkOrdersDatabase()
