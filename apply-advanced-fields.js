const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicnNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyAdvancedFields() {
  try {
    console.log('🚀 Aplicando campos avançados para produtos replicados...')
    console.log('')

    // 1. Ler o arquivo SQL
    const sqlFile = path.join(
      __dirname,
      'migrations',
      'add-advanced-product-fields.sql'
    )
    if (!fs.existsSync(sqlFile)) {
      console.log('❌ Arquivo SQL não encontrado:', sqlFile)
      return
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    console.log('✅ Arquivo SQL carregado')

    // 2. Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📋 ${commands.length} comandos SQL identificados`)
    console.log('')

    // 3. Aplicar cada comando individualmente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (!command) continue

      try {
        console.log(
          `${i + 1}/${commands.length} Executando: ${command.substring(0, 50)}...`
        )

        const { error } = await supabase.rpc('exec_sql', { sql: command + ';' })

        if (error) {
          console.log(`⚠️ Comando ${i + 1} falhou:`, error.message)
          // Continuar com os próximos comandos
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`)
        }
      } catch (e) {
        console.log(`⚠️ Erro no comando ${i + 1}:`, e.message)
      }
    }

    // 4. Verificar se os campos foram criados
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

    // 5. Testar inserção com novos campos
    console.log('')
    console.log('🧪 Testando inserção com novos campos...')

    const testProduct = {
      name: 'TESTE_CAMPOS_AVANCADOS',
      description: 'Teste dos novos campos',
      price: 0,
      status: 'test',
      stock_quantity: 0,
      margin_pct: 0,
      final_sku: `TEST-ADV-${Date.now()}`,
      client_id: '550e8400-e29b-41d4-a716-446655440001',
      tags: ['teste', 'avançado'],
      images: [
        {
          url: 'https://example.com/test.jpg',
          alt: 'Imagem de teste',
          is_primary: true,
        },
      ],
      advanced_description: 'Descrição avançada com **formatação**',
      is_active: true,
      custom_sku: 'TEST-ADV-001',
      metadata: {
        source: 'test',
        version: '1.0',
      },
    }

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('client_products')
        .insert(testProduct)
        .select()

      if (insertError) {
        console.log('❌ Erro na inserção de teste:', insertError.message)
      } else {
        console.log('✅ Inserção com novos campos bem-sucedida')
        console.log('   Produto criado:', inserted[0].name)

        // Remover produto de teste
        await supabase.from('client_products').delete().eq('id', inserted[0].id)
        console.log('🧹 Produto de teste removido')
      }
    } catch (e) {
      console.log('⚠️ Erro durante teste de inserção:', e.message)
    }

    console.log('')
    console.log('🎉 Migration de campos avançados concluída!')
  } catch (error) {
    console.error('❌ Erro durante a migration:', error)
  }
}

// Executar a migration
applyAdvancedFields()
