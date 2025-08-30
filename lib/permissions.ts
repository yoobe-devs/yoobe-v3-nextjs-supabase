export type Permission = 
  // Usuários
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:manage'
  
  // Empresas
  | 'companies:read'
  | 'companies:create'
  | 'companies:update'
  | 'companies:delete'
  | 'companies:manage'
  
  // Produtos
  | 'products:read'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  | 'products:manage'
  
  // Pedidos
  | 'orders:read'
  | 'orders:create'
  | 'orders:update'
  | 'orders:delete'
  | 'orders:manage'
  
  // Relatórios
  | 'reports:read'
  | 'reports:export'
  
  // Configurações
  | 'settings:read'
  | 'settings:update'
  
  // Sistema
  | 'system:admin'
  | 'system:super_admin'

export type Role = 'user' | 'gestor' | 'admin' | 'super_admin'

export interface UserPermissions {
  role: Role
  permissions: Permission[]
  company_id?: string
  department?: string
}

// Mapeamento de roles para permissões
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [
    'products:read',
    'orders:read',
    'orders:create'
  ],
  gestor: [
    'users:read',
    'users:create',
    'users:update',
    'companies:read',
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'orders:read',
    'orders:create',
    'orders:update',
    'reports:read',
    'settings:read'
  ],
  admin: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'users:manage',
    'companies:read',
    'companies:create',
    'companies:update',
    'companies:delete',
    'companies:manage',
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'products:manage',
    'orders:read',
    'orders:create',
    'orders:update',
    'orders:delete',
    'orders:manage',
    'reports:read',
    'reports:export',
    'settings:read',
    'settings:update'
  ],
  super_admin: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'users:manage',
    'companies:read',
    'companies:create',
    'companies:update',
    'companies:delete',
    'companies:manage',
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'products:manage',
    'orders:read',
    'orders:create',
    'orders:update',
    'orders:delete',
    'orders:manage',
    'reports:read',
    'reports:export',
    'settings:read',
    'settings:update',
    'system:admin',
    'system:super_admin'
  ]
}

export function getUserPermissions(role: Role, company_id?: string): UserPermissions {
  return {
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
    company_id
  }
}

export function hasPermission(userPermissions: UserPermissions, permission: Permission): boolean {
  return userPermissions.permissions.includes(permission)
}

export function hasAnyPermission(userPermissions: UserPermissions, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userPermissions, permission))
}

export function hasAllPermissions(userPermissions: UserPermissions, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userPermissions, permission))
}

export function canAccessResource(userPermissions: UserPermissions, resourceType: string, action: string): boolean {
  const permission = `${resourceType}:${action}` as Permission
  return hasPermission(userPermissions, permission)
}

export function canManageCompany(userPermissions: UserPermissions, targetCompanyId?: string): boolean {
  // Super admin pode gerenciar qualquer empresa
  if (hasPermission(userPermissions, 'system:super_admin')) {
    return true
  }
  
  // Admin pode gerenciar qualquer empresa
  if (hasPermission(userPermissions, 'system:admin')) {
    return true
  }
  
  // Gestor só pode gerenciar sua própria empresa
  if (hasPermission(userPermissions, 'companies:manage')) {
    return userPermissions.company_id === targetCompanyId
  }
  
  return false
}

export function canManageUser(userPermissions: UserPermissions, targetUserRole?: Role, targetCompanyId?: string): boolean {
  // Super admin pode gerenciar qualquer usuário
  if (hasPermission(userPermissions, 'system:super_admin')) {
    return true
  }
  
  // Admin pode gerenciar usuários de qualquer empresa, exceto super admins
  if (hasPermission(userPermissions, 'system:admin')) {
    return targetUserRole !== 'super_admin'
  }
  
  // Gestor só pode gerenciar usuários de sua empresa
  if (hasPermission(userPermissions, 'users:manage')) {
    return userPermissions.company_id === targetCompanyId && targetUserRole !== 'admin'
  }
  
  return false
}

// Hook para usar permissões em componentes React
export function usePermissions(userRole: Role, company_id?: string) {
  const userPermissions = getUserPermissions(userRole, company_id)
  
  return {
    hasPermission: (permission: Permission) => hasPermission(userPermissions, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userPermissions, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userPermissions, permissions),
    canAccessResource: (resourceType: string, action: string) => canAccessResource(userPermissions, resourceType, action),
    canManageCompany: (targetCompanyId?: string) => canManageCompany(userPermissions, targetCompanyId),
    canManageUser: (targetUserRole?: Role, targetCompanyId?: string) => canManageUser(userPermissions, targetUserRole, targetCompanyId),
    permissions: userPermissions.permissions,
    role: userPermissions.role
  }
}
