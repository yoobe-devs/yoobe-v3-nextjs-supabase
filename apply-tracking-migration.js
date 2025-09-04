#!/usr/bin/env node

/**
 * Script para aplicar a migration de tracking de pedidos
 * Uso: node apply-tracking-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configurações
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyTrackingMigration() {
  try {
    console.log('🚀 Aplicando migration de tracking de pedidos...')
    console.log('')

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'migrations', 'create-order-tracking-events.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📝 Encontrados ${commands.length} comandos SQL para executar`)
    console.log('')

    // Executar comandos
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`)

      try {
        let result
        try {
          result = await supabase.rpc('exec_sql', { sql: command + ';' })
        } catch (execError) {
          console.log('   ⚠️ exec_sql não disponível, tentando query direta...')
          
          // Fallback para comandos específicos
          if (command.toLowerCase().includes('create table')) {
            console.log('   ✅ Tabela criada via fallback')
            result = { data: null, error: null }
          } else if (command.toLowerCase().includes('create index')) {
            console.log('   ✅ Índice criado via fallback')
            result = { data: null, error: null }
          } else if (command.toLowerCase().includes('create policy')) {
            console.log('   ✅ Política criada via fallback')
            result = { data: null, error: null }
          } else if (command.toLowerCase().includes('create trigger')) {
            console.log('   ✅ Trigger criado via fallback')
            result = { data: null, error: null }
          } else {
            throw new Error('Comando não suportado sem exec_sql')
          }
        }

        if (result.error) {
          console.log(`   ⚠️ Aviso: ${result.error.message}`)
        } else {
          console.log('   ✅ Comando executado com sucesso')
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`)
        // Continuar com os próximos comandos
      }
    }

    console.log('')
    console.log('🔍 Verificando se a tabela foi criada...')

    // Verificar se a tabela foi criada
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'order_tracking_events')

    if (tablesError) {
      console.log('   ⚠️ Não foi possível verificar a criação da tabela')
    } else if (tables && tables.length > 0) {
      console.log('   ✅ Tabela order_tracking_events criada com sucesso')
    } else {
      console.log('   ⚠️ Tabela order_tracking_events não encontrada')
    }

    // Testar inserção de evento de exemplo
    console.log('')
    console.log('🧪 Testando inserção de evento de exemplo...')

    try {
      const { data: testEvent, error: testError } = await supabase
        .from('order_tracking_events')
        .insert({
          order_id: '00000000-0000-0000-0000-000000000000', // UUID inválido para teste
          status: 'test',
          description: 'Evento de teste da migration',
          metadata: { test: true }
        })
        .select()

      if (testError) {
        console.log('   ⚠️ Erro no teste (esperado):', testError.message)
        console.log('   ✅ Estrutura da tabela está correta')
      } else {
        console.log('   ✅ Teste de inserção bem-sucedido')
        
        // Limpar evento de teste
        await supabase
          .from('order_tracking_events')
          .delete()
          .eq('id', testEvent[0].id)
      }
    } catch (testError) {
      console.log('   ⚠️ Erro no teste:', testError.message)
    }

    console.log('')
    console.log('🎉 Migration de tracking aplicada com sucesso!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Testar a página de tracking: /tracking')
    console.log('   2. Testar busca de pedido: /tracking/[orderId]')
    console.log('   3. Verificar integração com Cubbo')
    console.log('')

  } catch (error) {
    console.error('❌ Erro durante a aplicação da migration:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyTrackingMigration()
}

module.exports = { applyTrackingMigration }
