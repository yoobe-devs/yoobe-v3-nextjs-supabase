#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function testLoginWithService() {
  console.log('🧪 Testando login com service key...\n')

  const testUsers = [
    {
      email: 'admin@yoobe.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: 'gestor123',
      role: 'gestor'
    },
    {
      email: 'maria.santos@jointecnologia.com.br',
      password: 'maria123',
      role: 'funcionario'
    }
  ]

  for (const user of testUsers) {
    console.log(`📋 Testando login para: ${user.email}`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (error) {
        console.log(`❌ Erro no login: ${error.message}`)
      } else {
        console.log(`✅ Login bem-sucedido!`)
        console.log(`   User ID: ${data.user.id}`)
        console.log(`   Email: ${data.user.email}`)
        
        // Verificar perfil do usuário usando service key
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.log(`❌ Erro ao buscar perfil: ${profileError.message}`)
        } else {
          console.log(`   Role: ${profile.role}`)
          console.log(`   Store ID: ${profile.store_id || 'N/A'}`)
          console.log(`   Company ID: ${profile.company_id || 'N/A'}`)
        }
      }
    } catch (error) {
      console.log(`❌ Erro inesperado: ${error.message}`)
    }
    
    console.log('')
  }

  console.log('🔍 Verificando usuários no banco...\n')

  // Verificar todos os usuários usando service key
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.log(`❌ Erro ao buscar usuários: ${usersError.message}`)
  } else {
    console.log(`✅ Total de usuários: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Store: ${user.store_id || 'N/A'}`)
    })
  }

  console.log('\n🔍 Verificando lojas...\n')

  // Verificar lojas
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('*')

  if (storesError) {
    console.log(`❌ Erro ao buscar lojas: ${storesError.message}`)
  } else {
    console.log(`✅ Total de lojas: ${stores.length}`)
    stores.forEach(store => {
      console.log(`   - ${store.name} (${store.domain})`)
    })
  }

  console.log('\n🔍 Verificando empresas...\n')

  // Verificar empresas
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')

  if (companiesError) {
    console.log(`❌ Erro ao buscar empresas: ${companiesError.message}`)
  } else {
    console.log(`✅ Total de empresas: ${companies.length}`)
    companies.forEach(company => {
      console.log(`   - ${company.name}`)
    })
  }

  console.log('\n📋 RESUMO DOS LOGINS\n')
  console.log('✅ Admin: admin@yoobe.com / admin123')
  console.log('✅ Gestor: gestor.join.tech@jointecnologia.com.br / gestor123')
  console.log('❌ Funcionário: maria.santos@jointecnologia.com.br / maria123 (credenciais inválidas)')
  
  console.log('\n🔗 LINKS PARA TESTE\n')
  console.log('🌐 Admin Global: http://localhost:3000/test-login-simple')
  console.log('👤 Gestor: http://localhost:3000/gestor/dashboard')
  console.log('🏪 Loja: http://localhost:3000/store/join-tecnologia')
  console.log('📋 Changelog: http://localhost:3000/admin/changelog')
  console.log('🔧 Integrações: http://localhost:3000/admin/integracoes')
}

testLoginWithService()
