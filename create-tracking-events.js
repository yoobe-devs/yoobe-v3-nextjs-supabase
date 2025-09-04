#!/usr/bin/env node

/**
 * Script para criar eventos de tracking para o pedido criado
 */

const { createClient } = require('@supabase/supabase-js')

async function createTrackingEvents() {
  console.log('🔧 Criando eventos de tracking...')
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Buscar o pedido criado
    console.log('🔍 Buscando pedido criado...')
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status')
      .limit(1)

    if (ordersError) {
      console.log('❌ Erro ao buscar pedidos:', ordersError.message)
      return
    }

    if (!orders || orders.length === 0) {
      console.log('⚠️ Nenhum pedido encontrado')
      return
    }

    const order = orders[0]
    console.log('✅ Pedido encontrado:', order.id)

    // Verificar se já existem eventos para este pedido
    const { data: existingEvents, error: eventsError } = await supabase
      .from('order_tracking_events')
      .select('id')
      .eq('order_id', order.id)

    if (eventsError) {
      console.log('❌ Erro ao verificar eventos:', eventsError.message)
      return
    }

    if (existingEvents && existingEvents.length > 0) {
      console.log('✅ Eventos já existem para este pedido')
      return
    }

    // Criar eventos de tracking
    console.log('🔧 Criando eventos de tracking...')
    
    const trackingEvents = [
      {
        order_id: order.id,
        status: 'pending',
        description: 'Pedido criado e aguardando processamento',
        location: 'Centro de Distribuição',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        order_id: order.id,
        status: 'processing',
        description: 'Pedido em processamento',
        location: 'Centro de Distribuição',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        order_id: order.id,
        status: 'shipped',
        description: 'Pedido enviado para entrega',
        location: 'Centro de Distribuição',
        timestamp: new Date().toISOString()
      }
    ]

    const { data: newEvents, error: createEventsError } = await supabase
      .from('order_tracking_events')
      .insert(trackingEvents)
      .select()

    if (createEventsError) {
      console.log('❌ Erro ao criar eventos:', createEventsError.message)
      return
    }

    console.log('✅ Eventos de tracking criados com sucesso!')
    console.log(`   Total de eventos: ${newEvents.length}`)
    
    newEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.status} - ${event.description}`)
    })

    console.log('')
    console.log('🎉 Dados de teste criados com sucesso!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log(`   1. Acesse: http://localhost:3001/gestor/swag-track`)
    console.log(`   2. Digite "${order.id}" na busca rápida`)
    console.log('   3. Clique em "Rastrear Pedido"')
    console.log('   4. Veja a timeline de rastreamento!')

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

// Executar
createTrackingEvents()
