#!/usr/bin/env node

/**
 * Script simples para inserir dados de teste no SwagTrack
 */

const { createClient } = require('@supabase/supabase-js')

async function insertTestData() {
  console.log('🔧 Inserindo dados de teste para SwagTrack...')
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Primeiro, vamos verificar se já existe um pedido
    console.log('🔍 Verificando pedidos existentes...')
    
    const { data: existingOrders, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)

    if (checkError) {
      console.log('❌ Erro ao verificar pedidos:', checkError.message)
      return
    }

    let orderId = null

    if (existingOrders && existingOrders.length > 0) {
      console.log('✅ Pedidos já existem no banco')
      orderId = existingOrders[0].id
    } else {
      console.log('🔧 Criando pedido de teste...')
      
      // Criar pedido simples
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert([{
          order_number: 'ORD-001',
          customer_name: 'João Silva',
          customer_email: 'joao.silva@email.com',
          total_amount: 219.80,
          status: 'processing'
        }])
        .select()

      if (createError) {
        console.log('❌ Erro ao criar pedido:', createError.message)
        return
      }

      console.log('✅ Pedido criado com sucesso!')
      orderId = newOrder[0].id
    }

    // Verificar eventos de tracking
    console.log('🔍 Verificando eventos de tracking...')
    
    const { data: existingEvents, error: eventsError } = await supabase
      .from('order_tracking_events')
      .select('id')
      .eq('order_id', orderId)

    if (eventsError) {
      console.log('❌ Erro ao verificar eventos:', eventsError.message)
      return
    }

    if (existingEvents && existingEvents.length > 0) {
      console.log('✅ Eventos de tracking já existem')
    } else {
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
    }

    console.log('')
    console.log('🎉 Dados de teste criados com sucesso!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Acesse: http://localhost:3001/gestor/swag-track')
    console.log('   2. Digite "ORD-001" na busca rápida')
    console.log('   3. Clique em "Rastrear Pedido"')
    console.log('   4. Veja a timeline de rastreamento!')

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

// Executar
insertTestData()
