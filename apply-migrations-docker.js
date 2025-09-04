#!/usr/bin/env node

/**
 * Script para aplicar migrations do SwagTrack via Docker exec
 * Usa uma abordagem mais direta com o container do PostgreSQL
 * Uso: node apply-migrations-docker.js
 */

const { execSync } = require('child_process')

async function applyMigrationsDocker() {
  console.log('🚀 Aplicando migrations do SwagTrack via Docker...')
  console.log('')

  try {
    // Verificar se o Docker está disponível
    console.log('📡 Verificando Docker...')
    try {
      execSync('docker --version', { stdio: 'pipe' })
      console.log('   ✅ Docker disponível')
    } catch (error) {
      console.log('   ❌ Docker não encontrado')
      console.log('   💡 Instale o Docker ou use outro método')
      return
    }

    // Encontrar o container do PostgreSQL do Supabase
    console.log('🔍 Procurando container do PostgreSQL...')
    try {
      const containers = execSync('docker ps --format "table {{.Names}}\t{{.Image}}"', { encoding: 'utf8' })
      console.log('   📋 Containers encontrados:')
      console.log(containers)
      
      // Procurar por container do PostgreSQL
      if (containers.includes('postgres') || containers.includes('supabase')) {
        console.log('   ✅ Container do PostgreSQL encontrado')
      } else {
        console.log('   ⚠️ Container do PostgreSQL não encontrado')
        console.log('   💡 Verifique se o Supabase está rodando: supabase start')
        return
      }
    } catch (error) {
      console.log('   ⚠️ Erro ao listar containers:', error.message)
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
  order_id UUID NOT NULL,
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

-- Política simples para permitir todas as operações
CREATE POLICY "Allow all operations for service role" ON order_tracking_events
  FOR ALL USING (true) WITH CHECK (true);
`

    try {
      // Salvar SQL em arquivo temporário
      const fs = require('fs')
      const path = require('path')
      const tempFile = path.join(__dirname, 'temp_migration1.sql')
      fs.writeFileSync(tempFile, migration1SQL)

      // Executar via psql
      execSync(`psql "${DB_URL}" -f "${tempFile}"`, { stdio: 'inherit' })
      console.log('   ✅ Migration 1 aplicada com sucesso!')
      
      // Limpar arquivo temporário
      fs.unlinkSync(tempFile)
    } catch (error) {
      console.log('   ⚠️ Migration 1 falhou:', error.message)
    }

    // Migration 2: Deliveries
    console.log('⚡ Aplicando Migration 2: Deliveries...')
    
    const migration2SQL = `
-- Criar tabela de entregas
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON deliveries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

-- RLS (Row Level Security)
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Política simples para permitir todas as operações
CREATE POLICY "Allow all operations for service role" ON deliveries
  FOR ALL USING (true) WITH CHECK (true);
`

    try {
      // Salvar SQL em arquivo temporário
      const fs = require('fs')
      const path = require('path')
      const tempFile = path.join(__dirname, 'temp_migration2.sql')
      fs.writeFileSync(tempFile, migration2SQL)

      // Executar via psql
      execSync(`psql "${DB_URL}" -f "${tempFile}"`, { stdio: 'inherit' })
      console.log('   ✅ Migration 2 aplicada com sucesso!')
      
      // Limpar arquivo temporário
      fs.unlinkSync(tempFile)
    } catch (error) {
      console.log('   ⚠️ Migration 2 falhou:', error.message)
    }

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
applyMigrationsDocker()
