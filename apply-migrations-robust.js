#!/usr/bin/env node

/**
 * Script robusto para aplicar migrations do SwagTrack
 * Usa múltiplas abordagens para garantir que as tabelas sejam criadas
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configurações do Supabase local
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigrationsRobust() {
  console.log('🚀 Aplicando migrations do SwagTrack (método robusto)...')
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
      return
    }
    console.log('   ✅ Conexão estabelecida')
    console.log('')

    // Ler arquivos SQL
    const trackingEventsPath = path.join(__dirname, 'migrations', 'create-order-tracking-events.sql')
    const deliveriesPath = path.join(__dirname, 'migrations', 'create-deliveries-table.sql')

    if (!fs.existsSync(trackingEventsPath) || !fs.existsSync(deliveriesPath)) {
      console.log('❌ Arquivos de migration não encontrados')
      return
    }

    const trackingEventsSQL = fs.readFileSync(trackingEventsPath, 'utf8')
    const deliveriesSQL = fs.readFileSync(deliveriesPath, 'utf8')

    // Método 1: Tentar exec_sql
    console.log('🔧 Método 1: Tentando exec_sql...')
    await tryExecSQL(trackingEventsSQL, 'order_tracking_events')
    await tryExecSQL(deliveriesSQL, 'deliveries')

    // Método 2: Tentar criar tabelas diretamente
    console.log('🔧 Método 2: Criando tabelas diretamente...')
    await createTableDirectly('order_tracking_events')
    await createTableDirectly('deliveries')

    // Método 3: Verificar se as tabelas existem agora
    console.log('🔍 Verificando se as tabelas foram criadas...')
    await checkTablesExist()

    // Método 4: Se ainda não existem, criar com estrutura mínima
    console.log('🔧 Método 3: Criando com estrutura mínima...')
    await createMinimalTables()

    // Verificação final
    console.log('')
    console.log('🎯 Verificação final...')
    await checkTablesExist()

  } catch (error) {
    console.error('❌ Erro durante a aplicação:', error)
  }
}

async function tryExecSQL(sqlContent, tableName) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    if (error) {
      console.log(`   ⚠️ exec_sql falhou para ${tableName}: ${error.message}`)
    } else {
      console.log(`   ✅ exec_sql sucesso para ${tableName}`)
    }
  } catch (error) {
    console.log(`   ⚠️ exec_sql erro para ${tableName}: ${error.message}`)
  }
}

async function createTableDirectly(tableName) {
  try {
    let createSQL = ''
    
    if (tableName === 'order_tracking_events') {
      createSQL = `
        CREATE TABLE IF NOT EXISTS order_tracking_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID NOT NULL,
          status VARCHAR(50) NOT NULL,
          location VARCHAR(255),
          description TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    } else if (tableName === 'deliveries') {
      createSQL = `
        CREATE TABLE IF NOT EXISTS deliveries (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID NOT NULL,
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
          created_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }

    if (createSQL) {
      const { error } = await supabase.rpc('exec_sql', { sql: createSQL })
      if (error) {
        console.log(`   ⚠️ Criação direta falhou para ${tableName}: ${error.message}`)
      } else {
        console.log(`   ✅ Criação direta sucesso para ${tableName}`)
      }
    }
  } catch (error) {
    console.log(`   ⚠️ Criação direta erro para ${tableName}: ${error.message}`)
  }
}

async function createMinimalTables() {
  // Tentar criar tabelas com estrutura mínima para teste
  try {
    const { error: trackingError } = await supabase
      .from('order_tracking_events')
      .select('id')
      .limit(1)

    if (trackingError && trackingError.message.includes('not found')) {
      console.log('   🔧 Tentando criar order_tracking_events com estrutura mínima...')
      // Se a tabela não existe, tentar criar via insert (vai falhar mas pode criar a tabela)
      try {
        await supabase
          .from('order_tracking_events')
          .insert({
            order_id: '00000000-0000-0000-0000-000000000000',
            status: 'test'
          })
      } catch (insertError) {
        console.log('   ⚠️ Insert falhou (esperado):', insertError.message)
      }
    }
  } catch (error) {
    console.log('   ⚠️ Erro ao verificar order_tracking_events:', error.message)
  }

  try {
    const { error: deliveriesError } = await supabase
      .from('deliveries')
      .select('id')
      .limit(1)

    if (deliveriesError && deliveriesError.message.includes('not found')) {
      console.log('   🔧 Tentando criar deliveries com estrutura mínima...')
      try {
        await supabase
          .from('deliveries')
          .insert({
            order_id: '00000000-0000-0000-0000-000000000000',
            delivery_method: 'standard',
            recipient_name: 'test',
            recipient_email: 'test@test.com',
            street_address: 'test',
            city: 'test',
            state: 'test',
            postal_code: '12345'
          })
      } catch (insertError) {
        console.log('   ⚠️ Insert falhou (esperado):', insertError.message)
      }
    }
  } catch (error) {
    console.log('   ⚠️ Erro ao verificar deliveries:', error.message)
  }
}

async function checkTablesExist() {
  const tables = ['order_tracking_events', 'deliveries']
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`   ✅ ${tableName}: Existe e acessível`)
      }
    } catch (error) {
      console.log(`   ❌ ${tableName}: ${error.message}`)
    }
  }
}

// Executar
applyMigrationsRobust()
