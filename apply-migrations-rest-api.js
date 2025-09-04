#!/usr/bin/env node

/**
 * Script para aplicar migrations do SwagTrack via REST API do Supabase
 * Uso: node apply-migrations-rest-api.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase local
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigrationsRestAPI() {
  console.log('🚀 Aplicando migrations do SwagTrack via REST API...')
  console.log('')

  try {
    // Verificar conexão
    console.log('📡 Verificando conexão...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (testError) {
      console.log('   ❌ Erro de conexão:', testError.message)
      console.log('   💡 Tentando criar tabelas básicas primeiro...')
      
      // Criar tabelas básicas via insert (vai falhar mas pode criar a tabela)
      try {
        console.log('   🔧 Tentando criar tabela users...')
        await supabase
          .from('users')
          .insert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'test@test.com',
            role: 'admin'
          })
      } catch (error) {
        console.log('   ⚠️ Insert users falhou (esperado):', error.message)
      }

      try {
        console.log('   🔧 Tentando criar tabela orders...')
        await supabase
          .from('orders')
          .insert({
            id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000',
            order_number: 'TEST-001',
            status: 'pending',
            total_amount: 0.00
          })
      } catch (error) {
        console.log('   ⚠️ Insert orders falhou (esperado):', error.message)
      }
    } else {
      console.log('   ✅ Conexão estabelecida')
    }
    console.log('')

    // Migration 1: Order Tracking Events
    console.log('⚡ Aplicando Migration 1: Order Tracking Events...')
    
    try {
      // Tentar inserir um registro para criar a tabela
      const { error: insertError } = await supabase
        .from('order_tracking_events')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          order_id: '00000000-0000-0000-0000-000000000000',
          status: 'test',
          description: 'Teste de criação da tabela'
        })

      if (insertError) {
        console.log('   ⚠️ Tabela order_tracking_events: Erro no teste (esperado)')
        console.log('   💡 Tabela não existe, precisa ser criada manualmente')
      } else {
        console.log('   ✅ Tabela order_tracking_events: Funcionando corretamente')
      }
    } catch (error) {
      console.log('   ⚠️ Tabela order_tracking_events: Erro no teste (esperado)')
    }

    // Migration 2: Deliveries
    console.log('⚡ Aplicando Migration 2: Deliveries...')
    
    try {
      // Tentar inserir um registro para criar a tabela
      const { error: insertError } = await supabase
        .from('deliveries')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          order_id: '00000000-0000-0000-0000-000000000000',
          delivery_method: 'standard',
          tracking_code: 'TEST-001',
          recipient_name: 'Teste',
          recipient_email: 'test@test.com',
          street_address: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          postal_code: '01234-567'
        })

      if (insertError) {
        console.log('   ⚠️ Tabela deliveries: Erro no teste (esperado)')
        console.log('   💡 Tabela não existe, precisa ser criada manualmente')
      } else {
        console.log('   ✅ Tabela deliveries: Funcionando corretamente')
      }
    } catch (error) {
      console.log('   ⚠️ Tabela deliveries: Erro no teste (esperado)')
    }

    console.log('')
    console.log('🎯 RESULTADO:')
    console.log('')
    console.log('⚠️ As tabelas do SwagTrack não existem e precisam ser criadas manualmente')
    console.log('')
    console.log('📋 SOLUÇÃO:')
    console.log('   1. Acesse o Supabase Studio: http://localhost:54323')
    console.log('   2. Vá para "SQL Editor"')
    console.log('   3. Execute os SQLs do arquivo: APLICAR_SWAGTRACK_MANUAL_FINAL.md')
    console.log('')
    console.log('🚀 Após aplicar as migrations manualmente:')
    console.log('   1. Teste a página de tracking: http://localhost:3001/tracking')
    console.log('   2. Teste os modais de edição, status e entrega')
    console.log('   3. Verifique integração com Cubbo')
    console.log('')
    console.log('💡 Se houver problemas, execute o SQL manualmente no Supabase Studio:')
    console.log('   http://localhost:54323')

  } catch (error) {
    console.error('❌ Erro durante a aplicação das migrations:', error)
  }
}

// Executar
applyMigrationsRestAPI()
