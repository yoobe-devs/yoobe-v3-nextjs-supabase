#!/usr/bin/env node

/**
 * Script para verificar o status das migrations do SwagTrack
 * Uso: node check-migrations-status.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase local
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkMigrationsStatus() {
  console.log('🔍 Verificando status das migrations do SwagTrack...')
  console.log('')

  try {
    // Verificar se o Supabase está acessível
    console.log('📡 Testando conexão com Supabase...')

    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (testError) {
      console.log('   ❌ Erro de conexão:', testError.message)
      return
    }

    console.log('   ✅ Conexão estabelecida com sucesso')
    console.log('')

    // Verificar tabelas existentes
    console.log('📊 Verificando tabelas existentes...')

    const tablesToCheck = [
      'orders',
      'users',
      'companies',
      'order_tracking_events',
      'deliveries',
    ]

    const tableStatus = {}

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          tableStatus[tableName] = { exists: false, error: error.message }
        } else {
          tableStatus[tableName] = { exists: true, error: null }
        }
      } catch (err) {
        tableStatus[tableName] = { exists: false, error: err.message }
      }
    }

    // Exibir status das tabelas
    console.log('   📋 Status das tabelas:')
    for (const [tableName, status] of Object.entries(tableStatus)) {
      if (status.exists) {
        console.log(`   ✅ ${tableName} - Existe`)
      } else {
        console.log(`   ❌ ${tableName} - Não existe (${status.error})`)
      }
    }

    console.log('')

    // Verificar se as migrations do SwagTrack foram aplicadas
    const swagTrackTables = ['order_tracking_events', 'deliveries']
    const swagTrackStatus = swagTrackTables.every(
      table => tableStatus[table]?.exists
    )

    if (swagTrackStatus) {
      console.log('🎉 Migrations do SwagTrack aplicadas com sucesso!')
      console.log('')
      console.log('✅ Funcionalidades disponíveis:')
      console.log('   - Página de tracking: http://localhost:3001/tracking')
      console.log('   - Modais de edição, status e entrega')
      console.log('   - APIs de tracking e entregas')
      console.log('   - Integração com Cubbo')
    } else {
      console.log(
        '⚠️ Migrations do SwagTrack não foram aplicadas completamente'
      )
      console.log('')
      console.log('📋 Tabelas faltando:')
      for (const table of swagTrackTables) {
        if (!tableStatus[table]?.exists) {
          console.log(`   ❌ ${table}`)
        }
      }
      console.log('')
      console.log('💡 Para aplicar as migrations:')
      console.log('   1. Acesse: http://localhost:54323')
      console.log('   2. Vá para SQL Editor')
      console.log(
        '   3. Execute os SQLs do arquivo: APLICAR_MIGRATIONS_MANUAL.md'
      )
    }

    console.log('')

    // Verificar APIs disponíveis
    console.log('🔌 Testando APIs do SwagTrack...')

    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number')
        .limit(1)

      if (ordersError) {
        console.log('   ⚠️ API de pedidos: Erro ao acessar')
      } else {
        console.log('   ✅ API de pedidos: Funcionando')
      }
    } catch (error) {
      console.log('   ⚠️ API de pedidos: Erro no teste')
    }

    // Verificar se há pedidos para testar
    try {
      const { data: ordersCount, error: countError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })

      if (!countError && ordersCount) {
        console.log(`   📊 Total de pedidos no sistema: ${ordersCount.length}`)
      }
    } catch (error) {
      console.log('   ⚠️ Não foi possível contar pedidos')
    }

    console.log('')
    console.log('🚀 Próximos passos:')
    if (swagTrackStatus) {
      console.log('   1. Testar a página de tracking')
      console.log('   2. Testar os modais funcionais')
      console.log('   3. Verificar integração com Cubbo')
    } else {
      console.log('   1. Aplicar migrations manualmente')
      console.log('   2. Verificar criação das tabelas')
      console.log('   3. Testar funcionalidades')
    }
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
    console.log('')
    console.log('💡 Verifique se o Supabase está rodando:')
    console.log('   supabase start')
  }
}

// Executar
checkMigrationsStatus()
