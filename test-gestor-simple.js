const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testGestorAccess() {
  try {
    console.log('🔐 Testando acesso do gestor...')

    // 1. Fazer login
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: 'gestor123'
    })

    if (signInError) {
      console.error('❌ Erro no login:', signInError)
      return
    }

    console.log('✅ Login realizado com sucesso!')
    console.log('User ID:', user.id)
    console.log('Email:', user.email)
    console.log('Role:', user.user_metadata?.role)

    // 2. Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError)
      return
    }

    if (session) {
      console.log('✅ Sessão ativa:', session.access_token ? 'Sim' : 'Não')
    } else {
      console.log('⚠️ Nenhuma sessão ativa')
    }

    // 3. Tentar acessar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError)
    } else {
      console.log('✅ Dados do usuário:', userData)
    }

    // 4. Verificar se consegue acessar a empresa
    if (userData?.company_id) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userData.company_id)
        .single()

      if (companyError) {
        console.error('❌ Erro ao buscar empresa:', companyError)
      } else {
        console.log('✅ Dados da empresa:', companyData)
      }
    }

    console.log('\n🎯 Teste concluído!')
    console.log('📱 Agora teste acessar: http://localhost:3001/gestor/dashboard')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testGestorAccess()
