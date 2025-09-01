// Script de teste automatizado
const BASE_URL = 'http://localhost:3001'

async function testAPIs() {
  console.log('🧪 Iniciando testes automatizados...\n')

  // Teste 1: Verificar se o servidor está rodando
  try {
    const response = await fetch(`${BASE_URL}`)
    console.log('✅ Servidor está rodando')
  } catch (error) {
    console.log('❌ Servidor não está acessível')
    return
  }

  // Teste 2: Verificar APIs protegidas
  try {
    const response = await fetch(`${BASE_URL}/api/products`)
    const data = await response.json()
    if (data.error === 'Não autorizado') {
      console.log('✅ Autenticação funcionando corretamente')
    }
  } catch (error) {
    console.log('❌ Erro ao testar autenticação')
  }

  // Teste 3: Verificar páginas públicas
  try {
    const response = await fetch(`${BASE_URL}/auth/login`)
    if (response.ok) {
      console.log('✅ Página de login acessível')
    }
  } catch (error) {
    console.log('❌ Erro ao acessar página de login')
  }

  console.log('\n🎯 Testes básicos concluídos!')
  console.log('\n📋 Próximos passos para teste manual:')
  console.log('1. Acesse: http://localhost:3001')
  console.log('2. Faça login com: admin@yoobe.co / admin123')
  console.log('3. Teste as funcionalidades:')
  console.log('   - Dashboard otimizado')
  console.log('   - Formulários de empresa e produto')
  console.log('   - Upload de imagens')
  console.log('   - Relatórios com gráficos')
  console.log('   - Notificações em tempo real')
}

// Executar testes
testAPIs()
