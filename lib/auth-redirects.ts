import type { User } from '@supabase/supabase-js'

export interface UserRole {
  role: 'admin' | 'manager' | 'user'
  companyId?: string
}

/**
 * Extrai o role do usuário dos metadados
 */
export function getUserRole(user: User): UserRole {
  const metadata = user.user_metadata as any
  const role = metadata?.role || 'user'

  return {
    role: role as 'admin' | 'manager' | 'user',
    companyId: metadata?.company_id,
  }
}

/**
 * Mapeia roles para rotas de dashboard
 */
export const ROLE_DASHBOARDS = {
  admin: '/admin/dashboard',
  manager: '/gestor/dashboard',
  user: '/funcionario/dashboard',
} as const

/**
 * Mapeia emails de teste para roles
 */
export const TEST_USER_ROLES = {
  'admin@yoobe.com': 'admin',
  'gestor@yoobe.com': 'manager',
  'funcionario@yoobe.com': 'user',
} as const

/**
 * Obtém a rota de dashboard baseada no usuário
 */
export function getDashboardRoute(user: User): string {
  const userRole = getUserRole(user)

  // Para usuários de teste, usar mapeamento direto por email
  if (user.email && user.email in TEST_USER_ROLES) {
    const role = TEST_USER_ROLES[user.email as keyof typeof TEST_USER_ROLES]
    return ROLE_DASHBOARDS[role]
  }

  // Para usuários reais, usar role dos metadados
  return ROLE_DASHBOARDS[userRole.role]
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 */
export function canAccessRoute(user: User, path: string): boolean {
  const userRole = getUserRole(user)

  // Admin pode acessar tudo
  if (userRole.role === 'admin') {
    return true
  }

  // Manager pode acessar rotas de gestor
  if (userRole.role === 'manager' && path.startsWith('/gestor')) {
    return true
  }

  // User pode acessar rotas de funcionário
  if (userRole.role === 'user' && path.startsWith('/funcionario')) {
    return true
  }

  // Rotas públicas
  const publicRoutes = ['/auth', '/choose-environment', '/']
  if (publicRoutes.some(route => path.startsWith(route))) {
    return true
  }

  return false
}

/**
 * Obtém a rota de redirecionamento após login
 */
export function getPostLoginRedirect(
  user: User,
  redirectParam?: string
): string {
  // Se há um parâmetro de redirecionamento e o usuário pode acessar
  if (redirectParam && canAccessRoute(user, redirectParam)) {
    return redirectParam
  }

  // Caso contrário, redirecionar para o dashboard apropriado
  return getDashboardRoute(user)
}
