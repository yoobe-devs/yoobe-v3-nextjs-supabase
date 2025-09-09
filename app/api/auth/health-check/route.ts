import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Usuários críticos que devem sempre funcionar
// Roles permitidos: 'admin', 'user', 'manager'
const CRITICAL_USERS = [
  {
    email: 'superadmin@test.com',
    password: 'admin123',
    role: 'admin', // Mapeado para admin (superadmin)
    priority: 1,
  },
  {
    email: 'gestor@yoobe.com',
    password: 'gestor123',
    role: 'manager', // Mapeado para manager (gestor)
    priority: 2,
  },
  {
    email: 'funcionario@yoobe.com',
    password: 'funcionario123',
    role: 'user', // Mapeado para user (funcionario)
    priority: 3,
  },
]

export async function GET(request: NextRequest) {
  try {
    const healthStatus = {
      overall: 'unknown' as 'healthy' | 'warning' | 'critical' | 'unknown',
      users: {} as Record<string, string>,
      database: 'unknown' as 'healthy' | 'unhealthy',
      auth: 'unknown' as 'healthy' | 'unhealthy',
      issues: [] as string[],
      lastCheck: new Date().toISOString(),
    }

    // 1. Verificar conexão com banco
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      healthStatus.database = 'healthy'
    } catch (error) {
      healthStatus.database = 'unhealthy'
      healthStatus.issues.push(`Banco de dados: ${error}`)
    }

    // 2. Verificar sistema de auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'superadmin@test.com',
        password: 'admin123',
      })

      if (error) {
        throw error
      }

      // Fazer logout
      await supabase.auth.signOut()

      healthStatus.auth = 'healthy'
    } catch (error) {
      healthStatus.auth = 'unhealthy'
      healthStatus.issues.push(`Sistema de auth: ${error}`)
    }

    // 3. Verificar usuários críticos
    for (const userData of CRITICAL_USERS) {
      try {
        // Verificar se usuário existe no banco
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('id, email, role, status, company_id, store_id')
          .eq('email', userData.email)
          .single()

        if (dbError) {
          healthStatus.users[userData.email] = 'missing'
          healthStatus.issues.push(
            `Usuário ${userData.email} não encontrado no banco`
          )
          continue
        }

        // Verificar se usuário pode fazer login
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password,
          })

        if (authError) {
          healthStatus.users[userData.email] = 'auth_failed'
          healthStatus.issues.push(
            `Login falhou para ${userData.email}: ${authError.message}`
          )
          continue
        }

        // Fazer logout
        await supabase.auth.signOut()

        // Verificar integridade dos dados
        const issues = []
        if (dbUser.status !== 'active') {
          issues.push('Status inativo')
        }
        if (dbUser.role !== userData.role) {
          issues.push(
            `Role incorreto: ${dbUser.role} (esperado: ${userData.role})`
          )
        }
        if (
          (userData.role === 'gestor' || userData.role === 'funcionario') &&
          !dbUser.company_id
        ) {
          issues.push('Sem company_id')
        }

        if (issues.length > 0) {
          healthStatus.users[userData.email] = 'data_issues'
          healthStatus.issues.push(`${userData.email}: ${issues.join(', ')}`)
        } else {
          healthStatus.users[userData.email] = 'healthy'
        }
      } catch (error) {
        healthStatus.users[userData.email] = 'error'
        healthStatus.issues.push(
          `Erro ao verificar ${userData.email}: ${error}`
        )
      }
    }

    // 4. Verificar empresa e loja padrão
    try {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name, status')
        .eq('id', '550e8400-e29b-41d4-a716-446655440001')
        .single()

      if (companyError) {
        healthStatus.issues.push('Empresa padrão não encontrada')
      }
    } catch (error) {
      healthStatus.issues.push(`Erro ao verificar empresa: ${error}`)
    }

    try {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, name, status')
        .eq('id', '550e8400-e29b-41d4-a716-446655440002')
        .single()

      if (storeError) {
        healthStatus.issues.push('Loja padrão não encontrada')
      }
    } catch (error) {
      healthStatus.issues.push(`Erro ao verificar loja: ${error}`)
    }

    // 5. Determinar status geral
    const hasCriticalIssues = healthStatus.issues.some(
      issue =>
        issue.includes('não encontrado') ||
        issue.includes('Login falhou') ||
        issue.includes('Banco de dados') ||
        issue.includes('Sistema de auth')
    )

    const hasWarnings = healthStatus.issues.some(
      issue =>
        issue.includes('Role incorreto') ||
        issue.includes('Status inativo') ||
        issue.includes('Sem company_id')
    )

    if (hasCriticalIssues) {
      healthStatus.overall = 'critical'
    } else if (hasWarnings) {
      healthStatus.overall = 'warning'
    } else {
      healthStatus.overall = 'healthy'
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error('Erro no health check:', error)
    return NextResponse.json(
      {
        overall: 'critical',
        users: {},
        database: 'unhealthy',
        auth: 'unhealthy',
        issues: [`Erro crítico: ${error}`],
        lastCheck: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
