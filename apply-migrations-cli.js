#!/usr/bin/env node

/**
 * Script para aplicar migrations usando Supabase CLI
 * Uso: node apply-migrations-cli.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function applyMigrationsCLI() {
  console.log('🚀 Aplicando migrations do SwagTrack via Supabase CLI...')
  console.log('')

  try {
    // Verificar se o Supabase CLI está disponível
    console.log('📡 Verificando Supabase CLI...')
    try {
      execSync('supabase --version', { stdio: 'pipe' })
      console.log('   ✅ Supabase CLI disponível')
    } catch (error) {
      console.log('   ❌ Supabase CLI não encontrado')
      console.log('   💡 Instale com: npm install -g supabase')
      return
    }

    // Verificar se o projeto está inicializado
    console.log('🔍 Verificando projeto Supabase...')
    try {
      execSync('supabase status', { stdio: 'pipe' })
      console.log('   ✅ Projeto Supabase ativo')
    } catch (error) {
      console.log('   ❌ Projeto Supabase não está rodando')
      console.log('   💡 Execute: supabase start')
      return
    }

    // Criar arquivos de migration no formato do Supabase CLI
    console.log('📝 Criando arquivos de migration...')
    
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations')
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true })
    }

    // Migration 1: Order Tracking Events
    const timestamp1 = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
    const migration1File = path.join(migrationsDir, `${timestamp1}_create_order_tracking_events.sql`)
    
    const migration1SQL = `
-- Create order_tracking_events table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_timestamp ON order_tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_status ON order_tracking_events(status);

-- Enable RLS
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view tracking events for their orders" ON order_tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking_events.order_id 
      AND (
        orders.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Admins can insert tracking events" ON order_tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

CREATE POLICY "Admins can update tracking events" ON order_tracking_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Create trigger function
CREATE OR REPLACE FUNCTION update_order_tracking_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_order_tracking_events_updated_at
  BEFORE UPDATE ON order_tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_order_tracking_events_updated_at();
`

    fs.writeFileSync(migration1File, migration1SQL)
    console.log(`   ✅ Migration 1 criada: ${path.basename(migration1File)}`)

    // Migration 2: Deliveries
    const timestamp2 = new Date(Date.now() + 1000).toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
    const migration2File = path.join(migrationsDir, `${timestamp2}_create_deliveries_table.sql`)
    
    const migration2SQL = `
-- Create deliveries table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON deliveries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

-- Enable RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view deliveries for their orders" ON deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND (
        orders.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Admins can insert deliveries" ON deliveries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

CREATE POLICY "Admins can update deliveries" ON deliveries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Create trigger function
CREATE OR REPLACE FUNCTION update_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_deliveries_updated_at();
`

    fs.writeFileSync(migration2File, migration2SQL)
    console.log(`   ✅ Migration 2 criada: ${path.basename(migration2File)}`)

    // Aplicar migrations via CLI
    console.log('')
    console.log('⚡ Aplicando migrations via Supabase CLI...')
    
    try {
      execSync('supabase db reset', { stdio: 'inherit' })
      console.log('   ✅ Migrations aplicadas com sucesso!')
    } catch (error) {
      console.log('   ⚠️ Erro ao aplicar migrations:', error.message)
      console.log('   💡 Tente executar manualmente: supabase db reset')
    }

    // Verificar se as tabelas foram criadas
    console.log('')
    console.log('🔍 Verificando tabelas criadas...')
    
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        'http://127.0.0.1:54321',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      )

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
    } catch (error) {
      console.log('   ⚠️ Erro ao verificar tabelas:', error.message)
    }

    console.log('')
    console.log('🎉 Processo de migration concluído!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Testar a página de tracking: http://localhost:3001/tracking')
    console.log('   2. Testar os modais de edição, status e entrega')
    console.log('   3. Verificar integração com Cubbo')

  } catch (error) {
    console.error('❌ Erro durante a aplicação das migrations:', error)
    console.log('')
    console.log('💡 Soluções alternativas:')
    console.log('   1. Aplicar migrations manualmente no Supabase Studio')
    console.log('   2. Usar o arquivo APLICAR_MIGRATIONS_MANUAL.md')
    console.log('   3. Verificar se o Supabase está rodando: supabase start')
  }
}

// Executar
applyMigrationsCLI()
