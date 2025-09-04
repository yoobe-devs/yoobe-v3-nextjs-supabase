#!/usr/bin/env node

/**
 * Script para aplicar migrations do SwagTrack via Supabase Studio API
 * Uso: node apply-migrations-via-studio.js
 */

const http = require('http')

async function applyMigrationsViaStudio() {
  console.log('🚀 Aplicando migrations do SwagTrack via Supabase Studio...')
  console.log('')

  try {
    // Verificar se o Supabase Studio está acessível
    console.log('📡 Verificando Supabase Studio...')
    
    const studioUrl = 'http://localhost:54323'
    const isStudioAccessible = await checkStudioAccessibility(studioUrl)
    
    if (!isStudioAccessible) {
      console.log('   ❌ Supabase Studio não está acessível')
      console.log('   💡 Verifique se o Supabase está rodando: supabase start')
      return
    }
    
    console.log('   ✅ Supabase Studio acessível')
    console.log('')

    // Abrir o Supabase Studio no navegador
    console.log('🌐 Abrindo Supabase Studio no navegador...')
    
    const { execSync } = require('child_process')
    try {
      execSync(`open ${studioUrl}`, { stdio: 'pipe' })
      console.log('   ✅ Supabase Studio aberto no navegador')
    } catch (error) {
      console.log('   ⚠️ Não foi possível abrir automaticamente')
      console.log(`   💡 Acesse manualmente: ${studioUrl}`)
    }

    console.log('')
    console.log('📋 INSTRUÇÕES PARA APLICAR AS MIGRATIONS:')
    console.log('')
    console.log('1. No Supabase Studio, vá para "SQL Editor"')
    console.log('2. Clique em "New query"')
    console.log('3. Cole o SQL da Migration 1 (Order Tracking Events):')
    console.log('')
    console.log('```sql')
    console.log('-- Migration 1: Order Tracking Events')
    console.log('CREATE TABLE IF NOT EXISTS order_tracking_events (')
    console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,')
    console.log('  order_id UUID NOT NULL,')
    console.log('  status VARCHAR(50) NOT NULL,')
    console.log('  location VARCHAR(255),')
    console.log('  description TEXT,')
    console.log('  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
    console.log('  metadata JSONB,')
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
    console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
    console.log(');')
    console.log('')
    console.log('CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON order_tracking_events(order_id);')
    console.log('CREATE INDEX IF NOT EXISTS idx_order_tracking_events_timestamp ON order_tracking_events(timestamp);')
    console.log('CREATE INDEX IF NOT EXISTS idx_order_tracking_events_status ON order_tracking_events(status);')
    console.log('')
    console.log('ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('CREATE POLICY "Allow all operations for service role" ON order_tracking_events')
    console.log('  FOR ALL USING (true) WITH CHECK (true);')
    console.log('```')
    console.log('')
    console.log('4. Clique em "Run" para executar')
    console.log('5. Crie uma nova query e cole o SQL da Migration 2 (Deliveries):')
    console.log('')
    console.log('```sql')
    console.log('-- Migration 2: Deliveries')
    console.log('CREATE TABLE IF NOT EXISTS deliveries (')
    console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,')
    console.log('  order_id UUID NOT NULL,')
    console.log('  delivery_method VARCHAR(50) NOT NULL,')
    console.log('  tracking_code VARCHAR(50) UNIQUE,')
    console.log('  recipient_name VARCHAR(255) NOT NULL,')
    console.log('  recipient_email VARCHAR(255) NOT NULL,')
    console.log('  recipient_phone VARCHAR(50),')
    console.log('  street_address VARCHAR(255) NOT NULL,')
    console.log('  city VARCHAR(100) NOT NULL,')
    console.log('  state VARCHAR(50) NOT NULL,')
    console.log('  postal_code VARCHAR(20) NOT NULL,')
    console.log('  country VARCHAR(100) DEFAULT \'Brasil\',')
    console.log('  notes TEXT,')
    console.log('  status VARCHAR(50) DEFAULT \'pending\',')
    console.log('  estimated_delivery TIMESTAMP WITH TIME ZONE,')
    console.log('  actual_delivery TIMESTAMP WITH TIME ZONE,')
    console.log('  created_by UUID,')
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
    console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
    console.log(');')
    console.log('')
    console.log('CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);')
    console.log('CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON deliveries(tracking_code);')
    console.log('CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);')
    console.log('CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);')
    console.log('')
    console.log('ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('CREATE POLICY "Allow all operations for service role" ON deliveries')
    console.log('  FOR ALL USING (true) WITH CHECK (true);')
    console.log('```')
    console.log('')
    console.log('6. Clique em "Run" para executar')
    console.log('7. Vá para "Table Editor" para verificar se as tabelas foram criadas')
    console.log('')
    console.log('🎯 Após aplicar as migrations, execute:')
    console.log('   node verificar-swagtrack-completo.js')
    console.log('')
    console.log('🎉 Isso tornará o SwagTrack 100% funcional!')

  } catch (error) {
    console.error('❌ Erro durante a aplicação das migrations:', error)
  }
}

function checkStudioAccessibility(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200)
    })
    
    req.on('error', () => {
      resolve(false)
    })
    
    req.setTimeout(3000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

// Executar
applyMigrationsViaStudio()
