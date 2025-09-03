import { errorMemorySystem, PreventionAlert } from './error-memory'

export interface CodeAnalysisResult {
  alerts: PreventionAlert[]
  suggestions: string[]
  riskLevel: 'low' | 'medium' | 'high'
  similarErrors: string[]
}

export class ErrorPreventionSystem {
  private codePatterns: Map<string, RegExp> = new Map()
  private riskPatterns: Map<string, number> = new Map()

  constructor() {
    this.initializePatterns()
  }

  private initializePatterns(): void {
    // Padrões de código de alto risco
    this.codePatterns.set('sql_select_all', /\bSELECT\s+\*\s+FROM\b/i)
    this.codePatterns.set('nested_queries', /\bSELECT.*\bSELECT\b/i)
    this.codePatterns.set('missing_auth', /\b(req\.user|auth\.user)\b.*\bundefined\b/i)
    this.codePatterns.set('hardcoded_credentials', /\b(password|secret|key)\s*[:=]\s*['"][^'"]+['"]/i)
    this.codePatterns.set('unhandled_errors', /\bcatch\s*\(\s*\)\s*\{\s*\}/)
    this.codePatterns.set('missing_validation', /\b(req\.body|req\.query)\b(?!.*\bvalidate\b)/i)
    this.codePatterns.set('sql_injection_risk', /\b(req\.body|req\.query)\s*\+\s*['"']\s*SQL/i)
    this.codePatterns.set('missing_rls', /\bINSERT\s+INTO.*\bWITHOUT\s+RLS\b/i)
    this.codePatterns.set('unlimited_queries', /\bLIMIT\s+[0-9]{4,}\b/i)
    
    // Níveis de risco para cada padrão
    this.riskPatterns.set('sql_select_all', 8)
    this.riskPatterns.set('nested_queries', 7)
    this.riskPatterns.set('missing_auth', 9)
    this.riskPatterns.set('hardcoded_credentials', 10)
    this.riskPatterns.set('unhandled_errors', 6)
    this.riskPatterns.set('missing_validation', 7)
    this.riskPatterns.set('sql_injection_risk', 10)
    this.riskPatterns.set('missing_rls', 8)
    this.riskPatterns.set('unlimited_queries', 6)
  }

  // Analisar código e detectar problemas
  async analyzeCode(code: string, filePath: string): Promise<CodeAnalysisResult> {
    const alerts: PreventionAlert[] = []
    const suggestions: string[] = []
    let totalRisk = 0
    let patternCount = 0

    // Verificar padrões conhecidos
    for (const [patternName, regex] of this.codePatterns) {
      if (regex.test(code)) {
        const risk = this.riskPatterns.get(patternName) || 5
        totalRisk += risk
        patternCount++

        // Gerar alerta preventivo
        const alert = errorMemorySystem.generatePreventionAlert(code, filePath)
        if (alert) {
          alerts.push(alert)
        }

        // Adicionar sugestões específicas
        suggestions.push(this.getSuggestionForPattern(patternName))
      }
    }

    // Verificar base de memória de erros
    const similarErrors = errorMemorySystem.findSimilarErrors(code)
    const similarErrorIds = similarErrors.map(e => e.id)

    // Calcular nível de risco
    const riskLevel = this.calculateRiskLevel(totalRisk, patternCount, similarErrors.length)

    // Adicionar sugestões baseadas em erros similares
    for (const error of similarErrors) {
      suggestions.push(`**Prevenção:** ${error.preventionSteps.join(', ')}`)
    }

    return {
      alerts,
      suggestions: [...new Set(suggestions)], // Remover duplicatas
      riskLevel,
      similarErrors: similarErrorIds
    }
  }

  // Analisar arquivo completo
  async analyzeFile(filePath: string): Promise<CodeAnalysisResult> {
    try {
      const fs = require('fs')
      const code = fs.readFileSync(filePath, 'utf-8')
      return await this.analyzeCode(code, filePath)
    } catch (error) {
      console.error(`Erro ao analisar arquivo ${filePath}:`, error)
      return {
        alerts: [],
        suggestions: ['Erro ao analisar arquivo'],
        riskLevel: 'low',
        similarErrors: []
      }
    }
  }

