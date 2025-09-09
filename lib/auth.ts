import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseService = createClient(supabaseUrl, serviceKey)

export async function requireUser(request?: NextRequest) {
  let user = null

  // Verificar se há token Bearer no header
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const {
        data: { user: tokenUser },
        error: tokenError,
      } = await supabaseService.auth.getUser(token)
      if (!tokenError && tokenUser) {
        user = tokenUser
      }
    }
  }

  // Fallback para cookies
  if (!user) {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user: cookieUser },
      error,
    } = await supabase.auth.getUser()
    if (!error && cookieUser) {
      user = cookieUser
    }
  }

  if (!user) {
    const err: any = new Error('Não autenticado')
    err.status = 401
    throw err
  }

  return {
    userId: user.id,
    companyId: user.user_metadata?.company_id as string | undefined,
  }
}

export interface AuthResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
    company_id: string
    store_id?: string
  }
  error?: {
    code: string
    message: string
  }
  status?: number
}

export async function authenticateAndAuthorize(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthResult> {
  try {
    let user = null
    const devHeaderPresent = !!(
      request.headers.get('x-dev-email') || request.headers.get('x-dev-user')
    )
    const isDevHybrid =
      process.env.NODE_ENV !== 'production' &&
      (process.env.AUTH_MODE === 'hybrid' || devHeaderPresent)
    let devSynthetic: null | {
      email: string
      role: string
      company_id?: string
    } = null

    // Verificar se há token Bearer no header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const {
        data: { user: tokenUser },
        error: tokenError,
      } = await supabaseService.auth.getUser(token)
      if (!tokenError && tokenUser) {
        user = tokenUser
      }
    }

    // Fallback DEV (híbrido): permitir header x-dev-email para simular sessão
    if (!user && isDevHybrid) {
      const devEmail =
        request.headers.get('x-dev-email') || request.headers.get('x-dev-user')
      const devRole = request.headers.get('x-dev-role') || 'admin'
      const devCompany = request.headers.get('x-dev-company') || undefined
      if (devEmail) {
        // Carregar dados do usuário diretamente pela tabela pública
        const { data: devUser } = await supabaseService
          .from('users')
          .select('id, email, name, role, company_id, store_id, status')
          .eq('email', devEmail)
          .maybeSingle()
        if (devUser) {
          // Montar shape semelhante ao auth.getUser
          user = {
            id: devUser.id,
            user_metadata: {
              role: devUser.role,
              company_id: devUser.company_id,
            },
          } as any
        } else {
          // Synthetic dev identity when DB user is not present
          devSynthetic = {
            email: devEmail,
            role: devRole,
            company_id: devCompany,
          }
        }
      }
    }

    // Fallback para cookies
    if (!user) {
      const supabase = createRouteHandlerClient({ cookies })
      const {
        data: { user: cookieUser },
        error,
      } = await supabase.auth.getUser()
      if (!error && cookieUser) {
        user = cookieUser
      }
    }

    if (!user && !devSynthetic) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        },
        status: 401,
      }
    }

    // Buscar dados completos do usuário, ou sintetizar em DEV
    let userData: any = null
    let userError: any = null
    if (devSynthetic) {
      userData = {
        id: '00000000-0000-0000-0000-000000000000',
        email: devSynthetic.email,
        name: devSynthetic.email.split('@')[0],
        role: devSynthetic.role,
        company_id: devSynthetic.company_id ?? null,
        store_id: null,
        status: 'active',
      }
    } else {
      const idOrEmailFilter = user.id
        ? { column: 'id' as const, value: user.id }
        : { column: 'email' as const, value: (user as any)?.email }
      const fetched = await supabaseService
        .from('users')
        .select('id, email, name, role, company_id, store_id, status')
        .eq(idOrEmailFilter.column, idOrEmailFilter.value)
        .single()
      userData = fetched.data
      userError = fetched.error
    }

    if (userError || !userData) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado',
        },
        status: 404,
      }
    }

    // Verificar se o usuário está ativo
    if (userData.status !== 'active') {
      return {
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Usuário inativo',
        },
        status: 403,
      }
    }

    const metadataRole = (user as any)?.user_metadata?.role as
      | string
      | undefined
    const effectiveRole = userData.role || metadataRole || 'user'

    // Verificar se o role é permitido (considerando fallback do metadata em DEV)
    if (!allowedRoles.includes(effectiveRole)) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Permissões insuficientes',
        },
        status: 403,
      }
    }

    return {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: effectiveRole,
        company_id: userData.company_id,
        store_id: userData.store_id,
      },
    }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return {
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Erro interno de autenticação',
      },
      status: 500,
    }
  }
}

// Função para verificar permissões específicas
export function hasPermission(
  userRole: string,
  requiredPermission: string
): boolean {
  const permissions: Record<string, string[]> = {
    // Uploads
    'uploads.create': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'uploads.read': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'uploads.update': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'uploads.delete': ['admin', 'admin_global', 'superadmin'],

    // Aprovações
    'approvals.create': ['admin', 'admin_global', 'superadmin'],
    'approvals.read': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'approvals.update': ['admin', 'admin_global', 'superadmin'],

    // Replicações
    'replications.create': ['admin', 'admin_global', 'superadmin'],
    'replications.read': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'replications.update': ['admin', 'admin_global', 'superadmin'],
    'replications.delete': ['admin_global', 'superadmin'],

    // Orçamentos
    'budgets.create': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'budgets.read': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'budgets.update': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'budgets.delete': ['admin', 'admin_global', 'superadmin'],
    'budgets.approve': ['admin', 'admin_global', 'superadmin'],

    // Produtos
    'products.create': ['admin', 'admin_global', 'superadmin'],
    'products.read': [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ],
    'products.update': ['admin', 'admin_global', 'superadmin'],
    'products.delete': ['admin_global', 'superadmin'],
  }

  const allowedRoles = permissions[requiredPermission] || []
  return allowedRoles.includes(userRole)
}
