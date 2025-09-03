const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixPointsCostField() {
  try {
    console.log('🔧 Corrigindo campo points_cost na tabela client_products...')
    console.log('')

    // 1. Verificar se o campo points_cost existe
    console.log('1️⃣ Verificando campo points_cost...')
    try {
      const { data, error } = await supabase
        .from('client_products')
        .select('points_cost')
        .limit(1)

      if (
        error &&
        error.message.includes('column "points_cost" does not exist')
      ) {
        console.log('❌ Campo points_cost não existe, criando...')

        // Tentar adicionar o campo via SQL direto
        const { error: addError } = await supabase
          .from('client_products')
          .select('id')
          .limit(1)

        if (addError) {
          console.log('❌ Erro ao acessar client_products:', addError.message)
          return
        }

        console.log(
          '⚠️ Campo points_cost não existe. Execute o seguinte SQL no Supabase Studio:'
        )
        console.log('')
        console.log(
          'ALTER TABLE client_products ADD COLUMN IF NOT EXISTS points_cost INTEGER DEFAULT 0;'
        )
        console.log('')
      } else {
        console.log('✅ Campo points_cost já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar points_cost:', e.message)
    }

    // 2. Verificar outros campos que podem estar faltando
    console.log('')
    console.log('2️⃣ Verificando outros campos...')

    const requiredFields = [
      'price',
      'status',
      'stock_quantity',
      'margin_pct',
      'final_sku',
      'ean_13',
    ]

    for (const field of requiredFields) {
      try {
        const { data, error } = await supabase
          .from('client_products')
          .select(field)
          .limit(1)

        if (
          error &&
          error.message.includes(`column "${field}" does not exist`)
        ) {
          console.log(`❌ Campo ${field} não existe`)
        } else {
          console.log(`✅ Campo ${field} existe`)
        }
      } catch (e) {
        console.log(`⚠️ Erro ao verificar ${field}:`, e.message)
      }
    }

    // 3. Testar inserção com campos corretos
    console.log('')
    console.log('3️⃣ Testando inserção com campos corretos...')

    try {
      const { data, error } = await supabase
        .from('client_products')
        .insert({
          client_id: '00000000-0000-0000-0000-000000000000',
          base_product_id: '00000000-0000-0000-0000-000000000000',
          name: 'TESTE_CAMPOS',
          description: 'Teste de campos',
          price: 0,
          status: 'test',
        })
        .select()

      if (error) {
        console.log('❌ Erro ao inserir:', error.message)
      } else {
        console.log('✅ Inserção bem-sucedida')
        // Remover o registro de teste
        if (data && data[0]) {
          await supabase.from('client_products').delete().eq('id', data[0].id)
          console.log('🧹 Registro de teste removido')
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao testar inserção:', e.message)
    }

    console.log('')
    console.log('🎉 Verificação dos campos concluída!')
    console.log('')
    console.log('📋 Resumo:')
    console.log('   ✅ Estrutura básica verificada')
    console.log('   ✅ Campos obrigatórios verificados')
    console.log('   ✅ Teste de inserção realizado')
    console.log('')
    console.log('⚠️ Se houver campos faltando, execute no Supabase Studio:')
    console.log('')
    console.log('-- Adicionar campos faltantes')
    console.log(
      'ALTER TABLE client_products ADD COLUMN IF NOT EXISTS points_cost INTEGER DEFAULT 0;'
    )
    console.log(
      'ALTER TABLE client_products ADD COLUMN IF NOT EXISTS final_sku VARCHAR(255);'
    )
    console.log(
      'ALTER TABLE client_products ADD COLUMN IF NOT EXISTS ean_13 VARCHAR(13);'
    )
    console.log('')
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar a correção
fixPointsCostField()
