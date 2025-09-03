import fs from 'fs'
import path from 'path'

export interface ErrorMemory {
  id: string
  errorType: 'sql_performance' | 'auth_flow' | 'checkout' | 'replication' | 'api_error' | 'rls_policy' | 'storage' | 'notification' | 'budget_system'
  title: string
  description: string
  errorMessage?: string
  solution: string
  codeSnippet: string
  filePath: string
  lineNumber?: number
  timestamp: Date
  tags: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolutionDate?: Date
  developer: string
  relatedErrors: string[]
  preventionSteps: string[]
  documentationLinks: string[]
}

export interface PreventionAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  codePattern: string
  suggestedFix: string
  relatedErrorId: string
  timestamp: Date
}

export class ErrorMemorySystem {
  private memoryPath: string
  private errors: ErrorMemory[] = []
  private preventionRules: Map<string, string[]> = new Map()

  constructor() {
    this.memoryPath = path.join(process.cwd(), 'data', 'error-memory.json')
    this.loadErrors()
    this.initializePreventionRules()
  }

  private loadErrors(): void {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf-8')
        this.errors = JSON.parse(data).map((error: any) => ({
          ...error,
          timestamp: new Date(error.timestamp),
          resolutionDate: error.resolutionDate ? new Date(error.resolutionDate) : undefined
        }))
      }
    } catch (error) {
      console.warn('Could not load error memory:', error)
      this.errors = []
    }
  }

  private saveErrors(): void {
    try {
      const dir = path.dirname(this.memoryPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.errors, null, 2))
    } catch (error) {
      console.error('Could not save error memory:', error)
    }
  }

  private initializePreventionRules(): void {
    // Regras de prevenção baseadas em erros conhecidos
    this.preventionRules.set('sql_performance', [
      'Evitar SELECT * em tabelas grandes',
      'Usar índices apropriados',
      'Implementar paginação',
      'Evitar subqueries aninhadas'
    ])

    this.preventionRules.set('auth_flow', [
      'Sempre validar JWT tokens',
      'Implementar refresh token',
      'Verificar permissões antes de acessar recursos',
      'Log de tentativas de acesso'
    ])

    this.preventionRules.set('checkout', [
      'Validar estoque antes de finalizar',
      'Verificar endereço de entrega',
      'Calcular frete corretamente',
      'Validar dados de pagamento'
    ])

    this.preventionRules.set('rls_policy', [
      'Testar políticas com diferentes usuários',
      'Verificar herança de políticas',
      'Implementar políticas de fallback',
      'Log de acesso negado'
    ])
  }

  // Adicionar novo erro à memória
  addError(error: Omit<ErrorMemory, 'id' | 'timestamp'>): string {
    const id = this.generateErrorId()
    const newError: ErrorMemory = {
      ...error,
      id,
      timestamp: new Date()
    }

    this.errors.push(newError)
    this.saveErrors()
    
    console.log(`🚨 Erro registrado na memória: ${error.title}`)
    return id
  }

  // Marcar erro como resolvido
  resolveError(errorId: string, resolutionNotes?: string): void {
    const error = this.errors.find(e => e.id === errorId)
    if (error) {
      error.resolved = true
      error.resolutionDate = new Date()
      if (resolutionNotes) {
        error.solution = `${error.solution}\n\n**Notas de Resolução:** ${resolutionNotes}`
      }
      this.saveErrors()
      console.log(`✅ Erro resolvido: ${error.title}`)
    }
  }

  // Buscar erros similares
  findSimilarErrors(codePattern: string, errorType?: string): ErrorMemory[] {
    return this.errors.filter(error => {
      if (errorType && error.errorType !== errorType) return false
      
      // Busca por padrões similares no código
      const pattern = codePattern.toLowerCase()
      const code = error.codeSnippet.toLowerCase()
      
      return code.includes(pattern) || 
             this.calculateSimilarity(pattern, code) > 0.7
    })
  }

  // Calcular similaridade entre strings
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Gerar alerta preventivo
  generatePreventionAlert(code: string, filePath: string): PreventionAlert | null {
    for (const [errorType, rules] of this.preventionRules) {
      const similarErrors = this.findSimilarErrors(code, errorType as any)
      
      if (similarErrors.length > 0) {
        const mostRelevantError = similarErrors[0]
        
        return {
          id: this.generateAlertId(),
          type: 'warning',
          message: `Padrão similar ao erro "${mostRelevantError.title}" detectado`,
          codePattern: code.substring(0, 100),
          suggestedFix: mostRelevantError.solution,
          relatedErrorId: mostRelevantError.id,
          timestamp: new Date()
        }
      }
    }
    
    return null
  }

  // Gerar relatório de erros
  generateErrorReport(): string {
    const totalErrors = this.errors.length
    const resolvedErrors = this.errors.filter(e => e.resolved).length
    const criticalErrors = this.errors.filter(e => e.severity === 'critical').length
    
    let report = `# 🚨 Relatório de Erros - Yoobe Platform

## 📈 Estatísticas Gerais
- **Total de Erros:** ${totalErrors}
- **Erros Resolvidos:** ${resolvedErrors}
- **Erros Críticos:** ${criticalErrors}
- **Taxa de Resolução:** ${totalErrors > 0 ? ((resolvedErrors / totalErrors) * 100).toFixed(1) : 0}%

## 🚨 Erros por Tipo
`

    const errorsByType = this.errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    for (const [type, count] of Object.entries(errorsByType)) {
      report += `- **${type}:** ${count}\n`
    }

    report += `\n## 🔍 Erros Recentes
`
    
    const recentErrors = this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    for (const error of recentErrors) {
      report += `### ${error.title}
- **Tipo:** ${error.errorType}
- **Severidade:** ${error.severity}
- **Status:** ${error.resolved ? '✅ Resolvido' : '🔴 Pendente'}
- **Data:** ${error.timestamp.toLocaleDateString('pt-BR')}

`
    }

    return report
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Obter todos os erros
  getAllErrors(): ErrorMemory[] {
    return [...this.errors]
  }

  // Obter erros não resolvidos
  getUnresolvedErrors(): ErrorMemory[] {
    return this.errors.filter(e => !e.resolved)
  }

  // Obter erros por tipo
  getErrorsByType(type: ErrorMemory['errorType']): ErrorMemory[] {
    return this.errors.filter(e => e.errorType === type)
  }
}

// Instância singleton
export const errorMemorySystem = new ErrorMemorySystem()
