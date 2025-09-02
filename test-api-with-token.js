const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAPIWithToken() {
  try {
    console.log('🧪 Testando API com token de autenticação...')
    console.log('')

    // 1. Fazer login do gestor
    console.log('1️⃣ Fazendo login do gestor...')
    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'gestor@empresa1.com',
      password: 'gestor123'
    })

    if (authError || !user || !session) {
      throw new Error(`Erro no login: ${authError?.message || 'Sessão não criada'}`)
    }

    console.log('✅ Login bem-sucedido')
    console.log(`👤 Usuário: ${user.email}`)
    console.log(`🔑 Role: ${user.user_metadata?.role}`)
    console.log(`🏢 Company ID: ${user.user_metadata?.company_id}`)
    console.log(`🔑 Token: ${session.access_token ? 'Presente' : 'Ausente'}`)
    console.log('')

    // 2. Testar API de produtos base do gestor
    console.log('2️⃣ Testando API de produtos base do gestor...')
    
    const response = await fetch('http://localhost:3000/api/gestor/base-products', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`📊 Status da resposta: ${response.status}`)
    console.log(`📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API funcionando!')
      console.log(`📦 Produtos encontrados: ${data.products?.length || 0}`)
      console.log(`📊 Total: ${data.pagination?.total || 0}`)
      
      if (data.products && data.products.length > 0) {
        console.log('📋 Primeiros produtos:')
        data.products.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (Replicado: ${product.is_replicated ? 'Sim' : 'Não'})`)
        })
      }
    } else {
      const errorText = await response.text()
      console.log(`❌ Erro na API: ${response.status}`)
      console.log(`📋 Resposta: ${errorText}`)
    }
    console.log('')

    // 3. Testar replicação de produto
    console.log('3️⃣ Testando replicação de produto...')
    
    // Primeiro, buscar um produto base
    const { data: baseProducts, error: baseError } = await supabase
      .from('base_products')
      .select('id, name')
      .eq('status', 'active')
      .limit(1)

    if (baseError || !baseProducts || baseProducts.length === 0) {
      console.log('❌ Não foi possível obter produtos base para teste')
    } else {
      const testProduct = baseProducts[0]
      console.log(`📦 Produto para teste: ${testProduct.name} (ID: ${testProduct.id})`)

      const replicateResponse = await fetch('http://localhost:3000/api/gestor/base-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base_product_id: testProduct.id,
          custom_price: 35.00,
          custom_points_cost: 350,
          custom_stock_quantity: 50
        })
      })

      console.log(`📊 Status da replicação: ${replicateResponse.status}`)

      if (replicateResponse.ok) {
        const replicateData = await replicateResponse.json()
        console.log('✅ Replicação bem-sucedida!')
        console.log(`📦 Produto replicado: ${replicateData.product?.name}`)
        console.log(`💰 Preço: R$ ${replicateData.product?.price}`)
        console.log(`🏷️ Pontos: ${replicateData.product?.points_cost}`)
      } else {
        const errorText = await replicateResponse.text()
        console.log(`❌ Erro na replicação: ${replicateResponse.status}`)
        console.log(`📋 Resposta: ${errorText}`)
      }
    }
    console.log('')

    // 4. Verificar produtos da empresa
    console.log('4️⃣ Verificando produtos da empresa...')
    const { data: companyProducts, error: companyError } = await supabase
      .from('company_products')
      .select(`
        *,
        base_products (
          id,
          name
        )
      `)
      .eq('company_id', user.user_metadata?.company_id)

    if (companyError) {
      console.log(`❌ Erro ao buscar produtos da empresa: ${companyError.message}`)
    } else {
      console.log(`✅ ${companyProducts.length} produtos encontrados na empresa`)
      companyProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (Base: ${product.base_products?.name || 'N/A'})`)
      })
    }
    console.log('')

    console.log('🎉 Teste da API concluído!')

  } catch (error) {
    console.error('❌ Erro no teste da API:', error)
    process.exit(1)
  }
}

testAPIWithToken()
