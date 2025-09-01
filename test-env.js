require('dotenv').config({ path: '.env.local' })

console.log('🔧 Verificando variáveis de ambiente...')
console.log('📍 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('🔑 NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida')
console.log('🌐 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
console.log('🌐 NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)

// Testar conexão com Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (supabaseUrl && supabaseKey) {
  console.log('\n🔗 Testando conexão com Supabase...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Testar login
  supabase.auth.signInWithPassword({
    email: 'admin@yoobe.com',
    password: 'admin123'
  }).then(({ data, error }) => {
    if (error) {
      console.log('❌ Erro na conexão:', error.message)
    } else {
      console.log('✅ Conexão bem-sucedida!')
      console.log('👤 Usuário logado:', data.user.email)
    }
  }).catch(error => {
    console.log('❌ Erro geral:', error.message)
  })
} else {
  console.log('❌ Variáveis de ambiente não configuradas corretamente')
}
