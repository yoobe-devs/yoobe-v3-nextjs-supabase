const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGestorAccess() {
  try {
    console.log('🧪 Testando acesso do gestor aos produtos...')
    console.log('')

    // 1. Fazer login como gestor
    console.log('1️⃣ Fazendo login como gestor...')
    const { data: session, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: 'gestor@teste.com',
        password: 'gestor123',
      })

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message)
      return
    }

    console.log('✅ Login realizado como:', session.user.email)
    console.log('   Role:', session.user.user_metadata?.role)
    console.log('   Company ID:', session.user.user_metadata?.company_id)

    // 2. Verificar se consegue acessar os produtos da empresa
    console.log('')
    console.log('2️⃣ Testando acesso aos produtos da empresa...')

    const companyId = session.user.user_metadata?.company_id
    if (!companyId) {
      console.log('❌ Gestor não tem company_id configurado')
      return
    }

    // Tentar buscar produtos como gestor autenticado
    const { data: products, error: productsError } = await supabase
      .from('client_products')
      .select(
        '*, base_products ( id, name, base_price, base_points_cost, image_url ), product_categories ( id, name )'
      )
      .eq('client_id', companyId)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.log(
        '❌ Erro ao buscar produtos como gestor:',
        productsError.message
      )
    } else {
      console.log(
        `✅ ${products?.length || 0} produtos encontrados como gestor:`
      )
      products?.forEach(product => {
        console.log(`   - ${product.name} (${product.status})`)
      })
    }

    // 3. Verificar se consegue acessar a empresa
    console.log('')
    console.log('3️⃣ Testando acesso à empresa...')

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, status')
      .eq('id', companyId)
      .single()

    if (companyError) {
      console.log('❌ Erro ao buscar empresa:', companyError.message)
    } else {
      console.log('✅ Empresa acessível:', company.name)
    }

    // 4. Verificar se consegue acessar produtos base
    console.log('')
    console.log('4️⃣ Testando acesso aos produtos base...')

    const { data: baseProducts, error: baseError } = await supabase
      .from('base_products')
      .select('id, name, status')
      .eq('status', 'active')
      .limit(3)

    if (baseError) {
      console.log('❌ Erro ao buscar produtos base:', baseError.message)
    } else {
      console.log(`✅ ${baseProducts?.length || 0} produtos base acessíveis:`)
      baseProducts?.forEach(product => {
        console.log(`   - ${product.name} (${product.status})`)
      })
    }

    // 5. Testar replicação de um produto
    if (baseProducts && baseProducts.length > 0) {
      console.log('')
      console.log('5️⃣ Testando replicação de produto...')

      const baseProduct = baseProducts[0]
      console.log(`   Tentando replicar: ${baseProduct.name}`)

      const { data: replicated, error: replicateError } = await supabase
        .from('client_products')
        .insert({
          client_id: companyId,
          base_product_id: baseProduct.id,
          name: baseProduct.name,
          description: `Replicado de ${baseProduct.name}`,
          price: 29.9,
          status: 'active',
          stock_quantity: 0,
          margin_pct: 0,
          final_sku: `${baseProduct.id.slice(0, 8)}-${companyId.slice(0, 8)}`,
          ean_13: null,
        })
        .select()

      if (replicateError) {
        console.log('❌ Erro na replicação:', replicateError.message)
      } else {
        console.log('✅ Produto replicado com sucesso:', replicated[0].name)

        // Remover o produto de teste
        await supabase
          .from('client_products')
          .delete()
          .eq('id', replicated[0].id)
        console.log('🧹 Produto de teste removido')
      }
    }

    // 6. Verificar novamente os produtos após teste
    console.log('')
    console.log('6️⃣ Verificando produtos após teste...')

    const { data: finalProducts, error: finalError } = await supabase
      .from('client_products')
      .select('id, name, status, created_at')
      .eq('client_id', companyId)
      .order('created_at', { ascending: false })

    if (finalError) {
      console.log('❌ Erro ao buscar produtos finais:', finalError.message)
    } else {
      console.log(`✅ ${finalProducts?.length || 0} produtos finais:`)
      finalProducts?.forEach(product => {
        console.log(`   - ${product.name} (${product.status})`)
      })
    }

    console.log('')
    console.log('🎉 Teste de acesso do gestor concluído!')
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste
testGestorAccess()
