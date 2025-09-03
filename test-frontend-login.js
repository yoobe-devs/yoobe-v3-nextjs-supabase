const puppeteer = require('puppeteer')

async function testFrontendLogin() {
  console.log('🌐 Testando login no frontend...')
  
  let browser
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 1000
    })
    
    const page = await browser.newPage()
    
    // Acessar página de login
    console.log('📱 Acessando página de login...')
    await page.goto('http://localhost:3001/auth/login')
    await page.waitForSelector('form')
    
    // Preencher credenciais do admin
    console.log('✏️ Preenchendo credenciais...')
    await page.type('#email', 'admin@yoobe.com')
    await page.type('#password', 'admin123')
    
    // Clicar no botão de login
    console.log('🔘 Clicando no botão de login...')
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {})
    ])
    
    // Aguardar redirecionamento ou erro
    console.log('⏳ Aguardando resposta...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verificar se foi redirecionado
    const currentUrl = page.url()
    console.log('📍 URL atual:', currentUrl)
    
    if (currentUrl.includes('/choose-environment')) {
      console.log('✅ Login bem-sucedido! Redirecionado para choose-environment')
    } else if (currentUrl.includes('/admin')) {
      console.log('✅ Login bem-sucedido! Redirecionado para admin')
    } else {
      console.log('❌ Login falhou ou não foi redirecionado')
      
      // Verificar se há mensagem de erro
      const errorElement = await page.$('.text-red-600')
      if (errorElement) {
        const errorText = await errorElement.textContent()
        console.log('❌ Mensagem de erro:', errorText)
      }
    }
    
    // Capturar screenshot
    await page.screenshot({ path: 'login-test.png' })
    console.log('📸 Screenshot salvo como login-test.png')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

testFrontendLogin().catch(console.error)
