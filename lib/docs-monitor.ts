import fs from 'fs'
import path from 'path'
import { intelligentDocs } from './intelligent-docs'
import { errorMemorySystem } from './error-memory'
import { errorPreventionSystem } from './error-prevention'

export interface MonitoringConfig {
  watchDirectories: string[]
  excludePatterns: string[]
  autoUpdate: boolean
  consistencyCheck: boolean
  reportGeneration: boolean
}

export class DocumentationMonitor {
  private config: MonitoringConfig
  private watcher: any = null
  private isRunning = false

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      watchDirectories: ['app', 'lib', 'components', 'supabase'],
      excludePatterns: ['node_modules', '.git', 'coverage', 'dist', '.next'],
      autoUpdate: true,
      consistencyCheck: true,
      reportGeneration: true,
      ...config
    }
  }

  // Iniciar monitoramento
  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Monitoramento já está rodando')
      return
    }

    console.log('🚀 Iniciando monitoramento de documentação...')

    try {
      // Configurar watcher simples (sem chokidar para evitar dependências)
      this.setupSimpleWatcher()
      
      this.isRunning = true
      console.log('✅ Monitoramento iniciado com sucesso')
      
      // Verificação inicial
      await this.performInitialCheck()
      
    } catch (error) {
      console.error('❌ Erro ao iniciar monitoramento:', error)
      throw error
    }
  }

  // Configurar watcher simples usando polling
  private setupSimpleWatcher(): void {
    const checkInterval = 5000 // 5 segundos
    
    setInterval(async () => {
      if (this.isRunning) {
        await this.checkForChanges()
      }
    }, checkInterval)
    
    console.log(`📡 Monitoramento configurado com intervalo de ${checkInterval}ms`)
  }

  // Verificar mudanças nos arquivos
  private async checkForChanges(): Promise<void> {
    try {
      const changedFiles = await this.detectChangedFiles()
      
      if (changedFiles.length > 0) {
        console.log(`📝 ${changedFiles.length} arquivo(s) modificado(s) detectado(s)`)
        await this.handleFileChanges(changedFiles)
      }
    } catch (error) {
      console.error('❌ Erro ao verificar mudanças:', error)
    }
  }

  // Detectar arquivos modificados
  private async detectChangedFiles(): Promise<string[]> {
    const changedFiles: string[] = []
    const currentTime = Date.now()
    const threshold = 10000 // 10 segundos
    
    for (const dir of this.config.watchDirectories) {
      if (fs.existsSync(dir)) {
        const files = this.scanDirectoryForChanges(dir, currentTime, threshold)
        changedFiles.push(...files)
      }
    }
    
    return changedFiles
  }

  // Escanear diretório para mudanças
  private scanDirectoryForChanges(dir: string, currentTime: number, threshold: number): string[] {
    const changedFiles: string[] = []
    
    try {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        
        if (this.config.excludePatterns.some(pattern => itemPath.includes(pattern))) {
          continue
        }
        
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          const subFiles = this.scanDirectoryForChanges(itemPath, currentTime, threshold)
          changedFiles.push(...subFiles)
        } else if (this.isCodeFile(itemPath)) {
          const timeDiff = currentTime - stat.mtime.getTime()
          if (timeDiff < threshold) {
            changedFiles.push(itemPath)
          }
        }
      }
    } catch (error) {
      // Ignorar erros de permissão
    }
    
    return changedFiles
  }

  // Manipular mudanças de arquivos
  private async handleFileChanges(changedFiles: string[]): Promise<void> {
    if (!this.config.autoUpdate) return

    console.log(`📝 Processando ${changedFiles.length} arquivo(s) modificado(s)...`)

    try {
      // Atualizar documentação
      await intelligentDocs.updateFromCodeChanges(changedFiles)
      
      // Verificar consistência se habilitado
      if (this.config.consistencyCheck) {
        await this.checkConsistency()
      }
      
      // Gerar relatório se habilitado
      if (this.config.reportGeneration) {
        await this.generateStatusReport()
      }
      
      console.log('✅ Mudanças processadas com sucesso')
    } catch (error) {
      console.error('❌ Erro ao processar mudanças:', error)
    }
  }

  // Parar monitoramento
  async stopMonitoring(): Promise<void> {
    this.isRunning = false
    console.log('🛑 Monitoramento parado')
  }

  // Verificação inicial
  private async performInitialCheck(): Promise<void> {
    console.log('🔍 Realizando verificação inicial...')
    
    try {
      // Verificar consistência
      if (this.config.consistencyCheck) {
        await this.checkConsistency()
      }
      
      // Gerar relatório inicial
      if (this.config.reportGeneration) {
        await this.generateStatusReport()
      }
      
      console.log('✅ Verificação inicial concluída')
    } catch (error) {
      console.error('❌ Erro na verificação inicial:', error)
    }
  }

  // Verificar consistência
  private async checkConsistency(): Promise<void> {
    console.log('🔍 Verificando consistência...')
    
    try {
      const consistency = await intelligentDocs.checkConsistency()
      
      if (!consistency.isConsistent) {
        console.warn('⚠️ Inconsistências detectadas:')
        for (const inconsistency of consistency.inconsistencies) {
          console.warn(`  - ${inconsistency}`)
        }
        
        // Tentar corrigir automaticamente
        await this.autoFixInconsistencies(consistency.suggestions)
      } else {
        console.log('✅ Consistência verificada - tudo OK')
      }
    } catch (error) {
      console.error('❌ Erro ao verificar consistência:', error)
    }
  }

  // Corrigir inconsistências automaticamente
  private async autoFixInconsistencies(suggestions: string[]): Promise<void> {
    console.log('🔧 Tentando corrigir inconsistências automaticamente...')
    
    for (const suggestion of suggestions) {
      try {
        if (suggestion.includes('Criar documentação para')) {
          const filePath = suggestion.split('Criar documentação para ')[1]
          await intelligentDocs.updateFromCodeChanges([filePath])
        }
        // Adicionar mais lógicas de correção automática conforme necessário
      } catch (error) {
        console.warn(`⚠️ Não foi possível corrigir: ${suggestion}`)
      }
    }
  }

  // Gerar relatório de status
  private async generateStatusReport(): Promise<void> {
    console.log('📊 Gerando relatório de status...')
    
    try {
      const reportPath = path.join(process.cwd(), 'docs', 'STATUS_REPORT.md')
      
      const report = `# 📊 Relatório de Status - Documentação Yoobe

## 🕐 Última Atualização
${new Date().toLocaleString('pt-BR')}

## 📈 Estatísticas
- **Seções de Documentação:** ${intelligentDocs.getAllSections().length}
- **Erros na Memória:** ${errorMemorySystem.getAllErrors().length}
- **Erros Resolvidos:** ${errorMemorySystem.getAllErrors().filter(e => e.resolved).length}

## 🔍 Status de Consistência
${await this.getConsistencyStatus()}

## 🚨 Alertas Ativos
${await this.getActiveAlerts()}

## 📝 Últimas Atualizações
${await this.getRecentUpdates()}

---
*Relatório gerado automaticamente pelo sistema de monitoramento*
`

      fs.writeFileSync(reportPath, report)
      console.log('✅ Relatório de status gerado')
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error)
    }
  }

  // Obter status de consistência
  private async getConsistencyStatus(): Promise<string> {
    try {
      const consistency = await intelligentDocs.checkConsistency()
      
      if (consistency.isConsistent) {
        return '✅ **Consistente** - Tudo sincronizado'
      } else {
        return `⚠️ **Inconsistente** - ${consistency.inconsistencies.length} problemas detectados`
      }
    } catch (error) {
      return '❌ **Erro** - Não foi possível verificar'
    }
  }

  // Obter alertas ativos
  private async getActiveAlerts(): Promise<string> {
    try {
      const unresolvedErrors = errorMemorySystem.getUnresolvedErrors()
      
      if (unresolvedErrors.length === 0) {
        return '✅ Nenhum alerta ativo'
      }
      
      let alerts = ''
      for (const error of unresolvedErrors.slice(0, 5)) {
        alerts += `- **${error.title}** (${error.severity})\n`
      }
      
      if (unresolvedErrors.length > 5) {
        alerts += `- ... e mais ${unresolvedErrors.length - 5} alertas\n`
      }
      
      return alerts
    } catch (error) {
      return '❌ Erro ao obter alertas'
    }
  }

  // Obter atualizações recentes
  private async getRecentUpdates(): Promise<string> {
    try {
      const sections = intelligentDocs.getAllSections()
        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
        .slice(0, 5)
      
      if (sections.length === 0) {
        return 'Nenhuma atualização recente'
      }
      
      let updates = ''
      for (const section of sections) {
        updates += `- **${section.title}** - ${section.lastUpdated.toLocaleDateString('pt-BR')}\n`
      }
      
      return updates
    } catch (error) {
      return '❌ Erro ao obter atualizações'
    }
  }

  // Forçar atualização completa
  async forceFullUpdate(): Promise<void> {
    console.log('🔄 Forçando atualização completa...')
    
    try {
      // Atualizar documentação de todos os arquivos
      const codeFiles = this.scanAllCodeFiles()
      await intelligentDocs.updateFromCodeChanges(codeFiles)
      
      // Verificar consistência
      await this.checkConsistency()
      
      // Gerar relatório
      await this.generateStatusReport()
      
      console.log('✅ Atualização completa concluída')
    } catch (error) {
      console.error('❌ Erro na atualização completa:', error)
    }
  }

  // Escanear todos os arquivos de código
  private scanAllCodeFiles(): string[] {
    const codeFiles: string[] = []
    
    for (const dir of this.config.watchDirectories) {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, codeFiles)
      }
    }
    
    return codeFiles
  }

  private scanDirectory(dir: string, codeFiles: string[]): void {
    try {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        
        if (this.config.excludePatterns.some(pattern => itemPath.includes(pattern))) {
          continue
        }
        
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          this.scanDirectory(itemPath, codeFiles)
        } else if (this.isCodeFile(itemPath)) {
          codeFiles.push(itemPath)
        }
      }
    } catch (error) {
      // Ignorar erros de permissão
    }
  }

  private isCodeFile(filePath: string): boolean {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.sql']
    const ext = path.extname(filePath)
    return codeExtensions.includes(ext)
  }

  // Obter status do monitoramento
  getStatus(): { isRunning: boolean; watchedDirectories: number; lastUpdate: Date | null } {
    return {
      isRunning: this.isRunning,
      watchedDirectories: this.config.watchDirectories.length,
      lastUpdate: new Date() // Simplificado para exemplo
    }
  }

  // Configurar diretórios para monitorar
  updateWatchDirectories(directories: string[]): void {
    this.config.watchDirectories = directories
    console.log(`📁 Diretórios de monitoramento atualizados: ${directories.join(', ')}`)
  }

  // Habilitar/desabilitar funcionalidades
  updateConfig(updates: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...updates }
    console.log('⚙️ Configuração de monitoramento atualizada')
  }

  // Obter configuração atual
  getConfig(): MonitoringConfig {
    return { ...this.config }
  }
}

// Instância singleton
export const docsMonitor = new DocumentationMonitor()