  // Analisar diretório completo
  async analyzeDirectory(dirPath: string): Promise<Map<string, CodeAnalysisResult>> {
    const results = new Map<string, CodeAnalysisResult>()
    const fs = require('fs')
    const path = require('path')

    const analyzeRecursive = async (currentPath: string) => {
      const items = fs.readdirSync(currentPath)
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          await analyzeRecursive(itemPath)
        } else if (this.isCodeFile(item)) {
          const result = await this.analyzeFile(itemPath)
          results.set(itemPath, result)
        }
      }
    }

    await analyzeRecursive(dirPath)
    return results
  }

  // Verificar se é arquivo de código
  private isCodeFile(filePath: string): boolean {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.sql']
    const ext = require('path').extname(filePath)
    return codeExtensions.includes(ext)
  }

  // Calcular nível de risco
  private calculateRiskLevel(totalRisk: number, patternCount: number, similarErrorCount: number): 'low' | 'medium' | 'high' {
    const baseRisk = totalRisk / Math.max(patternCount, 1)
    const errorRisk = similarErrorCount * 2
    
    const finalRisk = baseRisk + errorRisk
    
    if (finalRisk >= 15) return 'high'
    if (finalRisk >= 8) return 'medium'
    return 'low'
  }

  // Obter sugestão para padrão específico
  private getSuggestionForPattern(patternName: string): string {
    const suggestions: Record<string, string> = {
      'sql_select_all': 'Use SELECT com colunas específicas em vez de SELECT *',
      'nested_queries': 'Considere usar JOINs em vez de subqueries aninhadas',
      'missing_auth': 'Sempre verifique autenticação antes de acessar recursos',
      'hardcoded_credentials': 'Use variáveis de ambiente para credenciais',
      'unhandled_errors': 'Implemente tratamento adequado de erros',
      'missing_validation': 'Valide sempre dados de entrada',
      'sql_injection_risk': 'Use prepared statements ou ORM para queries SQL',
      'missing_rls': 'Implemente políticas RLS para segurança de dados',
      'unlimited_queries': 'Implemente paginação para evitar sobrecarga'
    }
    
    return suggestions[patternName] || 'Revisar implementação'
  }

  // Gerar relatório de análise
  generateAnalysisReport(results: Map<string, CodeAnalysisResult>): string {
    let report = `# 🔍 Relatório de Análise de Código - Yoobe Platform

## 📊 Resumo Geral
- **Arquivos Analisados:** ${results.size}
- **Alertas Gerados:** ${Array.from(results.values()).reduce((sum, r) => sum + r.alerts.length, 0)}
- **Sugestões:** ${Array.from(results.values()).reduce((sum, r) => sum + r.suggestions.length, 0)}

## 🚨 Arquivos com Alto Risco
`

    const highRiskFiles = Array.from(results.entries())
      .filter(([_, result]) => result.riskLevel === 'high')
      .sort((a, b) => b[1].alerts.length - a[1].alerts.length)

    for (const [filePath, result] of highRiskFiles) {
      const fileName = require('path').basename(filePath)
      report += `### ${fileName}
- **Caminho:** ${filePath}
- **Alertas:** ${result.alerts.length}
- **Sugestões:** ${result.suggestions.length}

`
    }

    report += `## 💡 Sugestões Gerais
`
    
    const allSuggestions = new Set<string>()
    for (const result of results.values()) {
      result.suggestions.forEach(s => allSuggestions.add(s))
    }

    for (const suggestion of allSuggestions) {
      report += `- ${suggestion}
`
    }

    return report
  }

  // Analisar código em tempo real (para uso em editores)
  analyzeCodeSnippet(codeSnippet: string, context?: string): {
    riskLevel: 'low' | 'medium' | 'high'
    alerts: string[]
    suggestions: string[]
  } {
    const alerts: string[] = []
    const suggestions: string[] = []
    let totalRisk = 0

    // Verificar padrões de risco
    for (const [patternName, regex] of this.codePatterns) {
      if (regex.test(codeSnippet)) {
        const risk = this.riskPatterns.get(patternName) || 5
        totalRisk += risk
        
        alerts.push(`Padrão de risco detectado: ${patternName}`)
        suggestions.push(this.getSuggestionForPattern(patternName))
      }
    }

    // Verificar base de memória
    const similarErrors = errorMemorySystem.findSimilarErrors(codeSnippet)
    if (similarErrors.length > 0) {
      alerts.push(`${similarErrors.length} erro(s) similar(es) encontrado(s) na base de conhecimento`)
      for (const error of similarErrors.slice(0, 2)) {
        suggestions.push(`Solução conhecida: ${error.solution.substring(0, 100)}...`)
      }
    }

    const riskLevel = totalRisk >= 15 ? 'high' : totalRisk >= 8 ? 'medium' : 'low'

    return {
      riskLevel,
      alerts,
      suggestions
    }
  }

  // Obter estatísticas de prevenção
  getPreventionStats(): {
    totalPatterns: number
    highRiskPatterns: number
    patternsByCategory: Record<string, number>
  } {
    const totalPatterns = this.codePatterns.size
    const highRiskPatterns = Array.from(this.riskPatterns.values()).filter(risk => risk >= 8).length
    
    const patternsByCategory: Record<string, number> = {
      'SQL': 0,
      'Segurança': 0,
      'Performance': 0,
      'Validação': 0
    }

    for (const [patternName, risk] of this.riskPatterns) {
      if (patternName.includes('sql')) {
        patternsByCategory['SQL']++
      } else if (patternName.includes('auth') || patternName.includes('credentials') || patternName.includes('rls')) {
        patternsByCategory['Segurança']++
      } else if (patternName.includes('performance') || patternName.includes('nested')) {
        patternsByCategory['Performance']++
      } else {
        patternsByCategory['Validação']++
      }
    }

    return {
      totalPatterns,
      highRiskPatterns,
      patternsByCategory
    }
  }
}

// Instância singleton
export const errorPreventionSystem = new ErrorPreventionSystem()
