#!/usr/bin/env node

/**
 * Script de Inicialização Rápida do Smart Docs
 */

// Importação será feita via ts-node se disponível
let SmartDocumentationSystem
try {
  // Tentar importar via ts-node
  require('ts-node/register')
  SmartDocumentationSystem =
    require('../lib/smart-docs-system').SmartDocumentationSystem
} catch (error) {
  console.log('⚠️  ts-node não disponível, usando simulação do sistema')
  // Simulação básica do sistema
  SmartDocumentationSystem = class {
    constructor(config) {
      this.config = config
    }

    async initialize() {
      console.log('🔄 Inicializando sistema simulado...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ Sistema simulado inicializado')
    }

    async shutdown() {
      console.log('🛑 Parando sistema simulado...')
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('✅ Sistema simulado parado')
    }
  }
}

async function startSmartDocs() {
  console.log('🚀 Iniciando Sistema de Documentação Inteligente...')

  const config = {
    autoStart: true,
    autoUpdate: true,
    consistencyCheck: true,
    reportGeneration: true,
    watchDirectories: ['app', 'lib', 'components', 'supabase', 'docs'],
  }

  const system = new SmartDocumentationSystem(config)

  try {
    await system.initialize()
    console.log('✅ Sistema iniciado com sucesso!')

    // Manter o processo ativo
    process.on('SIGINT', async () => {
      console.log('\n🛑 Parando sistema...')
      await system.shutdown()
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ Erro ao iniciar sistema:', error.message)
    process.exit(1)
  }
}

startSmartDocs()
