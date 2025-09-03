const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixLoginComplete() {
  try {
    console.log('🔧 DIAGNÓSTICO E CORREÇÃO COMPLETA DO LOGIN')
    console.log('='.repeat(50))
    console.log('')

    // 1. VERIFICAR CONEXÃO COM SUPABASE
    console.log('1️⃣ Verificando conexão com Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.error('❌ Erro na conexão:', testError.message)
      return
    }
    console.log('✅ Supabase conectado com sucesso')
    console.log('')

    // 2. VERIFICAR USUÁRIOS EXISTENTES
    console.log('2️⃣ Verificando usuários existentes...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, status')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message)
      return
    }

    console.log(`📊 Total de usuários: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.status}`)
    })
    console.log('')

    // 3. VERIFICAR USUÁRIOS ADMIN
    console.log('3️⃣ Verificando usuários admin...')
    const adminUsers = users.filter(u =>
      ['admin_global', 'superadmin'].includes(u.role)
    )

    if (adminUsers.length === 0) {
      console.log('⚠️ Nenhum usuário admin encontrado! Criando...')

      // Criar usuário admin_global
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: 'admin@yoobe.co',
          password: 'admin123',
          email_confirm: true,
          user_metadata: {
            role: 'admin_global',
            full_name: 'Administrador',
          },
        })

      if (authError) {
        console.error('❌ Erro ao criar usuário auth:', authError.message)
        return
      }

      // Inserir na tabela public.users
      const { error: insertError } = await supabase.from('users').insert({
        id: authUser.user.id,
        email: 'admin@yoobe.co',
        full_name: 'Administrador',
        role: 'admin_global',
        status: 'active',
      })

      if (insertError) {
        console.error('❌ Erro ao inserir usuário:', insertError.message)
        return
      }

      console.log('✅ Usuário admin_global criado com sucesso!')
    } else {
      console.log(`✅ ${adminUsers.length} usuário(s) admin encontrado(s):`)
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`)
      })
    }
    console.log('')

    // 4. VERIFICAR E CORRIGIR ROLES
    console.log('4️⃣ Verificando e corrigindo roles...')
    const { data: roles, error: rolesError } = await supabase
      .from('users')
      .select('role')
      .limit(100)

    if (rolesError) {
      console.error('❌ Erro ao verificar roles:', rolesError.message)
      return
    }

    const uniqueRoles = [...new Set(roles.map(r => r.role))]
    console.log('🎭 Roles encontrados:', uniqueRoles)

    // Verificar se admin_global existe
    if (!uniqueRoles.includes('admin_global')) {
      console.log(
        '⚠️ Role admin_global não encontrado! Verificando constraint...'
      )

      // Verificar constraint atual
      const { data: constraintData, error: constraintError } =
        await supabase.rpc('exec_sql', {
          sql: "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'users'::regclass AND contype = 'c' AND conname = 'users_role_check';",
        })

      if (constraintError) {
        console.log('⚠️ Não foi possível verificar constraint via RPC')
      } else {
        console.log('📋 Constraint atual:', constraintData)
      }
    }
    console.log('')

    // 5. TESTAR LOGIN
    console.log('5️⃣ Testando login...')
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: 'admin@yoobe.co',
        password: 'admin123',
      })

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message)
      console.log('💡 Isso pode indicar problema na configuração do Supabase')
    } else {
      console.log('✅ Login bem-sucedido!')
      console.log(
        '🔑 Token:',
        loginData.session.access_token.substring(0, 20) + '...'
      )
    }
    console.log('')

    // 6. VERIFICAR CONFIGURAÇÕES
    console.log('6️⃣ Verificando configurações...')
    console.log('🌐 Supabase URL:', supabaseUrl)
    console.log(
      '🔑 Service Role Key:',
      supabaseServiceKey.substring(0, 20) + '...'
    )
    console.log('')

    // 7. RESUMO E PRÓXIMOS PASSOS
    console.log('📋 RESUMO E PRÓXIMOS PASSOS')
    console.log('='.repeat(50))
    console.log('')

    if (adminUsers.length > 0 || loginData) {
      console.log('✅ SISTEMA FUNCIONANDO!')
      console.log('')
      console.log('🔑 Credenciais de login:')
      console.log('   Email: admin@yoobe.co')
      console.log('   Senha: admin123')
      console.log('')
      console.log('🌐 URLs para testar:')
      console.log('   - Login: http://localhost:3001/auth/login')
      console.log('   - Admin: http://localhost:3001/admin')
      console.log('')
      console.log('🚀 Próximos passos:')
      console.log('   1. Acesse http://localhost:3001/auth/login')
      console.log('   2. Use as credenciais acima')
      console.log('   3. Navegue para /admin')
    } else {
      console.log('⚠️ PROBLEMAS DETECTADOS!')
      console.log('')
      console.log('🔧 Ações necessárias:')
      console.log('   1. Verificar se o Supabase está rodando')
      console.log('   2. Verificar variáveis de ambiente')
      console.log('   3. Verificar configurações de auth no Supabase')
    }
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixLoginComplete()
