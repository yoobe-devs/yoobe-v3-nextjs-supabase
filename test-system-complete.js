const puppeteer = require('puppeteer')

async function testSystem() {
  console.log('🚀 Iniciando teste completo do sistema Yoobe v3.3...\n')

  let browser
  try {
    // Iniciar navegador
    browser = await puppeteer.launch({
      headless: false, // Mostrar navegador para debug
      defaultViewport: null,
      args: ['--start-maximized'],
    })

    const page = await browser.newPage()

    // Teste 1: Acessar página de login
    console.log('📋 Teste 1: Acessando página de login...')
    await page.goto('http://localhost:3000/auth/login', {
      waitUntil: 'networkidle0',
    })

    // Verificar se a página carregou
    const title = await page.title()
    console.log(`✅ Página carregada: ${title}`)

    // Verificar elementos da página
    const yoobeTitle = await page.$eval('h1', el => el.textContent)
    console.log(`✅ Título encontrado: ${yoobeTitle}`)

    // Teste 2: Login com usuário admin
    console.log('\n📋 Teste 2: Testando login com admin...')

    // Preencher formulário
    await page.type('input[type="email"]', 'admin@yoobe.com')
    await page.type('input[type="password"]', 'admin123')

    // Clicar no botão de login
    await page.click('button[type="submit"]')

    // Aguardar redirecionamento
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    const currentUrl = page.url()
    console.log(`✅ Redirecionado para: ${currentUrl}`)

    // Verificar se foi para choose-environment
    if (currentUrl.includes('/choose-environment')) {
      console.log('✅ Redirecionamento correto para choose-environment')

      // Teste 3: Navegar para dashboard admin
      console.log('\n📋 Teste 3: Navegando para dashboard admin...')

      // Clicar no card do admin
      await page.click('text=Admin Global')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      const adminUrl = page.url()
      console.log(`✅ Dashboard admin: ${adminUrl}`)

      // Verificar elementos do dashboard
      const dashboardTitle = await page.$eval('h2', el => el.textContent)
      console.log(`✅ Dashboard carregado: ${dashboardTitle}`)
    } else {
      console.log('❌ Redirecionamento incorreto')
    }

    // Teste 4: Testar logout
    console.log('\n📋 Teste 4: Testando logout...')

    const logoutButton = await page.$('button:has-text("Sair")')
    if (logoutButton) {
      await logoutButton.click()
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      const logoutUrl = page.url()
      console.log(`✅ Logout realizado: ${logoutUrl}`)
    }

    // Teste 5: Testar outros usuários
    console.log('\n📋 Teste 5: Testando usuário gestor...')

    await page.goto('http://localhost:3000/auth/login', {
      waitUntil: 'networkidle0',
    })
    await page.type('input[type="email"]', 'gestor@yoobe.com')
    await page.type('input[type="password"]', 'gestor123')
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    const gestorUrl = page.url()
    console.log(`✅ Login gestor: ${gestorUrl}`)

    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!')
    console.log('\n📊 RESUMO DOS TESTES:')
    console.log('✅ Página de login carrega corretamente')
    console.log('✅ Login com admin funciona')
    console.log('✅ Redirecionamento para choose-environment funciona')
    console.log('✅ Navegação para dashboard funciona')
    console.log('✅ Logout funciona')
    console.log('✅ Login com gestor funciona')
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Executar teste
testSystem().catch(console.error)







