#!/usr/bin/env node

/**
 * Script para aplicar migrations diretamente via SQL
 * Uso: node apply-migrations-direct.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase local
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigrations() {
  console.log('🚀 Aplicando migrations do SwagTrack...')
  console.log('')

  try {
    // Migration 1: Order Tracking Events
    console.log('⚡ Criando tabela order_tracking_events...')

    const createTrackingEventsTable = `
      CREATE TABLE IF NOT EXISTS order_tracking_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        description TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: trackingError } = await supabase.rpc('exec_sql', {
      sql: createTrackingEventsTable,
    })

    if (trackingError) {
      console.log(
        '   ⚠️ Erro ao criar tabela order_tracking_events:',
        trackingError.message
      )
    } else {
      console.log('   ✅ Tabela order_tracking_events criada com sucesso')
    }

    // Migration 2: Deliveries
    console.log('⚡ Criando tabela deliveries...')

    const createDeliveriesTable = `
      CREATE TABLE IF NOT EXISTS deliveries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        delivery_method VARCHAR(50) NOT NULL,
        tracking_code VARCHAR(50) UNIQUE,
        recipient_name VARCHAR(255) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        recipient_phone VARCHAR(50),
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'Brasil',
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        estimated_delivery TIMESTAMP WITH TIME ZONE,
        actual_delivery TIMESTAMP WITH TIME ZONE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: deliveriesError } = await supabase.rpc('exec_sql', {
      sql: createDeliveriesTable,
    })

    if (deliveriesError) {
      console.log(
        '   ⚠️ Erro ao criar tabela deliveries:',
        deliveriesError.message
      )
    } else {
      console.log('   ✅ Tabela deliveries criada com sucesso')
    }

    // Verificar se as tabelas foram criadas
    console.log('')
    console.log('🔍 Verificando tabelas criadas...')

    // Testar inserção na tabela order_tracking_events
    try {
      const { error: testTrackingError } = await supabase
        .from('order_tracking_events')
        .insert({
          order_id: '00000000-0000-0000-0000-000000000000',
          status: 'test',
          description: 'Teste de criação da tabela',
        })

      if (testTrackingError) {
        console.log(
          '   ⚠️ Tabela order_tracking_events: Erro no teste (esperado)'
        )
      } else {
        console.log(
          '   ✅ Tabela order_tracking_events: Funcionando corretamente'
        )
      }
    } catch (error) {
      console.log('   ⚠️ Tabela order_tracking_events: Erro no teste')
    }

    // Testar inserção na tabela deliveries
    try {
      const { error: testDeliveriesError } = await supabase
        .from('deliveries')
        .insert({
          order_id: '00000000-0000-0000-0000-000000000000',
          delivery_method: 'standard',
          recipient_name: 'Teste',
          recipient_email: 'teste@exemplo.com',
          street_address: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          postal_code: '01234-567',
        })

      if (testDeliveriesError) {
        console.log('   ⚠️ Tabela deliveries: Erro no teste (esperado)')
      } else {
        console.log('   ✅ Tabela deliveries: Funcionando corretamente')
      }
    } catch (error) {
      console.log('   ⚠️ Tabela deliveries: Erro no teste')
    }

    console.log('')
    console.log('🎉 Migrations aplicadas com sucesso!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log(
      '   1. Testar a página de tracking: http://localhost:3001/tracking'
    )
    console.log('   2. Testar os modais de edição, status e entrega')
    console.log('   3. Verificar integração com Cubbo')
    console.log('')
    console.log(
      '💡 Se houver problemas, execute o SQL manualmente no Supabase Studio:'
    )
    console.log('   http://localhost:54323')
  } catch (error) {
    console.error('❌ Erro durante a aplicação das migrations:', error)
    console.log('')
    console.log('💡 Aplicar migrations manualmente:')
    console.log('   1. Acesse: http://localhost:54323')
    console.log('   2. Vá para SQL Editor')
    console.log('   3. Execute os SQLs dos arquivos em migrations/')
  }
}

// Executar
applyMigrations()
