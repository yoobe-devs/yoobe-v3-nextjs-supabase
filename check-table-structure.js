const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura real da tabela client_products...')
    console.log('')

    // 1. Tentar selecionar todos os campos
    console.log('1️⃣ Tentando selecionar todos os campos...')
    try {
      const { data, error } = await supabase
        .from('client_products')
        .select('*')
        .limit(1)

      if (error) {
        console.log('❌ Erro ao selecionar todos os campos:', error.message)
      } else {
        console.log('✅ Seleção com * funcionou')
        if (data && data.length > 0) {
          console.log('   Campos disponíveis:', Object.keys(data[0]))
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao selecionar com *:', e.message)
    }

    // 2. Tentar selecionar campos específicos um por um
    console.log('')
    console.log('2️⃣ Testando campos específicos...')

    const testFields = [
      'id',
      'client_id',
      'base_product_id',
      'name',
      'description',
      'price',
      'points_cost',
      'category_id',
      'image_url',
      'is_active',
      'status',
      'stock_quantity',
      'margin_pct',
      'final_sku',
      'ean_13',
      'created_at',
      'updated_at',
    ]

    for (const field of testFields) {
      try {
        const { data, error } = await supabase
          .from('client_products')
          .select(field)
          .limit(1)

        if (error) {
          if (
            error.message.includes('column') &&
            error.message.includes('does not exist')
          ) {
            console.log(`❌ ${field}: Não existe`)
          } else {
            console.log(`⚠️ ${field}: ${error.message}`)
          }
        } else {
          console.log(`✅ ${field}: Existe`)
        }
      } catch (e) {
        console.log(`⚠️ ${field}: ${e.message}`)
      }
    }

    // 3. Tentar inserir com campos mínimos
    console.log('')
    console.log('3️⃣ Testando inserção com campos mínimos...')

    try {
      const { data, error } = await supabase
        .from('client_products')
        .insert({
          name: 'TESTE_MINIMO',
          description: 'Teste com campos mínimos',
        })
        .select()

      if (error) {
        console.log('❌ Erro na inserção mínima:', error.message)
      } else {
        console.log('✅ Inserção mínima funcionou')
        // Remover o registro de teste
        if (data && data[0]) {
          await supabase.from('client_products').delete().eq('id', data[0].id)
          console.log('🧹 Registro de teste removido')
        }
      }
    } catch (e) {
      console.log('⚠️ Erro na inserção mínima:', e.message)
    }

    // 4. Verificar se a tabela está vazia
    console.log('')
    console.log('4️⃣ Verificando se a tabela está vazia...')

    try {
      const { count, error } = await supabase
        .from('client_products')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log('❌ Erro ao contar registros:', error.message)
      } else {
        console.log(`✅ Tabela tem ${count} registros`)
      }
    } catch (e) {
      console.log('⚠️ Erro ao contar registros:', e.message)
    }

    console.log('')
    console.log('🎉 Verificação da estrutura concluída!')
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar a verificação
checkTableStructure()
