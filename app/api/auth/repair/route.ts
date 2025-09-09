import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Usuários padrão que devem sempre existir
// Roles permitidos: 'admin', 'user', 'manager'
const DEFAULT_USERS = [
  {
    email: 'superadmin@test.com',
    password: 'admin123',
    role: 'admin', // Mapeado para admin (superadmin)
    full_name: 'Super Administrador',
    company_id: null,
    store_id: null,
    description: 'Acesso total ao sistema',
  },
  {
    email: 'test@yoobe.com',
    password: 'test123',
    role: 'admin', // Mapeado para admin (admin_global)
    full_name: 'Admin Global',
    company_id: null,
    store_id: null,
    description: 'Administração global',
  },
  {
    email: 'admin@yoobe.com',
    password: 'admin123',
    role: 'admin',
    full_name: 'Admin da Empresa Yoobe',
    company_id: '550e8400-e29b-41d4-a716-446655440001',
    store_id: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Administração da empresa Yoobe',
  },
  {
    email: 'gestor@yoobe.com',
    password: 'gestor123',
    role: 'manager', // Mapeado para manager (gestor)
    full_name: 'Gestor da Loja Yoobe',
    company_id: '550e8400-e29b-41d4-a716-446655440001',
    store_id: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Gestão da Loja Yoobe',
  },
  {
    email: 'funcionario@yoobe.com',
    password: 'funcionario123',
    role: 'user', // Mapeado para user (funcionario)
    full_name: 'Funcionário da Loja Yoobe',
    company_id: '550e8400-e29b-41d4-a716-446655440001',
    store_id: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Operações básicas na Loja Yoobe',
  },
]

// Empresa padrão que deve sempre existir
const DEFAULT_COMPANY = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Yoobe Tecnologia',
  email: 'contato@yoobe.com',
  status: 'active',
  created_at: new Date().toISOString(),
}

// Loja padrão que deve sempre existir
const DEFAULT_STORE = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'Loja Yoobe',
  company_id: '550e8400-e29b-41d4-a716-446655440001',
  status: 'active',
  created_at: new Date().toISOString(),
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando reparo do sistema de autenticação...')

    const repairLog = {
      steps: [] as string[],
      errors: [] as string[],
      success: false,
    }

    // 1. Verificar e criar empresa padrão
    try {
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', DEFAULT_COMPANY.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (!existingCompany) {
        const { error: createError } = await supabase
          .from('companies')
          .insert(DEFAULT_COMPANY)

        if (createError) {
          throw createError
        }

        repairLog.steps.push('✅ Empresa padrão criada')
      } else {
        repairLog.steps.push('✅ Empresa padrão já existe')
      }
    } catch (error) {
      repairLog.errors.push(`Erro ao verificar empresa: ${error}`)
    }

    // 2. Verificar e criar loja padrão
    try {
      const { data: existingStore, error: checkError } = await supabase
        .from('stores')
        .select('id')
        .eq('id', DEFAULT_STORE.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (!existingStore) {
        const { error: createError } = await supabase
          .from('stores')
          .insert(DEFAULT_STORE)

        if (createError) {
          throw createError
        }

        repairLog.steps.push('✅ Loja padrão criada')
      } else {
        repairLog.steps.push('✅ Loja padrão já existe')
      }
    } catch (error) {
      repairLog.errors.push(`Erro ao verificar loja: ${error}`)
    }

    // 3. Limpar usuários problemáticos
    try {
      const { data: allUsers, error: listError } = await supabase
        .from('users')
        .select('id, email, role')

      if (listError) {
        throw listError
      }

      // Verificar usuários órfãos (sem empresa válida)
      const orphanUsers =
        allUsers?.filter(user => {
          const defaultUser = DEFAULT_USERS.find(du => du.email === user.email)
          return (
            !defaultUser &&
            (user.role === 'gestor' || user.role === 'funcionario')
          )
        }) || []

      if (orphanUsers.length > 0) {
        for (const user of orphanUsers) {
          try {
            // Remover do auth
            await supabase.auth.admin.deleteUser(user.id)

            // Remover da tabela users
            await supabase.from('users').delete().eq('id', user.id)

            repairLog.steps.push(`✅ Usuário órfão removido: ${user.email}`)
          } catch (error) {
            repairLog.errors.push(`Erro ao remover ${user.email}: ${error}`)
          }
        }
      } else {
        repairLog.steps.push('✅ Nenhum usuário órfão encontrado')
      }
    } catch (error) {
      repairLog.errors.push(`Erro na limpeza: ${error}`)
    }

    // 4. Criar/atualizar usuários padrão
    for (const userData of DEFAULT_USERS) {
      try {
        // Verificar se usuário já existe
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', userData.email)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingUser) {
          // Atualizar usuário existente
          await updateExistingUser(existingUser.id, userData)
          repairLog.steps.push(`✅ Usuário atualizado: ${userData.email}`)
        } else {
          // Criar novo usuário
          await createNewUser(userData)
          repairLog.steps.push(`✅ Usuário criado: ${userData.email}`)
        }
      } catch (error) {
        repairLog.errors.push(`Erro ao processar ${userData.email}: ${error}`)
      }
    }

    // 5. Verificar se reparo foi bem-sucedido
    const hasErrors = repairLog.errors.length > 0
    repairLog.success = !hasErrors

    if (repairLog.success) {
      console.log('🎉 Reparo concluído com sucesso!')
    } else {
      console.log('⚠️ Reparo concluído com alguns erros')
    }

    return NextResponse.json({
      success: repairLog.success,
      message: repairLog.success
        ? 'Sistema reparado com sucesso!'
        : 'Sistema reparado com alguns erros',
      steps: repairLog.steps,
      errors: repairLog.errors,
    })
  } catch (error) {
    console.error('❌ Erro crítico no reparo:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro crítico no reparo do sistema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

async function updateExistingUser(userId: string, userData: any) {
  // Atualizar no auth
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      email: userData.email,
      password: userData.password,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
        company_id: userData.company_id,
        store_id: userData.store_id,
      },
    }
  )

  if (authError) {
    throw authError
  }

  // Atualizar na tabela users
  const { error: dbError } = await supabase
    .from('users')
    .update({
      email: userData.email,
      full_name: userData.full_name,
      name: userData.full_name,
      role: userData.role,
      company_id: userData.company_id,
      store_id: userData.store_id,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (dbError) {
    throw dbError
  }
}

async function createNewUser(userData: any) {
  // Criar no auth
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
        company_id: userData.company_id,
        store_id: userData.store_id,
      },
    })

  if (authError) {
    throw authError
  }

  // Criar na tabela users
  const { error: dbError } = await supabase.from('users').insert({
    id: authUser.user.id,
    email: userData.email,
    full_name: userData.full_name,
    name: userData.full_name,
    role: userData.role,
    company_id: userData.company_id,
    store_id: userData.store_id,
    status: 'active',
    points_balance: 0,
    created_at: new Date().toISOString(),
  })

  if (dbError) {
    // Rollback: deletar do auth
    await supabase.auth.admin.deleteUser(authUser.user.id)
    throw dbError
  }
}
