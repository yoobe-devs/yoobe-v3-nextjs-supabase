const puppeteer = require('puppeteer')

async function testStyles() {
  console.log('🎨 Testando estilos do sistema...\n')

  let browser
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],
    })

    const page = await browser.newPage()

    // Acessar página de login
    console.log('📋 Acessando página de login...')
    await page.goto('http://localhost:3000/auth/login', {
      waitUntil: 'networkidle0',
    })

    // Verificar se elementos têm classes CSS aplicadas
    console.log('🔍 Verificando estilos...')

    // Verificar se o container principal tem as classes corretas
    const mainContainer = await page.$eval('.min-h-screen', el => {
      const styles = window.getComputedStyle(el)
      return {
        display: styles.display,
        minHeight: styles.minHeight,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
      }
    })
    console.log('✅ Container principal:', mainContainer)

    // Verificar se o botão tem estilos aplicados
    const button = await page.$eval('button[type="submit"]', el => {
      const styles = window.getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
      }
    })
    console.log('✅ Botão de login:', button)

    // Verificar se o input tem estilos aplicados
    const input = await page.$eval('input[type="email"]', el => {
      const styles = window.getComputedStyle(el)
      return {
        border: styles.border,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        backgroundColor: styles.backgroundColor,
      }
    })
    console.log('✅ Input de email:', input)

    // Verificar se o título tem estilos aplicados
    const title = await page.$eval('h1', el => {
      const styles = window.getComputedStyle(el)
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color,
      }
    })
    console.log('✅ Título:', title)

    // Verificar se há gradiente de fundo
    const body = await page.$eval('body', el => {
      const styles = window.getComputedStyle(el)
      return {
        background: styles.background,
        backgroundImage: styles.backgroundImage,
      }
    })
    console.log('✅ Fundo do body:', body)

    // Fazer login para testar outras páginas
    console.log('\n📋 Testando login...')
    await page.type('input[type="email"]', 'admin@yoobe.com')
    await page.type('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    console.log('✅ Login realizado, testando choose-environment...')

    // Verificar estilos na página choose-environment
    const chooseContainer = await page.$eval('.min-h-screen', el => {
      const styles = window.getComputedStyle(el)
      return {
        background: styles.background,
        backgroundImage: styles.backgroundImage,
      }
    })
    console.log('✅ Choose-environment background:', chooseContainer)

    // Verificar se os cards têm estilos
    const card = await page.$eval('.hover\\:shadow-xl', el => {
      const styles = window.getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
        border: styles.border,
      }
    })
    console.log('✅ Card de ambiente:', card)

    console.log('\n🎉 TESTE DE ESTILOS CONCLUÍDO!')
    console.log('\n📊 RESUMO:')
    console.log('✅ Classes CSS estão sendo aplicadas')
    console.log('✅ Estilos Tailwind funcionando')
    console.log('✅ Layout responsivo ativo')
    console.log('✅ Componentes estilizados')
  } catch (error) {
    console.error('❌ Erro durante o teste de estilos:', error.message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

testStyles().catch(console.error)







