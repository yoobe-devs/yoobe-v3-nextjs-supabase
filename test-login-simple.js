const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

async function testLogin() {
  console.log('🔍 Testando login...')
  console.log('URL:', supabaseUrl)
  console.log('Anon Key:', supabaseKey.substring(0, 20) + '...')
  console.log('Service Key:', serviceRoleKey.substring(0, 20) + '...')
  
  try {
    // Teste 1: Verificar usuários existentes com service role
    console.log('\n📋 Verificando usuários existentes...')
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ Erro ao listar usuários:', usersError.message)
    } else {
      console.log('✅ Usuários encontrados:', users.users.length)
      users.users.forEach(user => {
        console.log(`- ${user.email} (${user.user_metadata?.role || 'sem role'}) - ${user.email_confirmed_at ? 'confirmado' : 'não confirmado'}`)
      })
    }
    
    // Teste 2: Login com gestor (email correto)
    console.log('\n📧 Testando login com gestor...')
    const { data: gestorData, error: gestorError } = await supabase.auth.signInWithPassword({
      email: 'gestor@test.com',
      password: 'gestor123'
    })
    
    if (gestorError) {
      console.log('❌ Erro no login do gestor:', gestorError.message)
    } else {
      console.log('✅ Login do gestor bem-sucedido!')
      console.log('👤 Usuário:', gestorData.user.email)
      console.log('🔑 Role:', gestorData.user.user_metadata?.role)
    }
    
    // Teste 3: Login com admin (email correto)
    console.log('\n📧 Testando login com admin...')
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'admin123'
    })
    
    if (adminError) {
      console.log('❌ Erro no login do admin:', adminError.message)
    } else {
      console.log('✅ Login do admin bem-sucedido!')
      console.log('👤 Usuário:', adminData.user.email)
      console.log('🔑 Role:', adminData.user.user_metadata?.role)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testLogin() 