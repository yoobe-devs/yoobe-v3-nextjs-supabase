#!/usr/bin/env node

/**
 * Script para aplicar migrations do SwagTrack usando psql diretamente
 * Uso: node apply-migrations-psql.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function applyMigrationsPSQL() {
  console.log('🚀 Aplicando migrations do SwagTrack via psql...')
  console.log('')

  try {
    // Verificar se o psql está disponível
    console.log('📡 Verificando psql...')
    try {
      execSync('psql --version', { stdio: 'pipe' })
      console.log('   ✅ psql disponível')
    } catch (error) {
      console.log('   ❌ psql não encontrado')
      console.log('   💡 Instale o PostgreSQL ou use Docker')
      return
    }

    // Configurações do banco
    const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
    
    // Migration 1: Order Tracking Events
    console.log('⚡ Aplicando Migration 1: Order Tracking Events...')
    
    const migration1SQL = `
-- Criar tabela de eventos de tracking de pedidos
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_timestamp ON order_tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_status ON order_tracking_events(status);

-- RLS (Row Level Security)
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de eventos de tracking para usuários autenticados
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

-- Política para permitir inserção de eventos de tracking para admins
CREATE POLICY "Admins can insert tracking events" ON order_tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Política para permitir atualização de eventos de tracking para admins
CREATE POLICY "Admins can update tracking events" ON order_tracking_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_order_tracking_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_tracking_events_updated_at
  BEFORE UPDATE ON order_tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_order_tracking_events_updated_at();
`

    // Salvar SQL em arquivo temporário
    const tempFile1 = path.join(__dirname, 'temp_migration1.sql')
    fs.writeFileSync(tempFile1, migration1SQL)

    try {
      execSync(`psql "${DB_URL}" -f "${tempFile1}"`, { stdio: 'inherit' })
      console.log('   ✅ Migration 1 aplicada com sucesso!')
    } catch (error) {
      console.log('   ⚠️ Erro na Migration 1:', error.message)
    }

    // Limpar arquivo temporário
    fs.unlinkSync(tempFile1)

    // Migration 2: Deliveries
    console.log('⚡ Aplicando Migration 2: Deliveries...')
    
    const migration2SQL = `
-- Criar tabela de entregas
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON deliveries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

-- RLS (Row Level Security)
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de entregas para usuários autenticados
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

-- Política para permitir inserção de entregas para admins
CREATE POLICY "Admins can insert deliveries" ON deliveries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Política para permitir atualização de entregas para admins
CREATE POLICY "Admins can update deliveries" ON deliveries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_deliveries_updated_at();
`

    // Salvar SQL em arquivo temporário
    const tempFile2 = path.join(__dirname, 'temp_migration2.sql')
    fs.writeFileSync(tempFile2, migration2SQL)

    try {
      execSync(`psql "${DB_URL}" -f "${tempFile2}"`, { stdio: 'inherit' })
      console.log('   ✅ Migration 2 aplicada com sucesso!')
    } catch (error) {
      console.log('   ⚠️ Erro na Migration 2:', error.message)
    }

    // Limpar arquivo temporário
    fs.unlinkSync(tempFile2)

    console.log('')
    console.log('🎉 Migrations aplicadas!')
    console.log('')
    console.log('🔍 Verificando resultado...')

    // Verificar se as tabelas foram criadas
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
    console.log('   3. Verificar se o PostgreSQL está instalado')
  }
}

// Executar
applyMigrationsPSQL()
