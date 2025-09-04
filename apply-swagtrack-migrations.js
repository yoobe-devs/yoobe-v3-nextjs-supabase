#!/usr/bin/env node

/**
 * Script para aplicar as migrations do SwagTrack automaticamente
 * Uso: node apply-swagtrack-migrations.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configurações
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

console.log('🚀 Aplicando migrations do SwagTrack...')
console.log('📡 Conectando ao Supabase:', SUPABASE_URL)
console.log('')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function executeSQL(sqlContent, migrationName) {
  console.log(`⚡ Executando migration: ${migrationName}`)
  
  // Dividir em comandos individuais
  const commands = sqlContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

  console.log(`   📝 ${commands.length} comandos encontrados`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    
    try {
      // Tentar executar via exec_sql primeiro
      let result
      try {
        result = await supabase.rpc('exec_sql', { sql: command + ';' })
      } catch (execError) {
        // Fallback: tentar executar diretamente
        console.log(`   ⚠️ exec_sql não disponível, tentando método alternativo...`)
        
        // Para comandos CREATE TABLE, tentar verificar se a tabela já existe
        if (command.toLowerCase().includes('create table')) {
          const tableName = command.match(/create table.*?(\w+)/i)?.[1]
          if (tableName) {
            const { data: existingTable } = await supabase
              .from('information_schema.tables')
              .select('table_name')
              .eq('table_schema', 'public')
              .eq('table_name', tableName)
              .single()
            
            if (existingTable) {
              console.log(`   ✅ Tabela ${tableName} já existe`)
              result = { data: null, error: null }
            } else {
              console.log(`   ⚠️ Não foi possível criar tabela ${tableName} automaticamente`)
              result = { data: null, error: { message: 'Tabela não criada' } }
            }
          }
        } else {
          console.log(`   ⚠️ Comando não suportado: ${command.substring(0, 50)}...`)
          result = { data: null, error: { message: 'Comando não suportado' } }
        }
      }

      if (result.error) {
        console.log(`   ⚠️ Aviso: ${result.error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ Comando executado`)
        successCount++
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
      errorCount++
    }
  }

  console.log(`   📊 Resultado: ${successCount} sucessos, ${errorCount} erros`)
  console.log('')
  
  return { successCount, errorCount }
}

async function applySwagTrackMigrations() {
  try {
    console.log('🔍 Verificando conexão com Supabase...')
    
    // Testar conexão
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)

    if (testError) {
      console.error('❌ Erro de conexão:', testError.message)
      console.log('')
      console.log('💡 Soluções possíveis:')
      console.log('   1. Verificar se o Supabase está rodando: supabase start')
      console.log('   2. Verificar as variáveis de ambiente')
      console.log('   3. Aplicar migrations manualmente no Supabase Studio')
      return
    }

    console.log('✅ Conexão estabelecida com sucesso!')
    console.log('')

    // Migration 1: Order Tracking Events
    const trackingEventsPath = path.join(__dirname, 'migrations', 'create-order-tracking-events.sql')
    if (fs.existsSync(trackingEventsPath)) {
      const trackingEventsSQL = fs.readFileSync(trackingEventsPath, 'utf8')
      await executeSQL(trackingEventsSQL, 'Order Tracking Events')
    } else {
      console.log('⚠️ Arquivo create-order-tracking-events.sql não encontrado')
    }

    // Migration 2: Deliveries
    const deliveriesPath = path.join(__dirname, 'migrations', 'create-deliveries-table.sql')
    if (fs.existsSync(deliveriesPath)) {
      const deliveriesSQL = fs.readFileSync(deliveriesPath, 'utf8')
      await executeSQL(deliveriesSQL, 'Deliveries Table')
    } else {
      console.log('⚠️ Arquivo create-deliveries-table.sql não encontrado')
    }

    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando criação das tabelas...')
    
    const tablesToCheck = ['order_tracking_events', 'deliveries']
    
    for (const tableName of tablesToCheck) {
      const { data: table, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .single()

      if (tableError || !table) {
        console.log(`   ❌ Tabela ${tableName} não encontrada`)
      } else {
        console.log(`   ✅ Tabela ${tableName} criada com sucesso`)
      }
    }

    console.log('')
    console.log('🎉 Migrations do SwagTrack aplicadas!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Testar a página de tracking: http://localhost:3001/tracking')
    console.log('   2. Testar os modais de edição, status e entrega')
    console.log('   3. Verificar integração com Cubbo')
    console.log('')
    console.log('💡 Se alguma tabela não foi criada, execute o SQL manualmente no Supabase Studio:')
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

// Executar se chamado diretamente
if (require.main === module) {
  applySwagTrackMigrations()
}

module.exports = { applySwagTrackMigrations }
