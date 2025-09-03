const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminAuth() {
  console.log('🧪 Testando autenticação do Admin...')
  
  try {
    // 1. Verificar se o Supabase está rodando
    console.log('1. Verificando conexão com Supabase...')
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (tablesError) {
      console.error('❌ Erro ao conectar com Supabase:', tablesError)
      return
    }
    
    console.log('✅ Supabase conectado com sucesso')
    
    // 2. Verificar estrutura da tabela users
    console.log('2. Verificando estrutura da tabela users...')
    const { data: userSample, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (userError) {
      console.error('❌ Erro ao consultar tabela users:', userError)
      return
    }
    
    console.log('✅ Tabela users acessível')
    console.log('📋 Estrutura da tabela:', Object.keys(userSample[0] || {}))
    
    // 3. Verificar se existe usuário com role superadmin
    console.log('3. Verificando usuários com role superadmin...')
    const { data: superadmins, error: superadminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'superadmin')
    
    if (superadminError) {
      console.error('❌ Erro ao consultar superadmins:', superadminError)
      return
    }
    
    console.log(`✅ Encontrados ${superadmins.length} usuários com role superadmin`)
    
    if (superadmins.length > 0) {
      console.log('👤 Usuários superadmin:', superadmins.map(u => ({ id: u.id, email: u.email, role: u.role })))
    } else {
      console.log('⚠️  Nenhum usuário superadmin encontrado')
      console.log('💡 Você precisa criar um usuário com role "superadmin"')
    }
    
    // 4. Verificar roles disponíveis
    console.log('4. Verificando roles disponíveis...')
    const { data: roles, error: rolesError } = await supabase
      .from('users')
      .select('role')
      .limit(100)
    
    if (rolesError) {
      console.error('❌ Erro ao consultar roles:', rolesError)
      return
    }
    
    const uniqueRoles = [...new Set(roles.map(r => r.role))]
    console.log('🎭 Roles disponíveis:', uniqueRoles)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testAdminAuth()
