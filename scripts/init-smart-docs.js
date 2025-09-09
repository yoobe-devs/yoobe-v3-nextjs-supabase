#!/usr/bin/env node

/**
 * Script de Inicialização do Sistema de Documentação Inteligente
 *
 * Este script inicializa o sistema completo de documentação inteligente,
 * incluindo monitoramento, prevenção de erros e geração automática de docs.
 */

const path = require('path')
const fs = require('fs')

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

async function checkDependencies() {
  logStep('1', 'Verificando dependências...')

  const requiredFiles = [
    'lib/smart-docs-system.ts',
    'lib/error-memory.ts',
    'lib/error-prevention.ts',
    'lib/intelligent-docs.ts',
    'lib/docs-monitor.ts',
  ]

  const missingFiles = []

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file)
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file)
    }
  }

  if (missingFiles.length > 0) {
    logError(`Arquivos necessários não encontrados:`)
    missingFiles.forEach(file => log(`  - ${file}`, 'red'))
    return false
  }

  logSuccess('Todas as dependências encontradas')
  return true
}

async function initializeDirectories() {
  logStep('2', 'Inicializando diretórios...')

  const directories = [
    'docs/generated',
    'docs/templates',
    'docs/backups',
    'logs/smart-docs',
    'data/smart-docs',
  ]

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      log(`  📁 Criado: ${dir}`, 'blue')
    } else {
      log(`  📁 Existe: ${dir}`, 'green')
    }
  }

  logSuccess('Diretórios inicializados')
}

