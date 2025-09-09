export interface MockDataValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface UserData {
  name?: string
  id?: string
  email?: string
  [key: string]: any
}

// Lista de padrões de dados mockados comuns
const MOCK_PATTERNS = [
  // Nomes genéricos
  /^(test|demo|example|sample|mock|fake|dummy|placeholder)/i,
  /^(user|admin|manager|client|customer)\d*$/i,
  /^(joão|maria|josé|ana|pedro|paulo|carlos|luis|fernando|ricardo)$/i,

  // Emails genéricos
  /^(test|demo|example|sample|mock|fake|dummy)@/i,
  /@(test|demo|example|sample|mock|fake|dummy)\./i,
  /@(gmail|hotmail|yahoo)\.com$/i,

  // IDs genéricos
  /^(test|demo|example|sample|mock|fake|dummy)\d*$/i,
  /^[0-9]{1,3}$/, // IDs muito simples (1-999)

  // Textos genéricos
  /^(lorem|ipsum|dolor|sit|amet|consectetur|adipiscing)$/i,
  /^(produto|item|teste|exemplo|demo|sample)\s*\d*$/i,
]

// Lista de palavras que indicam dados de teste
const TEST_KEYWORDS = [
  'test',
  'demo',
  'example',
  'sample',
  'mock',
  'fake',
  'dummy',
  'placeholder',
  'temporary',
  'temp',
  'lorem',
  'ipsum',
]

export function validateUserData(data: UserData): MockDataValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar nome
  if (data.name) {
    const nameValidation = validateField(data.name, 'nome')
    errors.push(...nameValidation.errors)
    warnings.push(...nameValidation.warnings)
  }

  // Validar ID
  if (data.id) {
    const idValidation = validateField(data.id, 'ID')
    errors.push(...idValidation.errors)
    warnings.push(...idValidation.warnings)
  }

  // Validar email
  if (data.email) {
    const emailValidation = validateField(data.email, 'email')
    errors.push(...emailValidation.errors)
    warnings.push(...emailValidation.warnings)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateField(
  value: string,
  fieldName: string
): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Verificar se é muito curto
  if (value.length < 2) {
    errors.push(`${fieldName} muito curto (${value.length} caracteres)`)
  }

  // Verificar padrões de dados mockados
  for (const pattern of MOCK_PATTERNS) {
    if (pattern.test(value)) {
      errors.push(`${fieldName} parece ser um dado mockado: "${value}"`)
      break
    }
  }

  // Verificar palavras-chave de teste
  const lowerValue = value.toLowerCase()
  for (const keyword of TEST_KEYWORDS) {
    if (lowerValue.includes(keyword)) {
      warnings.push(`${fieldName} contém palavra-chave de teste: "${keyword}"`)
    }
  }

  // Verificar se é muito genérico
  if (isGenericValue(value)) {
    warnings.push(`${fieldName} parece muito genérico: "${value}"`)
  }

  return { errors, warnings }
}

function isGenericValue(value: string): boolean {
  const genericValues = [
    'produto',
    'item',
    'cliente',
    'usuário',
    'admin',
    'manager',
    'teste',
    'exemplo',
    'demo',
    'sample',
    'mock',
    'fake',
  ]

  const lowerValue = value.toLowerCase()
  return genericValues.some(generic => lowerValue.includes(generic))
}

export function validateProductData(data: any): MockDataValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar nome do produto
  if (data.name) {
    const nameValidation = validateField(data.name, 'nome do produto')
    errors.push(...nameValidation.errors)
    warnings.push(...nameValidation.warnings)
  }

  // Validar descrição
  if (data.description) {
    const descValidation = validateField(data.description, 'descrição')
    errors.push(...descValidation.errors)
    warnings.push(...descValidation.warnings)
  }

  // Validar preço
  if (data.price !== undefined) {
    if (data.price <= 0) {
      errors.push('Preço deve ser maior que zero')
    }
    if (data.price > 1000000) {
      warnings.push('Preço muito alto, verificar se é real')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateCompanyData(data: any): MockDataValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar nome da empresa
  if (data.name) {
    const nameValidation = validateField(data.name, 'nome da empresa')
    errors.push(...nameValidation.errors)
    warnings.push(...nameValidation.warnings)
  }

  // Validar CNPJ
  if (data.cnpj) {
    if (!isValidCNPJ(data.cnpj)) {
      errors.push('CNPJ inválido')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '')

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return false
  }

  // Validação básica do CNPJ (algoritmo simplificado)
  let sum = 0
  let weight = 2

  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight
    weight = weight === 9 ? 2 : weight + 1
  }

  const remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(cleanCNPJ[12]) !== firstDigit) {
    return false
  }

  sum = 0
  weight = 2

  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight
    weight = weight === 9 ? 2 : weight + 1
  }

  const secondRemainder = sum % 11
  const secondDigit = secondRemainder < 2 ? 0 : 11 - secondRemainder

  return parseInt(cleanCNPJ[13]) === secondDigit
}







