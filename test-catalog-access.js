const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCatalogAccess() {
  console.log('🔍 Testando acesso ao catálogo base...')
  
  try {
    // 1. Fazer login como admin
    console.log('📋 Fazendo login como admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@yoobe.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Erro no login:', authError.message)
      return
    }
    
    console.log('✅ Login bem-sucedido!')
    console.log('👤 Usuário:', authData.user.email)
    console.log('🔑 Role:', authData.user.user_metadata?.role)
    
    // 2. Verificar produtos base
    console.log('\n📋 Verificando produtos base...')
    const { data: baseProducts, error: baseError } = await supabase
      .from('base_products')
      .select(`
        *,
        product_categories (
          id,
          name,
          description,
          icon,
          color
        )
      `)
      .order('name')
    
    if (baseError) {
      console.error('❌ Erro ao buscar produtos base:', baseError.message)
      return
    }
    
    console.log('✅ Produtos base encontrados:', baseProducts.length)
    baseProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.product_categories?.name || 'Sem categoria'})`)
    })
    
    // 3. Testar API de base-products
    console.log('\n📋 Testando API de base-products...')
    
    const response = await fetch('http://localhost:3000/api/base-products', {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    })
    
    console.log('📊 Status da resposta:', response.status)
    
    if (response.ok) {
      const apiProducts = await response.json()
      console.log('✅ API funcionando! Produtos retornados:', apiProducts.length)
    } else {
      const errorText = await response.text()
      console.log('❌ API retornou erro:', errorText)
    }
    
    // 4. Testar página do catálogo
    console.log('\n📋 Testando página do catálogo...')
    
    const pageResponse = await fetch('http://localhost:3000/admin/produtos/catalogo-base', {
      headers: {
        'Cookie': `sb-access-token=${authData.session.access_token}; sb-refresh-token=${authData.session.refresh_token}`
      }
    })
    
    console.log('📊 Status da página:', pageResponse.status)
    
    if (pageResponse.ok) {
      console.log('✅ Página carregando corretamente')
    } else {
      console.log('❌ Erro ao carregar página:', pageResponse.status)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testCatalogAccess().catch(console.error)
