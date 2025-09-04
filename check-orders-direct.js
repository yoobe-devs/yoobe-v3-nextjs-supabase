#!/usr/bin/env node

/**
 * Script para verificar pedidos diretamente
 */

const { createClient } = require('@supabase/supabase-js')

async function checkOrdersDirect() {
  console.log('🔍 Verificando pedidos diretamente...')
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Verificar pedidos
    console.log('📋 Verificando tabela orders...')
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(3)

    if (ordersError) {
      console.log('❌ Erro ao buscar pedidos:', ordersError.message)
    } else {
      console.log(`✅ Pedidos encontrados: ${orders.length}`)
      
      if (orders.length > 0) {
        console.log('📊 Estrutura do primeiro pedido:')
        const order = orders[0]
        Object.keys(order).forEach(key => {
          console.log(`   - ${key}: ${order[key]}`)
        })
      }
    }

    // Verificar eventos de tracking
    console.log('')
    console.log('📋 Verificando eventos de tracking...')
    
    const { data: events, error: eventsError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .limit(3)

    if (eventsError) {
      console.log('❌ Erro ao buscar eventos:', eventsError.message)
    } else {
      console.log(`✅ Eventos encontrados: ${events.length}`)
      
      if (events.length > 0) {
        console.log('📊 Estrutura do primeiro evento:')
        const event = events[0]
        Object.keys(event).forEach(key => {
          console.log(`   - ${key}: ${event[key]}`)
        })
      }
    }

    // Se não há pedidos, verificar se há usuários e criar um pedido
    if (!orders || orders.length === 0) {
      console.log('')
      console.log('🔍 Verificando usuários disponíveis...')
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (usersError) {
        console.log('❌ Erro ao buscar usuários:', usersError.message)
      } else if (users && users.length > 0) {
        console.log('✅ Usuário encontrado:', users[0].id)
        
        console.log('🔍 Verificando empresas disponíveis...')
        
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .limit(1)

        if (companiesError) {
          console.log('❌ Erro ao buscar empresas:', companiesError.message)
        } else if (companies && companies.length > 0) {
          console.log('✅ Empresa encontrada:', companies[0].id)
          
          console.log('🔧 Criando pedido com estrutura correta...')
          
          const { data: newOrder, error: createError } = await supabase
            .from('orders')
            .insert([{
              user_id: users[0].id,
              company_id: companies[0].id,
              status: 'pending',
              total_amount: 100.00
            }])
            .select()

          if (createError) {
            console.log('❌ Erro ao criar pedido:', createError.message)
          } else {
            console.log('✅ Pedido criado com sucesso!')
            console.log('📊 Pedido criado:', newOrder[0])
          }
        } else {
          console.log('⚠️ Nenhuma empresa encontrada para criar pedido')
        }
      } else {
        console.log('⚠️ Nenhum usuário encontrado para criar pedido')
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

// Executar
checkOrdersDirect()