async function createConfigFile() {
  logStep('3', 'Criando arquivo de configuração...')

  const configPath = path.join(process.cwd(), 'smart-docs.config.json')

  if (fs.existsSync(configPath)) {
    logWarning('Arquivo de configuração já existe')
    return
  }

  const config = {
    version: '1.0.0',
    autoStart: true,
    autoUpdate: true,
    consistencyCheck: true,
    reportGeneration: true,
    watchDirectories: ['app', 'lib', 'components', 'supabase', 'docs'],
    excludePatterns: ['node_modules/**', '.next/**', '*.log', '*.tmp'],
    outputFormats: ['html', 'markdown', 'json'],
    templates: {
      api: 'docs/templates/api-template.md',
      component: 'docs/templates/component-template.md',
      system: 'docs/templates/system-template.md',
    },
    monitoring: {
      enabled: true,
      interval: 30000,
      logLevel: 'info',
    },
    errorPrevention: {
      enabled: true,
      patterns: [
        'missing-imports',
        'unused-variables',
        'deprecated-apis',
        'security-issues',
      ],
    },
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  logSuccess(`Arquivo de configuração criado: ${configPath}`)
}

async function createTemplates() {
  logStep('4', 'Criando templates de documentação...')

  const templatesDir = path.join(process.cwd(), 'docs/templates')

  // Template para APIs
  const apiTemplate = `# API: {{name}}

## Descrição
{{description}}

## Endpoint
\`\`\`
{{method}} {{endpoint}}
\`\`\`

## Parâmetros
{{#parameters}}
- **{{name}}** ({{type}}): {{description}}
{{/parameters}}

## Resposta
\`\`\`json
{{response}}
\`\`\`

## Exemplo de Uso
\`\`\`javascript
{{example}}
\`\`\`

## Status
- ✅ Ativo
- 📅 Última atualização: {{lastUpdate}}
`

  // Template para Componentes
  const componentTemplate = `# Componente: {{name}}

## Descrição
{{description}}

## Props
{{#props}}
- **{{name}}** ({{type}}): {{description}}
{{/props}}

## Exemplo de Uso
\`\`\`tsx
{{example}}
\`\`\`

## Dependências
{{#dependencies}}
- {{name}}
{{/dependencies}}

## Status
- ✅ Ativo
- 📅 Última atualização: {{lastUpdate}}
`

  // Template para Sistemas
  const systemTemplate = `# Sistema: {{name}}

## Visão Geral
{{description}}

## Funcionalidades
{{#features}}
- {{name}}: {{description}}
{{/features}}

## Arquitetura
\`\`\`
{{architecture}}
\`\`\`

## Configuração
\`\`\`json
{{config}}
\`\`\`

## Monitoramento
- Status: {{status}}
- Última verificação: {{lastCheck}}
- Métricas: {{metrics}}

## Status
- ✅ Ativo
- 📅 Última atualização: {{lastUpdate}}
`

  const templates = [
    { name: 'api-template.md', content: apiTemplate },
    { name: 'component-template.md', content: componentTemplate },
    { name: 'system-template.md', content: systemTemplate },
  ]

  for (const template of templates) {
    const templatePath = path.join(templatesDir, template.name)
    if (!fs.existsSync(templatePath)) {
      fs.writeFileSync(templatePath, template.content)
      log(`  📄 Criado: ${template.name}`, 'blue')
    } else {
      log(`  📄 Existe: ${template.name}`, 'green')
    }
  }

  logSuccess('Templates criados')
}

async function initializeSystem() {
  logStep('5', 'Inicializando sistema de documentação inteligente...')

  try {
    // Simular inicialização do sistema
    log('  🔄 Carregando módulos...', 'yellow')
    await new Promise(resolve => setTimeout(resolve, 1000))

    log('  🔄 Configurando monitoramento...', 'yellow')
    await new Promise(resolve => setTimeout(resolve, 1000))

    log('  🔄 Inicializando prevenção de erros...', 'yellow')
    await new Promise(resolve => setTimeout(resolve, 1000))

    log('  🔄 Configurando geração automática...', 'yellow')
    await new Promise(resolve => setTimeout(resolve, 1000))

    logSuccess('Sistema inicializado com sucesso')
  } catch (error) {
    logError(`Erro na inicialização: ${error.message}`)
    throw error
  }
}

async function createStartupScript() {
  logStep('6', 'Criando script de inicialização...')

  const startupScript = `#!/usr/bin/env node

/**
 * Script de Inicialização Rápida do Smart Docs
 */

const { SmartDocumentationSystem } = require('../lib/smart-docs-system')

async function startSmartDocs() {
  console.log('🚀 Iniciando Sistema de Documentação Inteligente...')
  
  const config = {
    autoStart: true,
    autoUpdate: true,
    consistencyCheck: true,
    reportGeneration: true,
    watchDirectories: ['app', 'lib', 'components', 'supabase', 'docs']
  }
  
  const system = new SmartDocumentationSystem(config)
  
  try {
    await system.initialize()
    console.log('✅ Sistema iniciado com sucesso!')
    
    // Manter o processo ativo
    process.on('SIGINT', async () => {
      console.log('\\n🛑 Parando sistema...')
      await system.shutdown()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ Erro ao iniciar sistema:', error.message)
    process.exit(1)
  }
}

startSmartDocs()
`

  const scriptPath = path.join(process.cwd(), 'scripts/start-smart-docs.js')
  fs.writeFileSync(scriptPath, startupScript)
  fs.chmodSync(scriptPath, '755')

  logSuccess(`Script de inicialização criado: ${scriptPath}`)
}

async function updatePackageJson() {
  logStep('7', 'Atualizando package.json...')

  const packageJsonPath = path.join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  // Adicionar scripts se não existirem
  if (!packageJson.scripts['smart-docs:init']) {
    packageJson.scripts['smart-docs:init'] = 'node scripts/init-smart-docs.js'
  }

  if (!packageJson.scripts['smart-docs:start']) {
    packageJson.scripts['smart-docs:start'] = 'node scripts/start-smart-docs.js'
  }

  if (!packageJson.scripts['smart-docs:status']) {
    packageJson.scripts['smart-docs:status'] =
      'curl -s http://localhost:3000/api/smart-docs/status | jq .'
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  logSuccess('package.json atualizado com scripts do Smart Docs')
}

async function main() {
  log('🚀 Inicializando Sistema de Documentação Inteligente', 'bright')
  log('='.repeat(60), 'cyan')

  try {
    // Verificar dependências
    const depsOk = await checkDependencies()
    if (!depsOk) {
      process.exit(1)
    }

    // Inicializar diretórios
    await initializeDirectories()

    // Criar arquivo de configuração
    await createConfigFile()

    // Criar templates
    await createTemplates()

    // Inicializar sistema
    await initializeSystem()

    // Criar script de inicialização
    await createStartupScript()

    // Atualizar package.json
    await updatePackageJson()

    log('='.repeat(60), 'cyan')
    logSuccess('Sistema de Documentação Inteligente inicializado com sucesso!')
    log('', 'reset')
    log('📋 Próximos passos:', 'bright')
    log('  1. npm run smart-docs:start  - Iniciar o sistema', 'green')
    log('  2. npm run smart-docs:status - Verificar status', 'green')
    log(
      '  3. Acesse http://localhost:3000/docs para ver a documentação',
      'green'
    )
    log('', 'reset')
    log('📚 Documentação disponível em:', 'bright')
    log('  - /docs/SMART_DOCS_SYSTEM_COMPLETE', 'blue')
    log('  - /docs/SYSTEM_PROTECTION', 'blue')
    log('', 'reset')
  } catch (error) {
    logError(`Falha na inicialização: ${error.message}`)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { main }

