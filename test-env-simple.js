const fs = require('fs')
const path = require('path')

console.log('🔧 Verificando arquivo .env.local...')

try {
  const envPath = path.join(__dirname, '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  console.log('✅ Arquivo .env.local encontrado')
  
  // Extrair variáveis
  const lines = envContent.split('\n')
  const envVars = {}
  
  lines.forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=', 2)
      envVars[key.trim()] = value.trim()
    }
  })
  
  console.log('📍 NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔑 NEXT_PUBLIC_SUPABASE_ANON_KEY:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida')
  console.log('🌐 NEXT_PUBLIC_APP_URL:', envVars.NEXT_PUBLIC_APP_URL)
  console.log('🌐 NEXT_PUBLIC_SITE_URL:', envVars.NEXT_PUBLIC_SITE_URL)
  
  // Testar conexão direta
  if (envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('\n🔗 Testando conexão direta com Supabase...')
    
    const http = require('http')
    const url = new URL(envVars.NEXT_PUBLIC_SUPABASE_URL)
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/auth/v1/health',
      method: 'GET',
      headers: {
        'apikey': envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }
    
    const req = http.request(options, (res) => {
      console.log('✅ Supabase está respondendo (status:', res.statusCode, ')')
    })
    
    req.on('error', (error) => {
      console.log('❌ Erro ao conectar com Supabase:', error.message)
    })
    
    req.end()
  }
  
} catch (error) {
  console.log('❌ Erro ao ler .env.local:', error.message)
}
