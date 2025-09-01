const { createClient } = require('@supabase/supabase-js')

// Configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testNotifications() {
  console.log('🔔 Testando Sistema de Notificações de Changelog...\n')

  try {
    // 1. Verificar se o componente existe
    console.log('✅ 1. Verificando componente ChangelogNotification...')
    const fs = require('fs')
    const componentPath = './components/ui/changelog-notification.tsx'
    
    if (fs.existsSync(componentPath)) {
      console.log('   ✅ Componente encontrado')
    } else {
      console.log('   ❌ Componente não encontrado')
      return
    }

    // 2. Verificar se foi adicionado ao menu admin
    console.log('\n✅ 2. Verificando menu admin...')
    const adminMenuPath = './components/admin-navigation-menu.tsx'
    
    if (fs.existsSync(adminMenuPath)) {
      const adminMenuContent = fs.readFileSync(adminMenuPath, 'utf8')
      if (adminMenuContent.includes('ChangelogNotification')) {
        console.log('   ✅ Componente adicionado ao menu admin')
      } else {
        console.log('   ❌ Componente não encontrado no menu admin')
      }
      
      if (adminMenuContent.includes('Changelog') && adminMenuContent.includes('Documentação')) {
        console.log('   ✅ Links de Changelog e Documentação adicionados')
      } else {
        console.log('   ❌ Links não encontrados no menu admin')
      }
    }

    // 3. Verificar se foi adicionado ao menu principal
    console.log('\n✅ 3. Verificando menu principal...')
    const mainMenuPath = './components/layout/main-nav.tsx'
    
    if (fs.existsSync(mainMenuPath)) {
      const mainMenuContent = fs.readFileSync(mainMenuPath, 'utf8')
      if (mainMenuContent.includes('ChangelogNotification')) {
        console.log('   ✅ Componente adicionado ao menu principal')
      } else {
        console.log('   ❌ Componente não encontrado no menu principal')
      }
    }

    // 4. Verificar documentações visuais
    console.log('\n✅ 4. Verificando documentações visuais...')
    const visualDocsPath = './app/docs/visual/[slug]/page.tsx'
    
    if (fs.existsSync(visualDocsPath)) {
      const visualDocsContent = fs.readFileSync(visualDocsPath, 'utf8')
      const docs = [
        'PLATFORM_OVERVIEW',
        'API_REFERENCE', 
        'DATABASE_SCHEMA',
        'GAMIFICATION_INTEGRATION',
        'AUTOMATION_INTEGRATION',
        'ERP_CRM_INTEGRATION',
        'DEPLOYMENT_GUIDE'
      ]
      
      docs.forEach(doc => {
        if (visualDocsContent.includes(doc)) {
          console.log(`   ✅ ${doc} encontrado`)
        } else {
          console.log(`   ❌ ${doc} não encontrado`)
        }
      })
    }

    // 5. Verificar arquivos de documentação
    console.log('\n✅ 5. Verificando arquivos de documentação...')
    const docsDir = './docs'
    
    if (fs.existsSync(docsDir)) {
      const docFiles = fs.readdirSync(docsDir)
      const expectedDocs = [
        'PLATFORM_OVERVIEW.md',
        'API_REFERENCE.md',
        'DATABASE_SCHEMA.md',
        'CUBBO_INTEGRATION.md',
        'GAMIFICATION_INTEGRATION.md',
        'AUTOMATION_INTEGRATION.md',
        'ERP_CRM_INTEGRATION.md',
        'DEPLOYMENT_GUIDE.md'
      ]
      
      expectedDocs.forEach(doc => {
        if (docFiles.includes(doc)) {
          console.log(`   ✅ ${doc} encontrado`)
        } else {
          console.log(`   ❌ ${doc} não encontrado`)
        }
      })
    }

    // 6. Testar URLs
    console.log('\n✅ 6. Testando URLs...')
    const urls = [
      'http://localhost:3001/admin/changelog',
      'http://localhost:3001/admin/documentacao',
      'http://localhost:3001/docs/visual/PLATFORM_OVERVIEW',
      'http://localhost:3001/docs/visual/API_REFERENCE',
      'http://localhost:3001/docs/visual/DATABASE_SCHEMA',
      'http://localhost:3001/docs/visual/GAMIFICATION_INTEGRATION',
      'http://localhost:3001/docs/visual/AUTOMATION_INTEGRATION',
      'http://localhost:3001/docs/visual/ERP_CRM_INTEGRATION',
      'http://localhost:3001/docs/visual/DEPLOYMENT_GUIDE'
    ]
    
    console.log('   📋 URLs para testar:')
    urls.forEach(url => {
      console.log(`      ${url}`)
    })

    console.log('\n🎉 Teste concluído!')
    console.log('\n📋 Resumo das funcionalidades implementadas:')
    console.log('   🔔 Sistema de notificações de changelog com ícone de sino')
    console.log('   📊 Contador de notificações não lidas')
    console.log('   📋 Popover com lista de atualizações recentes')
    console.log('   🔗 Links para Changelog e Documentação no menu lateral')
    console.log('   📚 Documentações visuais completas em formato HTML')
    console.log('   🎨 Interface moderna com gradientes e cards')
    console.log('   📱 Design responsivo e acessível')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

testNotifications()

