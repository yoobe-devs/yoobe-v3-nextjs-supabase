/**
 * Utilitários para validação e formatação de CPF
 * Yoobe v3.2.0
 */

/**
 * Remove caracteres não numéricos do CPF
 */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/**
 * Formata CPF com máscara
 */
export function formatCpf(cpf: string): string {
  const cleaned = cleanCpf(cpf)

  if (cleaned.length <= 3) {
    return cleaned
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  } else if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  } else {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
  }
}

/**
 * Valida se o CPF é válido
 */
export function isValidCpf(cpf: string): boolean {
  const cleaned = cleanCpf(cpf)

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) {
    return false
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false
  }

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i)
  }
  let remainder = sum % 11
  let firstDigit = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(cleaned[9]) !== firstDigit) {
    return false
  }

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i)
  }
  remainder = sum % 11
  let secondDigit = remainder < 2 ? 0 : 11 - remainder

  return parseInt(cleaned[10]) === secondDigit
}

/**
 * Valida CPF e retorna mensagem de erro se inválido
 */
export function validateCpf(cpf: string): { isValid: boolean; error?: string } {
  // CPF é opcional - se vazio ou apenas espaços, é válido
  if (!cpf || cpf.trim() === '') {
    return { isValid: true }
  }

  const cleaned = cleanCpf(cpf)

  // Se após limpeza ficou vazio, é válido (opcional)
  if (cleaned.length === 0) {
    return { isValid: true }
  }

  // Se tem menos de 11 dígitos, é inválido
  if (cleaned.length < 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' }
  }

  // Se tem mais de 11 dígitos, é inválido
  if (cleaned.length > 11) {
    return { isValid: false, error: 'CPF deve ter exatamente 11 dígitos' }
  }

  // Validar CPF com algoritmo
  if (!isValidCpf(cleaned)) {
    return { isValid: false, error: 'CPF inválido' }
  }

  return { isValid: true }
}

/**
 * Hook para formatação automática de CPF
 */
export function useCpfFormatter() {
  const formatCpfInput = (value: string) => {
    const cleaned = cleanCpf(value)
    return formatCpf(cleaned)
  }

  return { formatCpfInput }
}
