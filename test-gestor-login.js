const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGestorLogin() {
  console.log('🔐 Testando login do gestor...')
  
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
    console.log('Session:', authData.session.access_token)

    // Verificar dados do usuário
    const { data: userData, error: userError } = await supabase
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

    // Verificar se a loja existe
    if (userData.store_id) {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', userData.store_id)
        .single()

      if (storeError) {
        console.error('❌ Erro ao buscar loja:', storeError)
      } else {
        console.log('🏪 Dados da loja:')
        console.log('  Nome:', storeData.name)
        console.log('  Status:', storeData.status)
      }
    }

    // Testar busca de funcionários
    const { data: employees, error: employeesError } = await supabase
      .from('users')
      .select('*')
      .eq('store_id', userData.store_id)

    if (employeesError) {
      console.error('❌ Erro ao buscar funcionários:', employeesError)
    } else {
      console.log('👥 Funcionários encontrados:', employees.length)
      employees.forEach(emp => {
        console.log(`  - ${emp.full_name} (${emp.role})`)
      })
    }

    // Testar busca de produtos
    const { data: products, error: productsError } = await supabase
      .from('company_products')
      .select('*')
      .eq('store_id', userData.store_id)

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError)
    } else {
      console.log('📦 Produtos encontrados:', products.length)
      products.forEach(prod => {
        console.log(`  - ${prod.name} (R$ ${prod.price})`)
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testGestorLogin()
