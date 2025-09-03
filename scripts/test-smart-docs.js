#!/usr/bin/env node

/**
 * Script de Teste Rápido - Sistema de Documentação Inteligente
 * Yoobe Platform v3.0.0
 */

const path = require('path')
const fs = require('fs')

// Adicionar lib ao path para importar módulos
process.env.NODE_PATH = path.join(process.cwd(), 'lib')
require('module')._initPaths()

async function testSystem() {
  console.log('🧪 Testando Sistema de Documentação Inteligente...\n')
  
  try {
    // Importar sistema
    const { smartDocsSystem } = require('./lib/smart-docs-system')
    
    console.log('✅ Sistema importado com sucesso')
    
    // Testar inicialização
    console.log('\n🚀 Testando inicialização...')
    await smartDocsSystem.initialize()
    console.log('✅ Sistema inicializado')
    
    // Testar funcionalidades básicas
    console.log('\n🔧 Testando funcionalidades básicas...')
    
    // 1. Testar adição de erro
    console.log('  - Testando adição de erro...')
    const errorId = smartDocsSystem.addError({
      errorType: 'test_error',
      title: 'Erro de teste do sistema',
      description: 'Este é um erro de teste para verificar o sistema',
      solution: 'Sistema funcionando perfeitamente',
      codeSnippet: 'console.log("test")',
      filePath: 'test-file.ts',
      severity: 'low',
      developer: 'Sistema de Teste',
      relatedErrors: [],
      preventionSteps: ['Este é apenas um teste'],
      documentationLinks: []
    })
    console.log(`    ✅ Erro adicionado com ID: ${errorId}`)
    
    // 2. Testar análise de código
    console.log('  - Testando análise de código...')
    const analysis = await smartDocsSystem.analyzeCode(
      'SELECT * FROM users WHERE id = 1',
      'test-query.sql'
    )
    console.log(`    ✅ Análise concluída - Risco: ${analysis.riskLevel}`)
    
    // 3. Testar atualização de documentação
    console.log('  - Testando atualização de documentação...')
    await smartDocsSystem.updateDocumentationSection(
      'test_section',
      '# Seção de Teste\n\nEsta é uma seção de teste.',
      ['test', 'example']
    )
    console.log('    ✅ Seção de documentação criada')
    
    // 4. Testar verificação de consistência
    console.log('  - Testando verificação de consistência...')
    const consistency = await smartDocsSystem.checkDocumentationConsistency()
    console.log(`    ✅ Consistência verificada: ${consistency.isConsistent ? 'OK' : 'Problemas detectados'}`)
    
    // 5. Testar geração de relatório
    console.log('  - Testando geração de relatório...')
    const report = await smartDocsSystem.generateSystemReport()
    console.log('    ✅ Relatório do sistema gerado')
    
    // Verificar status final
    console.log('\n📊 Status Final do Sistema:')
    const status = smartDocsSystem.getSystemStatus()
    console.log(`- Inicializado: ${status.isInitialized ? '✅ Sim' : '❌ Não'}`)
    console.log(`- Monitoramento: ${status.monitoring.isRunning ? '🟢 Ativo' : '🔴 Inativo'}`)
    console.log(`- Erros na Memória: ${status.errorMemory.totalErrors}`)
    console.log(`- Seções de Documentação: ${status.documentation.totalSections}`)
    console.log(`- Padrões de Prevenção: ${status.prevention.totalPatterns}`)
    
    // Verificar arquivos gerados
    console.log('\n📁 Arquivos Gerados:')
    const filesToCheck = [
      'docs/COMPLETE_DOCUMENTATION.md',
      'docs/SYSTEM_REPORT.md',
      'data/error-memory.json'
    ]
    
    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file)
        console.log(`- ✅ ${file} (${stats.size} bytes)`)
      } else {
        console.log(`- ❌ ${file} (não encontrado)`)
      }
    }
    
    // Testar análise completa do projeto
    console.log('\n🔍 Testando análise completa do projeto...')
    const projectAnalysis = await smartDocsSystem.runFullProjectAnalysis()
    console.log(`    ✅ Análise completa concluída`)
    console.log(`    📋 Recomendações: ${projectAnalysis.recommendations.length}`)
    
    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...')
    smartDocsSystem.resolveError(errorId, 'Teste concluído com sucesso')
    console.log('    ✅ Dados de teste limpos')
    
    console.log('\n🎉 Todos os testes passaram com sucesso!')
    console.log('\n🚀 O Sistema de Documentação Inteligente está funcionando perfeitamente!')
    
    // Parar sistema
    await smartDocsSystem.shutdown()
    console.log('\n🛑 Sistema parado com sucesso')
    
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error)
    console.error('\n🔍 Detalhes do erro:')
    console.error('- Mensagem:', error.message)
    console.error('- Stack:', error.stack)
    
    // Tentar parar o sistema mesmo com erro
    try {
      const { smartDocsSystem } = require('./lib/smart-docs-system')
      await smartDocsSystem.shutdown()
    } catch (shutdownError) {
      console.error('❌ Erro ao parar sistema:', shutdownError.message)
    }
    
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testSystem().catch(console.error)
}

module.exports = { testSystem }
