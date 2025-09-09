import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

export interface UserData {
  id: string
  email: string
  role: string
  company_id: string
  store_id?: string
  full_name?: string
}

// Função para verificar autenticação via header ou cookies
export async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Primeiro, tentar autenticação via cookies (padrão)
  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Se não funcionar, tentar via header Authorization
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        // Verificar token via service role
        const {
          data: { user: tokenUser },
          error: tokenError,
        } = await supabaseService.auth.getUser(token)

        if (!tokenError && tokenUser) {
          user = tokenUser
          authError = null
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }
  }

  return { user, error: authError }
}

// Função para buscar dados completos do usuário da tabela users
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('id, email, role, company_id, store_id, full_name')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('Erro ao buscar dados do usuário:', userError)
      return null
    }

    return userData as UserData
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return null
  }
}

// Função para verificar se o usuário tem permissão
export function hasPermission(
  userRole: string,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(userRole)
}

// Função para validar UUID
export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}

// Função completa de autenticação e autorização
export async function authenticateAndAuthorize(
  request: NextRequest,
  allowedRoles: string[] = [
    'manager',
    'gestor',
    'admin',
    'admin_global',
    'superadmin',
  ]
) {
  // 1. Autenticar usuário
  const { user, error: authError } = await authenticateUser(request)
  if (authError || !user) {
    return {
      success: false,
      error: 'Não autorizado',
      status: 401,
    }
  }

  // 2. Buscar dados completos do usuário
  const userData = await getUserData(user.id)
  if (!userData) {
    return {
      success: false,
      error: 'Usuário não encontrado',
      status: 404,
    }
  }

  // 3. Verificar permissões
  if (!hasPermission(userData.role, allowedRoles)) {
    return {
      success: false,
      error: 'Acesso negado',
      status: 403,
    }
  }

  return {
    success: true,
    user: userData,
    authUser: user,
  }
}

