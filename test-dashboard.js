const puppeteer = require('puppeteer')

async function testDashboard() {
  console.log('🔍 Testando dashboard admin...\n')

  let browser
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],
    })

    const page = await browser.newPage()

    // Acessar página de login
    console.log('📋 Fazendo login...')
    await page.goto('http://localhost:3000/auth/login', {
      waitUntil: 'networkidle0',
    })

    // Fazer login
    await page.type('input[type="email"]', 'admin@yoobe.com')
    await page.type('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    console.log('✅ Login realizado')

    // Ir para choose-environment
    console.log('📋 Navegando para choose-environment...')
    const currentUrl = page.url()
    console.log('URL atual:', currentUrl)

    if (currentUrl.includes('/choose-environment')) {
      // Clicar no card do admin
      console.log('📋 Clicando no card Admin Global...')
      await page.click('text=Admin Global')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      const dashboardUrl = page.url()
      console.log('✅ Dashboard URL:', dashboardUrl)

      // Verificar se a página carregou
      const pageTitle = await page.title()
      console.log('✅ Título da página:', pageTitle)

      // Verificar se há elementos na página
      const hasHeader = await page.$('header')
      console.log('✅ Header presente:', !!hasHeader)

      const hasMain = await page.$('main')
      console.log('✅ Main presente:', !!hasMain)

      const hasCards = await page.$$('.rounded-lg')
      console.log('✅ Cards encontrados:', hasCards.length)

      // Verificar se há texto na página
      const pageText = await page.evaluate(() => document.body.innerText)
      console.log(
        '📄 Texto da página (primeiros 200 chars):',
        pageText.substring(0, 200)
      )

      // Verificar se há erros no console
      const logs = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          logs.push(msg.text())
        }
      })

      // Aguardar um pouco para capturar logs
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (logs.length > 0) {
        console.log('❌ Erros no console:', logs)
      } else {
        console.log('✅ Nenhum erro no console')
      }

      // Verificar se há elementos específicos do dashboard
      const dashboardTitle = await page.$('h2')
      if (dashboardTitle) {
        const titleText = await dashboardTitle.evaluate(el => el.textContent)
        console.log('✅ Título do dashboard:', titleText)
      } else {
        console.log('❌ Título do dashboard não encontrado')
      }

      // Verificar se há cards de estatísticas
      const statCards = await page.$$('.text-2xl')
      console.log('✅ Cards de estatísticas:', statCards.length)

      // Verificar se há botões
      const buttons = await page.$$('button')
      console.log('✅ Botões encontrados:', buttons.length)
    } else {
      console.log('❌ Não foi redirecionado para choose-environment')
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

testDashboard().catch(console.error)
