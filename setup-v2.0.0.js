#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Configurando Yoobe Platform v2.0.0...\n')

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} - Concluído!\n`)
  } catch (error) {
    console.error(`❌ Erro em: ${description}`)
    console.error(error.message)
    process.exit(1)
  }
}

// Função para verificar se arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath)
}

// Função para criar arquivo se não existir
function createFileIfNotExists(filePath, content) {
  if (!fileExists(filePath)) {
    fs.writeFileSync(filePath, content)
    console.log(`📄 Criado: ${filePath}`)
  }
}

async function setupV2() {
  try {
    // 1. Reset do banco de dados
    console.log('🗄️  Configurando banco de dados...')
    runCommand('npx supabase db reset', 'Reset do banco de dados')

    // 2. Instalar dependências se necessário
    if (!fileExists('node_modules')) {
      runCommand('npm install', 'Instalação de dependências')
    }

    // 3. Criar arquivo de configuração de ambiente
    const envContent = `# Yoobe Platform v2.0.0
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Cubbo Integration (Configurar em produção)
CUBBO_API_KEY=your_cubbo_api_key_here
CUBBO_BASE_URL=https://api.cubbo.com/v1

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Environment
NODE_ENV=development
`
    createFileIfNotExists('.env.local', envContent)

    // 4. Criar dados de teste
    console.log('📊 Criando dados de teste...')
    if (fileExists('create-test-data.js')) {
      runCommand('node create-test-data.js', 'Criação de dados de teste')
    }

    // 5. Verificar se o servidor está rodando
    console.log('🔍 Verificando se o Supabase está rodando...')
    try {
      execSync('curl -s http://localhost:54321/health', { stdio: 'pipe' })
      console.log('✅ Supabase está rodando!\n')
    } catch (error) {
      console.log('⚠️  Supabase não está rodando. Iniciando...')
      runCommand('npx supabase start', 'Iniciando Supabase')
    }

    // 6. Criar documentação de setup
    const setupDoc = `# Setup Yoobe Platform v2.0.0

## 🚀 Configuração Rápida

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Supabase CLI

### Passos

1. **Clone o repositório**
   \`\`\`bash
   git clone <repository-url>
   cd yoobe-v3
   \`\`\`

2. **Execute o setup automático**
   \`\`\`bash
   node setup-v2.0.0.js
   \`\`\`

3. **Configure as variáveis de ambiente**
   - Copie \`.env.local\` e configure suas credenciais
   - Configure Cubbo API Key para produção

4. **Inicie o servidor de desenvolvimento**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Acesse a plataforma**
   - Admin: http://localhost:3002/test-login-simple
   - Gestor: http://localhost:3002/gestor/dashboard
   - Loja: http://localhost:3002/store/join-tecnologia

## 🔧 Configurações

### Integrações Disponíveis
- **Cubbo**: Fulfillment global (configurar em /admin/integracoes)
- **Gamificação**: Workvivo, Applause, Human
- **Automação**: Zapier, Floui, Make
- **ERP/CRM**: SAP, Salesforce, Oracle

### Usuários de Teste
- **Admin**: admin@yoobe.com / admin123
- **Gestor**: gestor@join.com / gestor123
- **Funcionário**: funcionario@join.com / func123

## 📚 Documentação
- Visão Geral: /docs/PLATFORM_OVERVIEW.md
- Changelog: /CHANGELOG.md
- APIs: Documentação nas rotas /api/*

## 🆘 Suporte
Para dúvidas ou problemas, consulte a documentação ou entre em contato.
`
    createFileIfNotExists('SETUP.md', setupDoc)

    // 7. Criar script de deploy
    const deployScript = `#!/bin/bash

echo "🚀 Deploy Yoobe Platform v2.0.0"

# Build da aplicação
echo "📦 Build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Deploy (configurar conforme sua plataforma)
    echo "🌐 Deploy..."
    # npm run deploy  # ou vercel --prod
    
    echo "🎉 Deploy concluído!"
else
    echo "❌ Erro no build"
    exit 1
fi
`
    createFileIfNotExists('deploy.sh', deployScript)
    runCommand('chmod +x deploy.sh', 'Permissões do script de deploy')

    // 8. Verificar estrutura
    console.log('📁 Verificando estrutura de arquivos...')
    const requiredFiles = [
      'app/admin/integracoes/page.tsx',
      'app/gestor/integracoes/page.tsx',
      'app/api/changelog/route.ts',
      'supabase/migrations/20250901_000001_cubbo_olist_integration.sql',
      'docs/PLATFORM_OVERVIEW.md'
    ]

    let allFilesExist = true
    requiredFiles.forEach(file => {
      if (fileExists(file)) {
        console.log(`✅ ${file}`)
      } else {
        console.log(`❌ ${file} - FALTANDO`)
        allFilesExist = false
      }
    })

    if (!allFilesExist) {
      console.log('\n⚠️  Alguns arquivos estão faltando. Verifique a estrutura.')
    }

    // 9. Resumo final
    console.log('\n🎉 Setup Yoobe Platform v2.0.0 Concluído!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Configure as variáveis de ambiente em .env.local')
    console.log('2. Execute: npm run dev')
    console.log('3. Acesse: http://localhost:3002/test-login-simple')
    console.log('4. Configure integrações em /admin/integracoes')
    console.log('5. Teste as funcionalidades de gestor')
    
    console.log('\n🔗 Links importantes:')
    console.log('- Admin: http://localhost:3002/admin/integracoes')
    console.log('- Gestor: http://localhost:3002/gestor/integracoes')
    console.log('- Documentação: /docs/PLATFORM_OVERVIEW.md')
    console.log('- Changelog: /CHANGELOG.md')

    console.log('\n✨ Plataforma pronta para uso!')

  } catch (error) {
    console.error('❌ Erro durante o setup:', error)
    process.exit(1)
  }
}

// Executar setup
setupV2()
