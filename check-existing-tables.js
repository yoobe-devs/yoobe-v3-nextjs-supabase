#!/usr/bin/env node

/**
 * Script para verificar quais tabelas existem no banco
 * Uso: node check-existing-tables.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase local
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkExistingTables() {
  console.log('🔍 Verificando tabelas existentes no banco...')
  console.log('')

  try {
    // Lista de tabelas para verificar
    const tablesToCheck = [
      'users',
      'orders', 
      'companies',
      'order_tracking_events',
      'deliveries',
      'auth.users',
      'public.users'
    ]

    console.log('📊 Status das tabelas:')
    
    for (const tableName of tablesToCheck) {
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

    console.log('')
    console.log('🔍 Tentando descobrir a estrutura do banco...')
    
    // Tentar descobrir tabelas via query direta
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" 
      })
      
      if (error) {
        console.log('   ⚠️ Não foi possível listar tabelas via exec_sql:', error.message)
      } else {
        console.log('   ✅ Tabelas encontradas:', data)
      }
    } catch (error) {
      console.log('   ⚠️ Erro ao listar tabelas:', error.message)
    }

    // Tentar descobrir via auth.users
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.log('   ⚠️ Auth não disponível:', error.message)
      } else {
        console.log('   ✅ Auth disponível')
      }
    } catch (error) {
      console.log('   ⚠️ Erro no auth:', error.message)
    }

    console.log('')
    console.log('💡 Próximos passos:')
    console.log('   1. Verificar se o banco foi inicializado corretamente')
    console.log('   2. Aplicar migrations base do sistema primeiro')
    console.log('   3. Depois aplicar migrations do SwagTrack')

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar
checkExistingTables()
