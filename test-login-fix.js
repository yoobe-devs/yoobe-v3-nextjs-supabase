const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  console.log('🔐 Testando login...')
  
  try {
    // Teste 1: Admin
    console.log('\n📋 Testando login do Admin...')
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@yoobe.com',
      password: 'admin123'
    })
    
    if (adminError) {
      console.error('❌ Erro no login do Admin:', adminError.message)
    } else {
      console.log('✅ Login do Admin bem-sucedido!')
      console.log('👤 Usuário:', adminData.user.email)
      console.log('🔑 Role:', adminData.user.user_metadata?.role)
    }
    
    // Teste 2: Gestor
    console.log('\n📋 Testando login do Gestor...')
    const { data: gestorData, error: gestorError } = await supabase.auth.signInWithPassword({
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: 'gestor123'
    })
    
    if (gestorError) {
      console.error('❌ Erro no login do Gestor:', gestorError.message)
    } else {
      console.log('✅ Login do Gestor bem-sucedido!')
      console.log('👤 Usuário:', gestorData.user.email)
      console.log('🔑 Role:', gestorData.user.user_metadata?.role)
    }
    
    // Teste 3: Funcionário
    console.log('\n📋 Testando login do Funcionário...')
    const { data: funcData, error: funcError } = await supabase.auth.signInWithPassword({
      email: 'maria.santos@jointecnologia.com.br',
      password: 'maria123'
    })
    
    if (funcError) {
      console.error('❌ Erro no login do Funcionário:', funcError.message)
    } else {
      console.log('✅ Login do Funcionário bem-sucedido!')
      console.log('👤 Usuário:', funcData.user.email)
      console.log('🔑 Role:', funcData.user.user_metadata?.role)
    }
    
    // Teste 4: Verificar sessão
    console.log('\n📋 Verificando sessão atual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError.message)
    } else if (session) {
      console.log('✅ Sessão ativa encontrada!')
      console.log('👤 Usuário logado:', session.user.email)
    } else {
      console.log('ℹ️ Nenhuma sessão ativa')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

async function checkUsers() {
  console.log('\n👥 Verificando usuários no banco...')
  
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message)
    } else {
      console.log('✅ Usuários encontrados:', users.length)
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
    }
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error.message)
  }
}

async function main() {
  console.log('🚀 Iniciando testes de autenticação...')
  console.log('📍 Supabase URL:', supabaseUrl)
  console.log('🔑 Supabase Key:', supabaseKey.substring(0, 20) + '...')
  
  await testLogin()
  await checkUsers()
  
  console.log('\n✨ Testes concluídos!')
}

main().catch(console.error)
