const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, anonKey)

async function testLogin() {
  try {
    console.log('🔍 Testando login do gestor...')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: 'gestor123'
    })

    if (error) {
      console.error('❌ Erro no login:', error)
      return
    }

    console.log('✅ Login bem-sucedido!')
    console.log('👤 Usuário:', data.user.email)
    console.log('🆔 ID:', data.user.id)
    console.log('📧 Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não')

    // Verificar se o usuário existe na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'gestor.join.tech@jointecnologia.com.br')
      .single()

    if (userError) {
      console.error('❌ Erro ao buscar usuário na tabela users:', userError)
    } else {
      console.log('✅ Usuário encontrado na tabela users:')
      console.log('   Nome:', userData.full_name)
      console.log('   Role:', userData.role)
      console.log('   Empresa:', userData.company_id)
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testLogin()
