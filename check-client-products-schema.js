const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkClientProductsSchema() {
  try {
    console.log('🔍 Verificando schema completo da tabela client_products...')
    console.log('')

    // 1. Verificar estrutura atual
    console.log('1️⃣ Estrutura atual da tabela...')
    const { data: structure, error: structureError } = await supabase
      .from('client_products')
      .select('*')
      .limit(1)

    if (structureError) {
      console.log('❌ Erro ao verificar estrutura:', structureError.message)
    } else if (structure && structure.length > 0) {
      const sample = structure[0]
      console.log('✅ Campos existentes:')
      Object.keys(sample).forEach(field => {
        console.log(`   - ${field}: ${typeof sample[field]} (${sample[field]})`)
      })
    }

    // 2. Verificar produtos existentes
    console.log('')
    console.log('2️⃣ Produtos existentes...')
    const { data: products, error: productsError } = await supabase
      .from('client_products')
      .select('id, name, client_id, status, created_at')
      .order('created_at', { ascending: false })

    if (productsError) {
      console.log('❌ Erro ao buscar produtos:', productsError.message)
    } else {
      console.log(`✅ ${products?.length || 0} produtos encontrados:`)
      products?.forEach(product => {
        console.log(
          `   - ${product.name} (${product.status}) - Client: ${product.client_id}`
        )
      })
    }

    // 3. Verificar constraints e índices
    console.log('')
    console.log('3️⃣ Verificando constraints...')

    // Tentar inserir produto com campos mínimos
    const testProduct = {
      name: 'TESTE_SCHEMA',
      description: 'Teste de schema',
      price: 0,
      status: 'test',
      stock_quantity: 0,
      margin_pct: 0,
      final_sku: `TEST-${Date.now()}`,
      ean_13: null,
    }

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('client_products')
        .insert(testProduct)
        .select()

      if (insertError) {
        console.log('❌ Erro na inserção de teste:', insertError.message)
      } else {
        console.log('✅ Inserção de teste bem-sucedida')

        // Remover produto de teste
        await supabase.from('client_products').delete().eq('id', inserted[0].id)
        console.log('🧹 Produto de teste removido')
      }
    } catch (e) {
      console.log('⚠️ Erro durante teste de inserção:', e.message)
    }

    console.log('')
    console.log('🎉 Verificação do schema concluída!')
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar a verificação
checkClientProductsSchema()
