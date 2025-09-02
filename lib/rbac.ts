import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export type UserRole = 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'

export interface UserCompanyRole {
  id: string
  user_id: string
  company_id: string
  role: UserRole
}

/**
 * Get user role in a specific company
 */
export async function getUserRole(userId: string, companyId?: string): Promise<UserRole> {
  if (!companyId) return 'funcionario'
  
  const { data, error } = await service
    .from('user_company_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .single()
  
  if (error || !data) return 'funcionario'
  return data.role
}

/**
 * Check if user has minimum required role
 */
export async function requireRole(
  userId: string, 
  companyId: string, 
  minRole: UserRole
): Promise<boolean> {
  const userRole = await getUserRole(userId, companyId)
  
  switch (minRole) {
    case 'superadmin':
      return userRole === 'superadmin'
    case 'admin_gestor':
      return ['superadmin', 'admin_gestor'].includes(userRole)
    case 'gestor':
      return ['superadmin', 'admin_gestor', 'gestor'].includes(userRole)
    default:
      return true
  }
}

/**
 * Check if user is superadmin
 */
export async function isSuperadmin(userId: string): Promise<boolean> {
  const { data, error } = await service
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error || !data) return false
  return data.role === 'superadmin'
}

/**
 * Check if user is admin_gestor in a company
 */
export async function isAdminGestor(userId: string, companyId: string): Promise<boolean> {
  const role = await getUserRole(userId, companyId)
  return ['superadmin', 'admin_gestor'].includes(role)
}

/**
 * Check if user is gestor in a company
 */
export async function isGestor(userId: string, companyId: string): Promise<boolean> {
  const role = await getUserRole(userId, companyId)
  return ['superadmin', 'admin_gestor', 'gestor'].includes(role)
}

/**
 * Get all companies where user has a role
 */
export async function getUserCompanies(userId: string): Promise<Array<{ company_id: string, role: UserRole }>> {
  const { data, error } = await service
    .from('user_company_roles')
    .select('company_id, role')
    .eq('user_id', userId)
  
  if (error || !data) return []
  return data
}

/**
 * Get all users in a company with their roles
 */
export async function getCompanyUsers(companyId: string): Promise<UserCompanyRole[]> {
  const { data, error } = await service
    .from('user_company_roles')
    .select('*')
    .eq('company_id', companyId)
  
  if (error || !data) return []
  return data
}

/**
 * Check if user can perform action on resource
 */
export async function canPerformAction(
  userId: string,
  companyId: string,
  action: 'read' | 'write' | 'delete',
  resource: 'quotes' | 'users' | 'products' | 'payments'
): Promise<boolean> {
  const userRole = await getUserRole(userId, companyId)
  
  // Superadmin can do everything
  if (userRole === 'superadmin') return true
  
  switch (resource) {
    case 'quotes':
      if (action === 'read') return true // Everyone can read quotes in their company
      if (action === 'write') return ['admin_gestor', 'gestor'].includes(userRole)
      if (action === 'delete') return userRole === 'admin_gestor'
      break
      
    case 'users':
      if (action === 'read') return ['admin_gestor', 'gestor'].includes(userRole)
      if (action === 'write') return userRole === 'admin_gestor'
      if (action === 'delete') return userRole === 'admin_gestor'
      break
      
    case 'products':
      if (action === 'read') return true
      if (action === 'write') return ['admin_gestor', 'gestor'].includes(userRole)
      if (action === 'delete') return userRole === 'admin_gestor'
      break
      
    case 'payments':
      if (action === 'read') return ['admin_gestor', 'gestor'].includes(userRole)
      if (action === 'write') return userRole === 'admin_gestor'
      if (action === 'delete') return userRole === 'admin_gestor'
      break
  }
  
  return false
}

/**
 * Get user permissions map for frontend
 */
export async function getUserPermissions(userId: string, companyId?: string): Promise<Record<string, boolean>> {
  if (!companyId) {
    return {
      can_read_quotes: false,
      can_write_quotes: false,
      can_delete_quotes: false,
      can_read_users: false,
      can_write_users: false,
      can_delete_users: false,
      can_read_products: false,
      can_write_products: false,
      can_delete_products: false,
      can_read_payments: false,
      can_write_payments: false,
      can_delete_payments: false,
      is_superadmin: await isSuperadmin(userId),
      is_admin_gestor: false,
      is_gestor: false
    }
  }
  
  const [
    can_read_quotes,
    can_write_quotes,
    can_delete_quotes,
    can_read_users,
    can_write_users,
    can_delete_users,
    can_read_products,
    can_write_products,
    can_delete_products,
    can_read_payments,
    can_write_payments,
    can_delete_payments
  ] = await Promise.all([
    canPerformAction(userId, companyId, 'read', 'quotes'),
    canPerformAction(userId, companyId, 'write', 'quotes'),
    canPerformAction(userId, companyId, 'delete', 'quotes'),
    canPerformAction(userId, companyId, 'read', 'users'),
    canPerformAction(userId, companyId, 'write', 'users'),
    canPerformAction(userId, companyId, 'delete', 'users'),
    canPerformAction(userId, companyId, 'read', 'products'),
    canPerformAction(userId, companyId, 'write', 'products'),
    canPerformAction(userId, companyId, 'delete', 'products'),
    canPerformAction(userId, companyId, 'read', 'payments'),
    canPerformAction(userId, companyId, 'write', 'payments'),
    canPerformAction(userId, companyId, 'delete', 'payments')
  ])
  
  return {
    can_read_quotes,
    can_write_quotes,
    can_delete_quotes,
    can_read_users,
    can_write_users,
    can_delete_users,
    can_read_products,
    can_write_products,
    can_delete_products,
    can_read_payments,
    can_write_payments,
    can_delete_payments,
    is_superadmin: await isSuperadmin(userId),
    is_admin_gestor: await isAdminGestor(userId, companyId),
    is_gestor: await isGestor(userId, companyId)
  }
}
