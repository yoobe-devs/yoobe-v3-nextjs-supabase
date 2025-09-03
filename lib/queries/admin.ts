import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Tipos
export interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  logo_url: string
  status: 'active' | 'inactive' | 'pending'
  stores_count: number
  users_count: number
  products_count: number
  created_at: string
}

export interface Store {
  id: string
  name: string
  company_name: string
  company_id: string
  status: 'active' | 'inactive'
  users_count: number
  products_count: number
  orders_count: number
  created_at: string
}

export interface User {
  id: string
  name: string
  full_name: string
  email: string
  company: string
  role: 'admin' | 'user' | 'manager'
  status: 'active' | 'inactive' | 'suspended'
  points_balance: number
  orders_count: number
  created_at: string
  avatar_url: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  company: string
  status: 'active' | 'inactive' | 'out_of_stock'
  stock_quantity: number
  image_url: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  company_id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  points_used: number
  created_at: string
  updated_at: string
}

// Queries para Empresas
export async function getCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(company => ({
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      logo_url: company.logo_url || '',
      status: company.status,
      stores_count: 0, // Mock data for now
      users_count: 0, // Mock data for now
      products_count: 0, // Mock data for now
      created_at: company.created_at
    })) || []
  } catch (error) {
    console.error('Error fetching companies:', error)
    return []
  }
}

export async function createCompany(companyData: Partial<Company>): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating company:', error)
    return null
  }
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating company:', error)
    return null
  }
}

export async function deleteCompany(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting company:', error)
    return false
  }
}

// Queries para Lojas
export async function getStores(): Promise<Store[]> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        companies!inner(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(store => ({
      id: store.id,
      name: store.name,
      company_name: store.companies?.name || '',
      company_id: store.company_id,
      status: store.status,
      users_count: 0, // Mock data
      products_count: 0, // Mock data
      orders_count: 0, // Mock data
      created_at: store.created_at
    })) || []
  } catch (error) {
    console.error('Error fetching stores:', error)
    return []
  }
}

// Queries para Usuários
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        companies!inner(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(user => ({
      id: user.id,
      name: user.name || user.full_name,
      full_name: user.full_name,
      email: user.email,
      company: user.companies?.name || '',
      role: user.role,
      status: user.status,
      points_balance: user.points_balance || 0,
      orders_count: 0, // Mock data for now
      created_at: user.created_at,
      avatar_url: user.avatar_url || ''
    })) || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Queries para Produtos
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('company_products')
      .select(`
        *,
        companies!inner(name),
        categories(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.categories?.name || '',
      company: product.companies?.name || '',
      status: product.status,
      stock_quantity: product.stock_quantity || 0,
      image_url: product.image_url || '',
      created_at: product.created_at
    })) || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Queries para Pedidos
export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        companies!inner(name),
        users!inner(name, full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(order => ({
      id: order.id,
      user_id: order.user_id,
      company_id: order.company_id,
      status: order.status,
      total_amount: order.total_amount,
      points_used: order.points_used || 0,
      created_at: order.created_at,
      updated_at: order.updated_at
    })) || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

// Dashboard Stats
export async function getDashboardStats() {
  try {
    // Total companies
    const { count: totalCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })

    // Total stores
    const { count: totalStores } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Total products
    const { count: totalProducts } = await supabase
      .from('company_products')
      .select('*', { count: 'exact', head: true })

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered')

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    return {
      totalCompanies: totalCompanies || 0,
      totalStores: totalStores || 0,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalCompanies: 0,
      totalStores: 0,
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    }
  }
}
