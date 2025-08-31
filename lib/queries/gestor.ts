import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Tipos para o Gestor
export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  position: string
  status: 'active' | 'inactive'
  points_balance: number
  avatar_url: string
  created_at: string
  last_login: string
}

export interface CompanyProduct {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  category: string
  status: 'active' | 'inactive' | 'out_of_stock'
  stock: number
  image_url: string
  company_id: string
  created_at: string
}

export interface CompanyOrder {
  id: string
  order_number: string
  employee_id: string
  employee_name: string
  employee_email: string
  total_amount: number
  points_used: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface GestorStats {
  totalEmployees: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  activeEmployees: number
  pendingOrders: number
  totalPointsDistributed: number
  averageOrderValue: number
}

export interface CompanyConfig {
  id: string
  name: string
  logo_url: string
  primary_color: string
  points_system_enabled: boolean
  max_points_per_month: number
  auto_approve_orders: boolean
  notification_email: string
  created_at: string
  updated_at: string
}

// Função para obter o usuário logado e sua company_id
async function getCurrentUserCompany() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data: userData, error } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (error) throw error
  if (!userData.company_id) throw new Error('Usuário não associado a uma empresa')
  if (userData.role !== 'manager') throw new Error('Acesso negado: apenas gestores')

  return userData.company_id
}

// Queries para Funcionários (usuários da empresa)
export async function getEmployees(): Promise<Employee[]> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/gestor/employees?company_id=${companyId}`)
  
  if (!response.ok) {
    throw new Error('Erro ao buscar funcionários')
  }

  const data = await response.json()
  
  // Transformar dados para o formato esperado
  return (data.employees || []).map((employee: any) => ({
    ...employee,
    last_login: employee.updated_at || employee.created_at
  }))
}

export async function createEmployee(employeeData: Partial<Employee>): Promise<Employee | null> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch('/api/gestor/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...employeeData,
      company_id: companyId
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar funcionário')
  }

  const data = await response.json()
  return data.employee
}

export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee | null> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...employeeData,
      company_id: companyId
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar funcionário')
  }

  const data = await response.json()
  return data.user
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar funcionário')
  }

  return true
}

// Queries para Produtos da Empresa
export async function getCompanyProducts(): Promise<CompanyProduct[]> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/gestor/products?company_id=${companyId}`)
  
  if (!response.ok) {
    throw new Error('Erro ao buscar produtos')
  }

  const data = await response.json()
  
  // Transformar dados para o formato esperado
  return (data.products || []).map((product: any) => ({
    ...product,
    stock: product.stock_quantity || 0
  }))
}

export async function createCompanyProduct(productData: Partial<CompanyProduct>): Promise<CompanyProduct | null> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch('/api/gestor/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...productData,
      company_id: companyId
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar produto')
  }

  const data = await response.json()
  return data.product
}

export async function updateCompanyProduct(id: string, productData: Partial<CompanyProduct>): Promise<CompanyProduct | null> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...productData,
      company_id: companyId
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar produto')
  }

  const data = await response.json()
  return data.product
}

export async function deleteCompanyProduct(id: string): Promise<boolean> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar produto')
  }

  return true
}

// Queries para Pedidos da Empresa
export async function getCompanyOrders(): Promise<CompanyOrder[]> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/gestor/orders?company_id=${companyId}`)
  
  if (!response.ok) {
    throw new Error('Erro ao buscar pedidos')
  }

  const data = await response.json()
  return data.orders || []
}

export async function updateOrderStatus(id: string, status: CompanyOrder['status']): Promise<CompanyOrder | null> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      status,
      company_id: companyId
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar status do pedido')
  }

  const data = await response.json()
  return data.order
}

// Dashboard Stats para Gestor
export async function getGestorStats(): Promise<GestorStats> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/gestor/stats?company_id=${companyId}`)
  
  if (!response.ok) {
    throw new Error('Erro ao buscar estatísticas')
  }

  const data = await response.json()
  return data.stats
}

// Configurações da Empresa
export async function getCompanyConfig(): Promise<CompanyConfig | null> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/companies/${companyId}`)
  
  if (!response.ok) {
    throw new Error('Erro ao buscar configurações da empresa')
  }

  const data = await response.json()
  const company = data.company

  // Transformar para o formato esperado
  return company ? {
    id: company.id,
    name: company.name,
    logo_url: company.logo_url,
    primary_color: '#1e40af', // Cor padrão
    points_system_enabled: company.allow_points_only || company.allow_mixed_payment,
    max_points_per_month: 1000, // Valor padrão
    auto_approve_orders: true, // Valor padrão
    notification_email: '', // Valor padrão
    created_at: company.created_at,
    updated_at: company.updated_at
  } : null
}

export async function updateCompanyConfig(configData: Partial<CompanyConfig>): Promise<CompanyConfig | null> {
  const companyId = await getCurrentUserCompany()

  const response = await fetch(`/api/companies/${companyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(configData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar configurações')
  }

  const data = await response.json()
  return data.company
}
