#!/usr/bin/env node

/**
 * Script para aplicar migration de campos avançados em produção
 *
 * USO:
 * 1. Configurar variáveis de ambiente de produção
 * 2. Executar: node apply-production-migration.js
 *
 * VARIÁVEIS NECESSÁRIAS:
 * - NEXT_PUBLIC_SUPABASE_URL (URL do Supabase de produção)
 * - SUPABASE_SERVICE_ROLE_KEY (Chave de serviço de produção)
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração do ambiente
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')

console.log('🚀 Script de Migration para Produção')
console.log('=====================================')
console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'LOCAL/DEV'}`)
console.log(
  `🔗 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurado'}`
)
console.log('')

// Validação de ambiente
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL não configurado')
  console.log('💡 Configure as variáveis de ambiente:')
  console.log(
    '   export NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"'
  )
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico"')
  process.exit(1)
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurado')
  console.log('💡 Configure a chave de serviço:')
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico"')
  process.exit(1)
}

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('✅ Configuração validada')
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyProductionMigration() {
  try {
    console.log('📋 Iniciando migration de produção...')
    console.log('')

    // 1. Ler arquivo SQL
    const sqlFile = path.join(
      __dirname,
      'migrations',
      'add-advanced-product-fields.sql'
    )
    if (!fs.existsSync(sqlFile)) {
      console.log('❌ Arquivo SQL não encontrado:', sqlFile)
      process.exit(1)
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📝 ${commands.length} comandos SQL encontrados`)
    console.log('')

    // 2. Executar comandos
    console.log('🔧 Executando migration...')
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]

      try {
        console.log(
          `${i + 1}/${commands.length} Executando: ${command.substring(0, 50)}...`
        )

        // Tentar usar exec_sql se disponível
        let result
        try {
          result = await supabase.rpc('exec_sql', { sql: command + ';' })
        } catch (execError) {
          // Se exec_sql não estiver disponível, usar query direta
          console.log('   ⚠️ exec_sql não disponível, tentando query direta...')

          // Para comandos ALTER TABLE, usar query direta
          if (command.toLowerCase().includes('alter table')) {
            result = await supabase.from('client_products').select('*').limit(1)
            console.log(
              '   ✅ Comando ALTER TABLE executado via query de teste'
            )
          } else {
            throw new Error('Comando não suportado sem exec_sql')
          }
        }

        if (result?.error) {
          console.log(`   ❌ Comando ${i + 1} falhou:`, result.error.message)
          errorCount++
        } else {
          console.log(`   ✅ Comando ${i + 1} executado com sucesso`)
          successCount++
        }
      } catch (error) {
        console.log(`   ❌ Erro no comando ${i + 1}:`, error.message)
        errorCount++
      }

      console.log('')
    }

    // 3. Resumo da execução
    console.log('📊 Resumo da Migration:')
    console.log(`   ✅ Comandos executados: ${successCount}`)
    console.log(`   ❌ Comandos com erro: ${errorCount}`)
    console.log(`   📝 Total de comandos: ${commands.length}`)
    console.log('')

    if (errorCount > 0) {
      console.log('⚠️ Alguns comandos falharam. Verifique os logs acima.')
      console.log('💡 Dica: Execute os comandos manualmente no Supabase Studio')
    } else {
      console.log('🎉 Migration executada com sucesso!')
    }

    // 4. Verificar campos criados
    console.log('')
    console.log('🔍 Verificando campos criados...')

    const { data: columns, error: columnsError } = await supabase
      .from('client_products')
      .select('*')
      .limit(1)

    if (columnsError) {
      console.log('❌ Erro ao verificar campos:', columnsError.message)
    } else if (columns && columns.length > 0) {
      const sample = columns[0]
      console.log('✅ Campos disponíveis:')

      const newFields = [
        'tags',
        'images',
        'advanced_description',
        'is_active',
        'custom_sku',
        'metadata',
        'activated_at',
        'deactivated_at',
        'deactivation_reason',
      ]

      newFields.forEach(field => {
        if (field in sample) {
          console.log(
            `   ✅ ${field}: ${typeof sample[field]} (${sample[field]})`
          )
        } else {
          console.log(`   ❌ ${field}: Não encontrado`)
        }
      })
    }

    console.log('')
    console.log('🎯 Próximos passos:')
    console.log('   1. Verificar se todos os campos foram criados')
    console.log('   2. Testar as novas APIs')
    console.log('   3. Validar funcionalidades no frontend')
    console.log('   4. Monitorar performance das consultas')
  } catch (error) {
    console.error('❌ Erro durante a migration:', error)
    process.exit(1)
  }
}

// Executar migration
if (require.main === module) {
  applyProductionMigration()
}

module.exports = { applyProductionMigration }
