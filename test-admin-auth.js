const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminAuth() {
  console.log('🔐 Testando autenticação do admin...')
  
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
    console.log('🆔 ID:', authData.user.id)
    
    // 2. Verificar sessão
    console.log('\n📋 Verificando sessão...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError.message)
      return
    }
    
    if (session) {
      console.log('✅ Sessão ativa encontrada!')
      console.log('🔑 Token:', session.access_token.substring(0, 20) + '...')
    } else {
      console.log('❌ Nenhuma sessão ativa')
      return
    }
    
    // 3. Testar API de importação
    console.log('\n📋 Testando API de importação...')
    
    const response = await fetch('http://localhost:3000/api/scraping/import-catalog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    console.log('📊 Status da resposta:', response.status)
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()))
    
    const responseData = await response.text()
    console.log('📊 Resposta:', responseData)
    
    if (response.ok) {
      console.log('✅ API funcionando!')
    } else {
      console.log('❌ API retornou erro:', response.status)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testAdminAuth().catch(console.error)
