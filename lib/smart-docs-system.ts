import { errorMemorySystem } from './error-memory'
import { errorPreventionSystem } from './error-prevention'
import { intelligentDocs } from './intelligent-docs'
import { docsMonitor } from './docs-monitor'

export interface SystemStatus {
  isInitialized: boolean
  errorMemory: {
    totalErrors: number
    resolvedErrors: number
    unresolvedErrors: number
  }
  prevention: {
    totalPatterns: number
    highRiskPatterns: number
  }
  documentation: {
    totalSections: number
    lastUpdate: Date | null
  }
  monitoring: {
    isRunning: boolean
    watchedDirectories: number
  }
}

export interface SystemConfig {
  autoStart: boolean
  autoUpdate: boolean
  consistencyCheck: boolean
  reportGeneration: boolean
  watchDirectories: string[]
}

export class SmartDocumentationSystem {
  private isInitialized = false
  private config: SystemConfig

  constructor(config: Partial<SystemConfig> = {}) {
    this.config = {
      autoStart: true,
      autoUpdate: true,
      consistencyCheck: true,
      reportGeneration: true,
      watchDirectories: ['app', 'lib', 'components', 'supabase'],
      ...config
    }
  }

  // Inicializar sistema completo
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Sistema já inicializado')
      return
    }

    console.log('🚀 Inicializando Sistema de Documentação Inteligente...')

    try {
      // Verificar e criar diretórios necessários
      await this.ensureDirectories()
      
      // Inicializar componentes
      await this.initializeComponents()
      
      // Configurar monitoramento
      this.configureMonitoring()
      
      // Iniciar monitoramento se habilitado
      if (this.config.autoStart) {
        await this.startMonitoring()
      }
      
      // Verificação inicial
      await this.performInitialCheck()
      
      this.isInitialized = true
      console.log('✅ Sistema de Documentação Inteligente inicializado com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema:', error)
      throw error
    }
  }

  // Garantir que diretórios necessários existam
  private async ensureDirectories(): Promise<void> {
    const fs = require('fs')
    const path = require('path')
    
    const directories = [
      'data',
      'docs/templates',
      'docs/sections'
    ]
    
    for (const dir of directories) {
      const dirPath = path.join(process.cwd(), dir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
        console.log(`📁 Diretório criado: ${dir}`)
      }
    }
  }

  // Inicializar componentes do sistema
  private async initializeComponents(): Promise<void> {
    console.log('🔧 Inicializando componentes...')
    
    try {
      // Verificar se os sistemas estão funcionando
      const errorCount = errorMemorySystem.getAllErrors().length
      const preventionStats = errorPreventionSystem.getPreventionStats()
      const docSections = intelligentDocs.getAllSections().length
      
      console.log(`✅ Sistema de Memória de Erros: ${errorCount} erros carregados`)
      console.log(`✅ Sistema de Prevenção: ${preventionStats.totalPatterns} padrões ativos`)
      console.log(`✅ Sistema de Documentação: ${docSections} seções carregadas`)
      
    } catch (error) {
      console.error('❌ Erro ao inicializar componentes:', error)
      throw error
    }
  }

  // Configurar monitoramento
  private configureMonitoring(): void {
    docsMonitor.updateConfig({
      watchDirectories: this.config.watchDirectories,
      autoUpdate: this.config.autoUpdate,
      consistencyCheck: this.config.consistencyCheck,
      reportGeneration: this.config.reportGeneration
    })
    
    console.log('⚙️ Monitoramento configurado')
  }

  // Iniciar monitoramento
  async startMonitoring(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Sistema deve ser inicializado antes de iniciar monitoramento')
    }
    
    await docsMonitor.startMonitoring()
    console.log('📡 Monitoramento iniciado')
  }

  // Parar monitoramento
  async stopMonitoring(): Promise<void> {
    await docsMonitor.stopMonitoring()
    console.log('🛑 Monitoramento parado')
  }

  // Verificação inicial do sistema
  private async performInitialCheck(): Promise<void> {
    console.log('🔍 Realizando verificação inicial do sistema...')
    
    try {
      // Verificar consistência da documentação
      const consistency = await intelligentDocs.checkConsistency()
      
      if (!consistency.isConsistent) {
        console.warn('⚠️ Inconsistências detectadas na documentação:')
        for (const inconsistency of consistency.inconsistencies) {
          console.warn(`  - ${inconsistency}`)
        }
      }
      
      // Gerar relatório inicial
      await this.generateSystemReport()
      
      console.log('✅ Verificação inicial concluída')
      
    } catch (error) {
      console.error('❌ Erro na verificação inicial:', error)
    }
  }

  // Gerar relatório completo do sistema
  async generateSystemReport(): Promise<string> {
    console.log('📊 Gerando relatório completo do sistema...')
    
    try {
      const reportPath = path.join(process.cwd(), 'docs', 'SYSTEM_REPORT.md')
      
      const status = this.getSystemStatus()
      const errorReport = errorMemorySystem.generateErrorReport()
      const preventionStats = errorPreventionSystem.getPreventionStats()
      
      const report = `# 🚀 Relatório do Sistema de Documentação Inteligente - Yoobe Platform

## 🕐 Última Atualização
${new Date().toLocaleString('pt-BR')}

## 📊 Status do Sistema
- **Inicializado:** ${status.isInitialized ? '✅ Sim' : '❌ Não'}
- **Monitoramento:** ${status.monitoring.isRunning ? '🟢 Ativo' : '🔴 Inativo'}
- **Diretórios Monitorados:** ${status.monitoring.watchedDirectories}

## 🚨 Sistema de Memória de Erros
- **Total de Erros:** ${status.errorMemory.totalErrors}
- **Erros Resolvidos:** ${status.errorMemory.resolvedErrors}
- **Erros Pendentes:** ${status.errorMemory.unresolvedErrors}

## 🛡️ Sistema de Prevenção
- **Padrões Ativos:** ${status.prevention.totalPatterns}
- **Padrões de Alto Risco:** ${status.prevention.highRiskPatterns}

## 📚 Sistema de Documentação
- **Seções Ativas:** ${status.documentation.totalSections}
- **Última Atualização:** ${status.documentation.lastUpdate ? status.documentation.lastUpdate.toLocaleString('pt-BR') : 'Nunca'}

---

## 📋 Relatório de Erros
${errorReport}

---

## 🔍 Estatísticas de Prevenção
- **Padrões SQL:** ${preventionStats.patternsByCategory['SQL'] || 0}
- **Padrões de Segurança:** ${preventionStats.patternsByCategory['Segurança'] || 0}
- **Padrões de Performance:** ${preventionStats.patternsByCategory['Performance'] || 0}
- **Padrões de Validação:** ${preventionStats.patternsByCategory['Validação'] || 0}

---

## 🎯 Funcionalidades Ativas
- ✅ **Memória de Erros:** Sistema de aprendizado contínuo
- ✅ **Prevenção Inteligente:** Detecção automática de problemas
- ✅ **Auto-documentação:** Atualização automática da documentação
- ✅ **Monitoramento:** Observação contínua de mudanças
- ✅ **Consistência:** Verificação automática de sincronização

---

*Relatório gerado automaticamente pelo Sistema de Documentação Inteligente*
`

      require('fs').writeFileSync(reportPath, report)
      console.log('✅ Relatório do sistema gerado')
      
      return report
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório do sistema:', error)
      throw error
    }
  }

  // Obter status completo do sistema
  getSystemStatus(): SystemStatus {
    const errors = errorMemorySystem.getAllErrors()
    const preventionStats = errorPreventionSystem.getPreventionStats()
    const sections = intelligentDocs.getAllSections()
    const monitoringStatus = docsMonitor.getStatus()
    
    return {
      isInitialized: this.isInitialized,
      errorMemory: {
        totalErrors: errors.length,
        resolvedErrors: errors.filter(e => e.resolved).length,
        unresolvedErrors: errors.filter(e => !e.resolved).length
      },
      prevention: {
        totalPatterns: preventionStats.totalPatterns,
        highRiskPatterns: preventionStats.highRiskPatterns
      },
      documentation: {
        totalSections: sections.length,
        lastUpdate: sections.length > 0 ? 
          sections.reduce((latest, section) => 
            section.lastUpdated > latest ? section.lastUpdated : latest
          , sections[0].lastUpdated) : null
      },
      monitoring: {
        isRunning: monitoringStatus.isRunning,
        watchedDirectories: monitoringStatus.watchedDirectories
      }
    }
  }

  // Adicionar erro à memória
  addError(error: Parameters<typeof errorMemorySystem.addError>[0]): string {
    return errorMemorySystem.addError(error)
  }

  // Resolver erro
  resolveError(errorId: string, resolutionNotes?: string): void {
    errorMemorySystem.resolveError(errorId, resolutionNotes)
  }

  // Analisar código
  async analyzeCode(code: string, filePath: string): Promise<ReturnType<typeof errorPreventionSystem.analyzeCode>> {
    return await errorPreventionSystem.analyzeCode(code, filePath)
  }

  // Analisar arquivo
  async analyzeFile(filePath: string): Promise<ReturnType<typeof errorPreventionSystem.analyzeFile>> {
    return await errorPreventionSystem.analyzeFile(filePath)
  }

  // Atualizar seção de documentação
  async updateDocumentationSection(sectionId: string, content: string, tags: string[] = []): Promise<void> {
    await intelligentDocs.updateSection(sectionId, content, tags)
  }

  // Verificar consistência
  async checkDocumentationConsistency(): Promise<ReturnType<typeof intelligentDocs.checkConsistency>> {
    return await intelligentDocs.checkConsistency()
  }

  // Forçar atualização completa
  async forceFullUpdate(): Promise<void> {
    await docsMonitor.forceFullUpdate()
  }

  // Atualizar configuração do sistema
  updateSystemConfig(updates: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...updates }
    
    // Aplicar mudanças ao monitoramento
    docsMonitor.updateConfig({
      watchDirectories: this.config.watchDirectories,
      autoUpdate: this.config.autoUpdate,
      consistencyCheck: this.config.consistencyCheck,
      reportGeneration: this.config.reportGeneration
    })
    
    console.log('⚙️ Configuração do sistema atualizada')
  }

  // Obter configuração atual
  getSystemConfig(): SystemConfig {
    return { ...this.config }
  }

  // Executar análise completa do projeto
  async runFullProjectAnalysis(): Promise<{
    codeAnalysis: Map<string, any>
    documentationStatus: any
    recommendations: string[]
  }> {
    console.log('🔍 Executando análise completa do projeto...')
    
    try {
      // Analisar código
      const codeAnalysis = await errorPreventionSystem.analyzeDirectory('app')
      const libAnalysis = await errorPreventionSystem.analyzeDirectory('lib')
      
      // Combinar análises
      const combinedAnalysis = new Map([...codeAnalysis, ...libAnalysis])
      
      // Verificar documentação
      const documentationStatus = await intelligentDocs.checkConsistency()
      
      // Gerar recomendações
      const recommendations = this.generateRecommendations(combinedAnalysis, documentationStatus)
      
      console.log('✅ Análise completa concluída')
      
      return {
        codeAnalysis: combinedAnalysis,
        documentationStatus,
        recommendations
      }
      
    } catch (error) {
      console.error('❌ Erro na análise completa:', error)
      throw error
    }
  }

  // Gerar recomendações baseadas na análise
  private generateRecommendations(
    codeAnalysis: Map<string, any>, 
    documentationStatus: any
  ): string[] {
    const recommendations: string[] = []
    
    // Recomendações baseadas na análise de código
    const highRiskFiles = Array.from(codeAnalysis.entries())
      .filter(([_, result]) => result.riskLevel === 'high')
    
    if (highRiskFiles.length > 0) {
      recommendations.push(`Revisar ${highRiskFiles.length} arquivo(s) com alto risco`)
    }
    
    // Recomendações baseadas na consistência da documentação
    if (!documentationStatus.isConsistent) {
      recommendations.push('Corrigir inconsistências na documentação')
    }
    
    // Recomendações baseadas em erros não resolvidos
    const unresolvedErrors = errorMemorySystem.getUnresolvedErrors()
    if (unresolvedErrors.length > 0) {
      recommendations.push(`Resolver ${unresolvedErrors.length} erro(s) pendente(s)`)
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Sistema funcionando perfeitamente!')
    }
    
    return recommendations
  }

  // Desligar sistema
  async shutdown(): Promise<void> {
    console.log('🔄 Desligando Sistema de Documentação Inteligente...')
    
    try {
      await this.stopMonitoring()
      this.isInitialized = false
      console.log('✅ Sistema desligado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao desligar sistema:', error)
    }
  }
}

// Instância singleton
export const smartDocsSystem = new SmartDocumentationSystem()

// Exportar funções utilitárias para uso direto
export const {
  addError,
  resolveError,
  analyzeCode,
  analyzeFile,
  updateDocumentationSection,
  checkDocumentationConsistency,
  forceFullUpdate,
  getSystemStatus,
  getSystemConfig,
  updateSystemConfig,
  runFullProjectAnalysis
} = smartDocsSystem
