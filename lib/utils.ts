import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value)
}

export function formatPoints(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const time = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Agora mesmo'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d atrás`
  return `${Math.floor(diffInSeconds / 2592000)}m atrás`
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidCPF(cpf: string): boolean {
  const cpfClean = cpf.replace(/\D/g, '')
  if (cpfClean.length !== 11) return false
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfClean)) return false
  
  // Validar primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfClean.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpfClean.charAt(9))) return false
  
  // Validar segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpfClean.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpfClean.charAt(10))) return false
  
  return true
}

export function isValidCNPJ(cnpj: string): boolean {
  const cnpjClean = cnpj.replace(/\D/g, '')
  if (cnpjClean.length !== 14) return false
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpjClean)) return false
  
  // Validar primeiro dígito verificador
  let sum = 0
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpjClean.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  if (remainder < 2) remainder = 0
  else remainder = 11 - remainder
  if (remainder !== parseInt(cnpjClean.charAt(12))) return false
  
  // Validar segundo dígito verificador
  sum = 0
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpjClean.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  if (remainder < 2) remainder = 0
  else remainder = 11 - remainder
  if (remainder !== parseInt(cnpjClean.charAt(13))) return false
  
  return true
}

export function formatCPF(cpf: string): string {
  const cpfClean = cpf.replace(/\D/g, '')
  return cpfClean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCNPJ(cnpj: string): string {
  const cnpjClean = cnpj.replace(/\D/g, '')
  return cnpjClean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatPhone(phone: string): string {
  const phoneClean = phone.replace(/\D/g, '')
  if (phoneClean.length === 11) {
    return phoneClean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (phoneClean.length === 10) {
    return phoneClean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export function formatCEP(cep: string): string {
  const cepClean = cep.replace(/\D/g, '')
  return cepClean.replace(/(\d{5})(\d{3})/, '$1-$2')
}


