import { WorkvivoEmployee } from '@/types/resgate'

export class WorkvivoService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`Workvivo API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Workvivo API request failed:', error)
      throw error
    }
  }

  // Buscar funcionários
  async getEmployees(params?: {
    department?: string
    is_active?: boolean
    limit?: number
    offset?: number
  }): Promise<WorkvivoEmployee[]> {
    const queryParams = new URLSearchParams()
    
    if (params?.department) queryParams.append('department', params.department)
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const endpoint = `/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  // Buscar funcionário por ID
  async getEmployeeById(employeeId: string): Promise<WorkvivoEmployee> {
    return this.makeRequest(`/employees/${employeeId}`)
  }

  // Buscar funcionário por email
  async getEmployeeByEmail(email: string): Promise<WorkvivoEmployee | null> {
    try {
      const employees = await this.makeRequest(`/employees?email=${encodeURIComponent(email)}`)
      return employees.length > 0 ? employees[0] : null
    } catch (error) {
      console.error('Error fetching employee by email:', error)
      return null
    }
  }

  // Buscar departamentos
  async getDepartments(): Promise<{ id: string; name: string }[]> {
    return this.makeRequest('/departments')
  }

  // Buscar cargos
  async getPositions(): Promise<{ id: string; name: string }[]> {
    return this.makeRequest('/positions')
  }

  // Sincronizar funcionários
  async syncEmployees(): Promise<{ success: boolean; count: number; errors: string[] }> {
    try {
      const employees = await this.getEmployees({ is_active: true })
      
      // Aqui você pode implementar a lógica para sincronizar com o banco local
      // Por exemplo, criar/atualizar registros na tabela profiles
      
      return {
        success: true,
        count: employees.length,
        errors: []
      }
    } catch (error) {
      console.error('Error syncing employees:', error)
      return {
        success: false,
        count: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  // Verificar se funcionário está ativo
  async isEmployeeActive(employeeId: string): Promise<boolean> {
    try {
      const employee = await this.getEmployeeById(employeeId)
      return employee.is_active
    } catch (error) {
      console.error('Error checking employee status:', error)
      return false
    }
  }

  // Buscar funcionários por departamento
  async getEmployeesByDepartment(department: string): Promise<WorkvivoEmployee[]> {
    return this.getEmployees({ department, is_active: true })
  }

  // Buscar funcionários recém-contratados
  async getRecentHires(days: number = 30): Promise<WorkvivoEmployee[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const employees = await this.getEmployees({ is_active: true })
    return employees.filter(employee => {
      if (!employee.hire_date) return false
      const hireDate = new Date(employee.hire_date)
      return hireDate >= cutoffDate
    })
  }
}

// Instância singleton
let workvivoService: WorkvivoService | null = null

export function getWorkvivoService(): WorkvivoService {
  if (!workvivoService) {
    const apiKey = process.env.WORKVIVO_API_KEY || ''
    const baseUrl = process.env.WORKVIVO_BASE_URL || 'https://api.workvivo.com/v1'
    
    if (!apiKey) {
      throw new Error('WORKVIVO_API_KEY environment variable is required')
    }
    
    workvivoService = new WorkvivoService(apiKey, baseUrl)
  }
  
  return workvivoService
}


