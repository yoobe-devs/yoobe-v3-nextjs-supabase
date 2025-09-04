#!/usr/bin/env node

/**
 * Script para verificar a estrutura da tabela orders
 */

const { createClient } = require('@supabase/supabase-js')

async function checkOrdersStructure() {
  console.log('🔍 Verificando estrutura da tabela orders...')
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Verificar se a tabela orders existe e buscar uma amostra
    console.log('📋 Verificando tabela orders...')
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)

    if (ordersError) {
      console.log('❌ Erro ao acessar tabela orders:', ordersError.message)
      
      // Tentar verificar se a tabela existe
      console.log('🔍 Verificando se a tabela existe...')
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%order%')

      if (tablesError) {
        console.log('❌ Erro ao verificar tabelas:', tablesError.message)
      } else {
        console.log('📋 Tabelas relacionadas a orders encontradas:')
        tables.forEach(table => {
          console.log(`   - ${table.table_name}`)
        })
      }
      return
    }

    console.log('✅ Tabela orders encontrada!')
    
    if (orders && orders.length > 0) {
      console.log('📊 Estrutura da tabela orders:')
      const order = orders[0]
      Object.keys(order).forEach(key => {
        console.log(`   - ${key}: ${typeof order[key]} (${order[key]})`)
      })
    } else {
      console.log('⚠️ Tabela orders está vazia')
    }

    // Verificar tabela order_tracking_events
    console.log('')
    console.log('📋 Verificando tabela order_tracking_events...')
    
    const { data: events, error: eventsError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .limit(1)

    if (eventsError) {
      console.log('❌ Erro ao acessar tabela order_tracking_events:', eventsError.message)
    } else {
      console.log('✅ Tabela order_tracking_events encontrada!')
      
      if (events && events.length > 0) {
        console.log('📊 Estrutura da tabela order_tracking_events:')
        const event = events[0]
        Object.keys(event).forEach(key => {
          console.log(`   - ${key}: ${typeof event[key]} (${event[key]})`)
        })
      } else {
        console.log('⚠️ Tabela order_tracking_events está vazia')
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

// Executar
checkOrdersStructure()
