const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testReplication() {
  try {
    console.log('🧪 Testando replicação de produtos...')
    console.log('')

    // 1. Verificar produtos base disponíveis
    console.log('1️⃣ Verificando produtos base...')
    const { data: baseProducts, error: baseError } = await supabase
      .from('base_products')
      .select('id, name, status')
      .eq('status', 'active')
      .limit(3)

    if (baseError) {
      console.log('❌ Erro ao buscar produtos base:', baseError.message)
      return
    }

    console.log(`✅ ${baseProducts?.length || 0} produtos base encontrados:`)
    baseProducts?.forEach(product => {
      console.log(`   - ${product.name} (${product.id})`)
    })

    // 2. Verificar empresas disponíveis
    console.log('')
    console.log('2️⃣ Verificando empresas...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, status')
      .eq('status', 'active')
      .limit(3)

    if (companiesError) {
      console.log('❌ Erro ao buscar empresas:', companiesError.message)
      return
    }

    console.log(`✅ ${companies?.length || 0} empresas encontradas:`)
    companies?.forEach(company => {
      console.log(`   - ${company.name} (${company.id})`)
    })

    // 3. Testar replicação de um produto
    if (
      baseProducts &&
      baseProducts.length > 0 &&
      companies &&
      companies.length > 0
    ) {
      console.log('')
      console.log('3️⃣ Testando replicação...')

      const baseProduct = baseProducts[0]
      const company = companies[0]

      console.log(`   Replicando: ${baseProduct.name} → ${company.name}`)

      // Verificar se já existe
      const { data: existing, error: existingError } = await supabase
        .from('client_products')
        .select('id')
        .eq('client_id', company.id)
        .eq('base_product_id', baseProduct.id)
        .maybeSingle()

      if (existingError) {
        console.log('❌ Erro ao verificar existência:', existingError.message)
        return
      }

      if (existing) {
        console.log('⚠️ Produto já replicado, removendo para teste...')
        await supabase.from('client_products').delete().eq('id', existing.id)
        console.log('🧹 Produto existente removido')
      }

      // Tentar replicar com campos corretos
      const { data: replicated, error: replicateError } = await supabase
        .from('client_products')
        .insert({
          client_id: company.id,
          base_product_id: baseProduct.id,
          name: baseProduct.name,
          description: `Replicado de ${baseProduct.name}`,
          price: 29.9,
          status: 'active',
          stock_quantity: 0,
          margin_pct: 0,
          final_sku: `${baseProduct.id.slice(0, 8)}-${company.id.slice(0, 8)}`,
          ean_13: null,
        })
        .select()

      if (replicateError) {
        console.log('❌ Erro na replicação:', replicateError.message)
      } else {
        console.log('✅ Replicação bem-sucedida!')
        console.log('   Produto replicado:', replicated[0])
      }
    }

    // 4. Verificar produtos replicados
    console.log('')
    console.log('4️⃣ Verificando produtos replicados...')
    const { data: replicatedProducts, error: replicatedError } = await supabase
      .from('client_products')
      .select('id, name, client_id, base_product_id, status')
      .limit(5)

    if (replicatedError) {
      console.log(
        '❌ Erro ao buscar produtos replicados:',
        replicatedError.message
      )
    } else {
      console.log(
        `✅ ${replicatedProducts?.length || 0} produtos replicados encontrados:`
      )
      replicatedProducts?.forEach(product => {
        console.log(`   - ${product.name} (${product.status})`)
      })
    }

    console.log('')
    console.log('🎉 Teste de replicação concluído!')
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste
testReplication()
