const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFuncionariosPage() {
  console.log('🔍 Testando página de funcionários...')
  
  try {
    // Fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: 'gestor123'
    })

    if (authError) {
      console.error('❌ Erro no login:', authError)
      return
    }

    console.log('✅ Login realizado com sucesso!')
    console.log('User ID:', authData.user.id)

    // Buscar dados do usuário usando service role
    const serviceSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU')
    
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError)
      return
    }

    console.log('👤 Dados do usuário:')
    console.log('  Nome:', userData.full_name)
    console.log('  Role:', userData.role)
    console.log('  Company ID:', userData.company_id)
    console.log('  Store ID:', userData.store_id)

    // Buscar funcionários da loja
    const { data: employees, error: employeesError } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('store_id', userData.store_id)

    if (employeesError) {
      console.error('❌ Erro ao buscar funcionários:', employeesError)
      return
    }

    console.log('👥 Funcionários encontrados:', employees.length)
    employees.forEach(emp => {
      console.log(`  - ${emp.full_name} (${emp.role}) - ${emp.email}`)
    })

    // Buscar produtos da loja
    const { data: products, error: productsError } = await serviceSupabase
      .from('company_products')
      .select('*')
      .eq('store_id', userData.store_id)

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError)
      return
    }

    console.log('📦 Produtos encontrados:', products.length)
    products.forEach(prod => {
      console.log(`  - ${prod.name} (R$ ${prod.price})`)
    })

    // Buscar pedidos da loja
    const { data: orders, error: ordersError } = await serviceSupabase
      .from('orders')
      .select('*')
      .eq('store_id', userData.store_id)

    if (ordersError) {
      console.error('❌ Erro ao buscar pedidos:', ordersError)
      return
    }

    console.log('🛒 Pedidos encontrados:', orders.length)
    orders.forEach(order => {
      console.log(`  - Pedido ${order.id.slice(0, 8)} - R$ ${order.total_amount}`)
    })

    console.log('🎉 Teste concluído com sucesso!')
    console.log('📝 Resumo:')
    console.log(`  - ${employees.length} funcionários`)
    console.log(`  - ${products.length} produtos`)
    console.log(`  - ${orders.length} pedidos`)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testFuncionariosPage()
