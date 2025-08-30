import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Tipos para o Gestor
export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
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

// Queries para Funcionários
export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employees:', error)
    throw error
  }

  return data || []
}

export async function createEmployee(employeeData: Partial<Employee>): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single()

  if (error) {
    console.error('Error creating employee:', error)
    throw error
  }

  return data
}

export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .update(employeeData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating employee:', error)
    throw error
  }

  return data
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting employee:', error)
    throw error
  }

  return true
}

// Queries para Produtos da Empresa
export async function getCompanyProducts(): Promise<CompanyProduct[]> {
  const { data, error } = await supabase
    .from('company_products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching company products:', error)
    throw error
  }

  return data || []
}

export async function createCompanyProduct(productData: Partial<CompanyProduct>): Promise<CompanyProduct | null> {
  const { data, error } = await supabase
    .from('company_products')
    .insert([productData])
    .select()
    .single()

  if (error) {
    console.error('Error creating company product:', error)
    throw error
  }

  return data
}

export async function updateCompanyProduct(id: string, productData: Partial<CompanyProduct>): Promise<CompanyProduct | null> {
  const { data, error } = await supabase
    .from('company_products')
    .update(productData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating company product:', error)
    throw error
  }

  return data
}

export async function deleteCompanyProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('company_products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting company product:', error)
    throw error
  }

  return true
}

// Queries para Pedidos da Empresa
export async function getCompanyOrders(): Promise<CompanyOrder[]> {
  const { data, error } = await supabase
    .from('company_orders')
    .select(`
      *,
      order_items (
        id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching company orders:', error)
    throw error
  }

  return data || []
}

export async function updateOrderStatus(id: string, status: CompanyOrder['status']): Promise<CompanyOrder | null> {
  const { data, error } = await supabase
    .from('company_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    throw error
  }

  return data
}

// Dashboard Stats para Gestor
export async function getGestorStats(): Promise<GestorStats> {
  // Get total employees
  const { count: totalEmployees } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })

  // Get active employees
  const { count: activeEmployees } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get total products
  const { count: totalProducts } = await supabase
    .from('company_products')
    .select('*', { count: 'exact', head: true })

  // Get total orders
  const { count: totalOrders } = await supabase
    .from('company_orders')
    .select('*', { count: 'exact', head: true })

  // Get pending orders
  const { count: pendingOrders } = await supabase
    .from('company_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('company_orders')
    .select('total_amount')
    .eq('status', 'delivered')

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  // Get total points distributed
  const { data: pointsData } = await supabase
    .from('employees')
    .select('points_balance')

  const totalPointsDistributed = pointsData?.reduce((sum, employee) => sum + employee.points_balance, 0) || 0

  // Calculate average order value
  const averageOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalEmployees: totalEmployees || 0,
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    totalRevenue,
    activeEmployees: activeEmployees || 0,
    pendingOrders: pendingOrders || 0,
    totalPointsDistributed,
    averageOrderValue
  }
}

// Configurações da Empresa
export async function getCompanyConfig(): Promise<CompanyConfig | null> {
  const { data, error } = await supabase
    .from('company_config')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching company config:', error)
    throw error
  }

  return data
}

export async function updateCompanyConfig(configData: Partial<CompanyConfig>): Promise<CompanyConfig | null> {
  const { data, error } = await supabase
    .from('company_config')
    .update({ ...configData, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) {
    console.error('Error updating company config:', error)
    throw error
  }

  return data
}
