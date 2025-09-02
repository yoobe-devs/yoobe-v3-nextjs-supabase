const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthDebug() {
  try {
    console.log('🔍 Debugando autenticação...')
    console.log('')

    // 1. Fazer login do gestor
    console.log('1️⃣ Fazendo login do gestor...')
    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'gestor@empresa1.com',
      password: 'gestor123'
    })

    if (authError || !user || !session) {
      throw new Error(`Erro no login: ${authError?.message || 'Sessão não criada'}`)
    }

    console.log('✅ Login bem-sucedido')
    console.log(`👤 Usuário: ${user.email}`)
    console.log(`🔑 ID: ${user.id}`)
    console.log(`🔑 Role: ${user.user_metadata?.role}`)
    console.log(`🏢 Company ID: ${user.user_metadata?.company_id}`)
    console.log(`🏪 Store ID: ${user.user_metadata?.store_id}`)
    console.log(`🔑 Token: ${session.access_token ? 'Presente' : 'Ausente'}`)
    console.log(`🔑 Refresh Token: ${session.refresh_token ? 'Presente' : 'Ausente'}`)
    console.log('')

    // 2. Verificar token
    console.log('2️⃣ Verificando token...')
    const tokenParts = session.access_token.split('.')
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
      console.log('✅ Token JWT válido')
      console.log(`📅 Expira em: ${new Date(payload.exp * 1000).toLocaleString()}`)
      console.log(`👤 User ID no token: ${payload.sub}`)
      console.log(`🔑 Role no token: ${payload.user_metadata?.role}`)
    } else {
      console.log('❌ Token JWT inválido')
    }
    console.log('')

    // 3. Testar API com diferentes headers
    console.log('3️⃣ Testando API com diferentes headers...')
    
    const headers = [
      { 'Authorization': `Bearer ${session.access_token}` },
      { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }
    ]

    for (let i = 0; i < headers.length; i++) {
      console.log(`📋 Teste ${i + 1} com headers: ${JSON.stringify(headers[i])}`)
      
      const response = await fetch('http://localhost:3000/api/gestor/base-products', {
        headers: headers[i]
      })

      console.log(`📊 Status: ${response.status}`)
      const responseText = await response.text()
      console.log(`📋 Resposta: ${responseText}`)
      console.log('')
    }

    // 4. Testar API de produtos base pública
    console.log('4️⃣ Testando API de produtos base pública...')
    const publicResponse = await fetch('http://localhost:3000/api/base-products')
    console.log(`📊 Status da API pública: ${publicResponse.status}`)
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json()
      console.log(`✅ API pública funcionando: ${publicData.length} produtos`)
    } else {
      const publicError = await publicResponse.text()
      console.log(`❌ Erro na API pública: ${publicError}`)
    }
    console.log('')

    // 5. Verificar se o problema é com cookies
    console.log('5️⃣ Testando com cookies...')
    
    // Simular cookie de sessão
    const cookieResponse = await fetch('http://localhost:3000/api/gestor/base-products', {
      headers: {
        'Cookie': `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token=${session.access_token}`
      }
    })

    console.log(`📊 Status com cookie: ${cookieResponse.status}`)
    const cookieText = await cookieResponse.text()
    console.log(`📋 Resposta com cookie: ${cookieText}`)
    console.log('')

    console.log('🎉 Debug de autenticação concluído!')

  } catch (error) {
    console.error('❌ Erro no debug de autenticação:', error)
    process.exit(1)
  }
}

testAuthDebug()
