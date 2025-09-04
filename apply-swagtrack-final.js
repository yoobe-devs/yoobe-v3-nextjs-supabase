#!/usr/bin/env node

/**
 * Script final para aplicar migrations do SwagTrack
 * Usa uma abordagem mais simples e direta
 * Uso: node apply-swagtrack-final.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase local
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applySwagTrackFinal() {
  console.log('🚀 Aplicando migrations do SwagTrack (método final)...')
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
      
      // Tentar criar tabela users básica
      try {
        const { error: createUsersError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              email VARCHAR(255) UNIQUE NOT NULL,
              role VARCHAR(50) DEFAULT 'user',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        })
        
        if (createUsersError) {
          console.log('   ⚠️ Não foi possível criar tabela users:', createUsersError.message)
        } else {
          console.log('   ✅ Tabela users criada')
        }
      } catch (error) {
        console.log('   ⚠️ Erro ao criar users:', error.message)
      }

      // Tentar criar tabela orders básica
      try {
        const { error: createOrdersError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS orders (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES users(id),
              order_number VARCHAR(100) UNIQUE,
              status VARCHAR(50) DEFAULT 'pending',
              total_amount DECIMAL(10,2) DEFAULT 0.00,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        })
        
        if (createOrdersError) {
          console.log('   ⚠️ Não foi possível criar tabela orders:', createOrdersError.message)
        } else {
          console.log('   ✅ Tabela orders criada')
        }
      } catch (error) {
        console.log('   ⚠️ Erro ao criar orders:', error.message)
      }
    } else {
      console.log('   ✅ Conexão estabelecida')
    }
    console.log('')

    // Migration 1: Order Tracking Events
    console.log('⚡ Aplicando Migration 1: Order Tracking Events...')
    
    const migration1SQL = `
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

CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_timestamp ON order_tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_status ON order_tracking_events(status);

ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service role" ON order_tracking_events
  FOR ALL USING (true) WITH CHECK (true);
`

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migration1SQL })
      if (error) {
        console.log('   ⚠️ Migration 1 falhou:', error.message)
      } else {
        console.log('   ✅ Migration 1 aplicada com sucesso!')
      }
    } catch (error) {
      console.log('   ⚠️ Migration 1 erro:', error.message)
    }

    // Migration 2: Deliveries
    console.log('⚡ Aplicando Migration 2: Deliveries...')
    
    const migration2SQL = `
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

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON deliveries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service role" ON deliveries
  FOR ALL USING (true) WITH CHECK (true);
`

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migration2SQL })
      if (error) {
        console.log('   ⚠️ Migration 2 falhou:', error.message)
      } else {
        console.log('   ✅ Migration 2 aplicada com sucesso!')
      }
    } catch (error) {
      console.log('   ⚠️ Migration 2 erro:', error.message)
    }

    console.log('')
    console.log('🔍 Verificando resultado...')
    
    // Verificar se as tabelas foram criadas
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
          console.log(`   ✅ ${tableName}: Criada e acessível`)
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
      }
    }

    console.log('')
    console.log('🎉 Processo de migration concluído!')
    console.log('')
    console.log('🚀 Próximos passos:')
    console.log('   1. Testar a página de tracking: http://localhost:3001/tracking')
    console.log('   2. Testar os modais de edição, status e entrega')
    console.log('   3. Verificar integração com Cubbo')

  } catch (error) {
    console.error('❌ Erro durante a aplicação das migrations:', error)
    console.log('')
    console.log('💡 Soluções alternativas:')
    console.log('   1. Aplicar migrations manualmente no Supabase Studio')
    console.log('   2. Usar o arquivo APLICAR_SWAGTRACK_MANUAL_FINAL.md')
    console.log('   3. Verificar se o Supabase está rodando: supabase start')
  }
}

// Executar
applySwagTrackFinal()
