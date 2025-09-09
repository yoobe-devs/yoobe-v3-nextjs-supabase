// Versão simplificada do ErrorMemorySystem para Edge Runtime
// Não usa fs, path ou outros módulos do Node.js
import { getCurrentTimestamp, generateUniqueTimestamp } from '@/lib/date-utils'

export interface ErrorMemory {
  id: string
  errorType:
    | 'sql_performance'
    | 'auth_flow'
    | 'checkout'
    | 'replication'
    | 'api_error'
    | 'rls_policy'
    | 'storage'
    | 'notification'
    | 'budget_system'
    | 'documentation'
    | 'system'
  title: string
  description: string
  errorMessage?: string
  solution: string
  codeSnippet: string
  filePath: string
  lineNumber?: number
  timestamp: string
  tags: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolutionDate?: string
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
  timestamp: string
}

export class ErrorMemorySystemEdge {
  private errors: ErrorMemory[] = []
  private preventionRules: Map<string, string[]> = new Map()

  constructor() {
    this.initializePreventionRules()
  }

  private initializePreventionRules(): void {
    // Regras de prevenção baseadas em erros conhecidos
    this.preventionRules.set('sql_performance', [
      'Evitar SELECT * em tabelas grandes',
      'Usar índices apropriados',
      'Implementar paginação',
      'Evitar subqueries aninhadas',
    ])

    this.preventionRules.set('auth_flow', [
      'Sempre validar JWT tokens',
      'Implementar refresh token',
      'Verificar permissões antes de acessar recursos',
      'Log de tentativas de acesso',
    ])

    this.preventionRules.set('checkout', [
      'Validar estoque antes de finalizar',
      'Verificar endereço de entrega',
      'Calcular frete corretamente',
      'Validar dados de pagamento',
    ])

    this.preventionRules.set('rls_policy', [
      'Testar políticas com diferentes usuários',
      'Verificar herança de políticas',
      'Implementar políticas de fallback',
      'Log de acesso negado',
    ])

    this.preventionRules.set('system', [
      'SEMPRE criar versões simplificadas de APIs complexas para teste',
      'SEMPRE implementar fallbacks quando APIs principais falham',
      'SEMPRE testar APIs independentemente de autenticação',
      'SEMPRE fornecer dados simulados para demonstração',
      'SEMPRE documentar versões alternativas de funcionalidades',
      'SEMPRE verificar se dependências estão carregadas antes de usar',
    ])

    this.preventionRules.set('documentation', [
      'SEMPRE atualizar sistema de documentação quando novos sistemas são implementados',
      'SEMPRE verificar links após mudanças na estrutura de documentação',
      'SEMPRE integrar novos sistemas com áreas de desenvolvedores',
      'SEMPRE testar todos os links de documentação após atualizações',
      'SEMPRE manter consistência entre diferentes áreas de documentação',
      'SEMPRE usar MCPs para backup e atualização segura da documentação',
    ])
  }

  // Adicionar novo erro à memória (versão simplificada)
  addError(error: Omit<ErrorMemory, 'id' | 'timestamp'>): string {
    const id = this.generateErrorId()
    const currentTimestamp = getCurrentTimestamp()

    const newError: ErrorMemory = {
      ...error,
      id,
      timestamp: currentTimestamp,
    }

    this.errors.push(newError)

    console.log(
      `🚨 Erro registrado na memória: ${error.title} (${currentTimestamp})`
    )
    return id
  }

  // Marcar erro como resolvido
  resolveError(errorId: string, resolutionNotes?: string): void {
    const error = this.errors.find(e => e.id === errorId)
    if (error) {
      const resolutionTimestamp = getCurrentTimestamp()
      error.resolved = true
      error.resolutionDate = resolutionTimestamp
      if (resolutionNotes) {
        error.solution = `${error.solution}\n\n**Notas de Resolução:** ${resolutionNotes}`
      }
      console.log(`✅ Erro resolvido: ${error.title} (${resolutionTimestamp})`)
    }
  }

  // Buscar erros similares
  findSimilarErrors(codePattern: string, errorType?: string): ErrorMemory[] {
    return this.errors.filter(error => {
      if (errorType && error.errorType !== errorType) return false

      // Busca por padrões similares no código
      const pattern = codePattern.toLowerCase()
      const code = error.codeSnippet.toLowerCase()

      return (
        code.includes(pattern) || this.calculateSimilarity(pattern, code) > 0.7
      )
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
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

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
  generatePreventionAlert(
    code: string,
    filePath: string
  ): PreventionAlert | null {
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
          timestamp: getCurrentTimestamp(),
        }
      }
    }

    return null
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

  // Obter regras de prevenção
  getPreventionRules(errorType: string): string[] {
    return this.preventionRules.get(errorType) || []
  }
}

// Instância singleton para Edge Runtime
export const errorMemorySystemEdge = new ErrorMemorySystemEdge()
