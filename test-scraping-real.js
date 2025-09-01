const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealScraping() {
  console.log('🔍 Testando scraping real do catálogo externo...')
  
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
    
    // 2. Testar scraping da página 1
    console.log('\n📋 Testando scraping da página 1...')
    
    const response = await fetch('http://localhost:3000/api/scraping/import-catalog', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify({
        page: 1,
        limit: 50
      })
    })
    
    console.log('📊 Status da resposta:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Scraping funcionando!')
      console.log('📊 Resultado:', {
        message: data.message,
        page: data.page,
        totalScraped: data.totalScraped,
        imported: data.imported,
        errors: data.errors,
        nextPage: data.nextPage
      })
      
      if (data.details && data.details.length > 0) {
        console.log('\n📋 Detalhes da importação:')
        data.details.slice(0, 5).forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail}`)
        })
        if (data.details.length > 5) {
          console.log(`  ... e mais ${data.details.length - 5} itens`)
        }
      }
    } else {
      const errorText = await response.text()
      console.log('❌ API retornou erro:', errorText)
    }
    
    // 3. Verificar produtos importados
    console.log('\n📋 Verificando produtos importados...')
    const { data: baseProducts, error: baseError } = await supabase
      .from('base_products')
      .select(`
        name,
        base_price,
        base_points_cost,
        specifications
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (baseError) {
      console.error('❌ Erro ao buscar produtos:', baseError.message)
      return
    }
    
    console.log('✅ Últimos produtos importados:')
    baseProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name}`)
      console.log(`     Preço: R$ ${product.base_price}`)
      console.log(`     Pontos: ${product.base_points_cost}`)
      if (product.specifications?.sku) {
        console.log(`     SKU: ${product.specifications.sku}`)
      }
      if (product.specifications?.ncm) {
        console.log(`     NCM: ${product.specifications.ncm}`)
      }
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testRealScraping().catch(console.error)
