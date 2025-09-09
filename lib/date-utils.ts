// Utilitários de data para garantir consistência em toda a aplicação

/**
 * Obtém a data atual formatada para documentação
 * @returns String formatada da data atual (ex: "Setembro 2025")
 */
export function getCurrentDocumentationDate(): string {
  const now = new Date()
  const month = now.toLocaleString('pt-BR', { month: 'long' })
  const year = now.getFullYear()
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
}

/**
 * Obtém o timestamp atual em formato ISO
 * @returns String ISO timestamp (ex: "2025-09-08T23:45:00.000Z")
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Valida se uma data está no formato correto
 * @param dateString String da data para validar
 * @returns true se a data está no formato correto
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Formata uma data para exibição em documentação
 * @param dateString String da data ISO
 * @returns String formatada para documentação
 */
export function formatDateForDocumentation(dateString: string): string {
  const date = new Date(dateString)
  const month = date.toLocaleString('pt-BR', { month: 'long' })
  const year = date.getFullYear()
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
}

/**
 * Verifica se uma data está desatualizada (mais de 30 dias)
 * @param dateString String da data ISO
 * @returns true se a data está desatualizada
 */
export function isDateOutdated(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 30
}

/**
 * Gera um timestamp único para IDs de erro
 * @returns String timestamp único
 */
export function generateUniqueTimestamp(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Constantes de data para uso em toda a aplicação
export const DATE_CONSTANTS = {
  CURRENT_YEAR: new Date().getFullYear(),
  CURRENT_MONTH: new Date().toLocaleString('pt-BR', { month: 'long' }),
  CURRENT_DOCUMENTATION_DATE: getCurrentDocumentationDate(),
  CURRENT_TIMESTAMP: getCurrentTimestamp(),
} as const

