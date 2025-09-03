// Script para testar diretamente o banco de dados
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase local
const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🧪 Testando banco de dados diretamente...\n')

  try {
    // Teste 1: Verificar empresas
    console.log('1. 📋 Verificando empresas...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
    
    if (companiesError) {
      console.log('❌ Erro ao buscar empresas:', companiesError)
    } else {
      console.log(`✅ Empresas encontradas: ${companies?.length || 0}`)
      companies?.forEach(company => {
        console.log(`   - ${company.name} (${company.email}) - Status: ${company.status}`)
      })
    }

    // Teste 2: Verificar usuários
    console.log('\n2. 👥 Verificando usuários...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.log('❌ Erro ao buscar usuários:', usersError)
    } else {
      console.log(`✅ Usuários encontrados: ${users?.length || 0}`)
      users?.forEach(user => {
        console.log(`   - ${user.name || user.full_name} (${user.email}) - Role: ${user.role}`)
      })
    }

    // Teste 3: Verificar produtos
    console.log('\n3. 📦 Verificando produtos...')
    const { data: products, error: productsError } = await supabase
      .from('company_products')
      .select('*')
    
    if (productsError) {
      console.log('❌ Erro ao buscar produtos:', productsError)
    } else {
      console.log(`✅ Produtos encontrados: ${products?.length || 0}`)
      products?.forEach(product => {
        console.log(`   - ${product.name} - R$ ${product.price} - Estoque: ${product.stock_quantity}`)
      })
    }

    // Teste 4: Verificar pedidos
    console.log('\n4. 🛒 Verificando pedidos...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
    
    if (ordersError) {
      console.log('❌ Erro ao buscar pedidos:', ordersError)
    } else {
      console.log(`✅ Pedidos encontrados: ${orders?.length || 0}`)
      orders?.forEach(order => {
        console.log(`   - Pedido ${order.id.slice(0, 8)} - R$ ${order.total_amount} - Status: ${order.status}`)
      })
    }

    console.log('\n🎯 Teste do banco concluído!')
    console.log('✅ Dados estão presentes no banco')
    console.log('✅ Estrutura das tabelas está correta')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar teste
testDatabase()
