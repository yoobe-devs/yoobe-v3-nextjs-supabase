const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSuperadminAuth() {
  try {
    console.log('🔐 Criando conta de autenticação para superadmin...')
    console.log('')

    // 1. Criar usuário na tabela auth.users
    console.log('1. Criando usuário na tabela auth.users...')
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: 'superadmin@test.com',
        password: 'superadmin123',
        email_confirm: true,
        user_metadata: {
          role: 'superadmin',
          full_name: 'Super Admin Test',
        },
      })

    if (authError) {
      console.error('❌ Erro ao criar usuário auth:', authError.message)
      return
    }

    console.log('✅ Usuário auth criado com sucesso!')
    console.log('🆔 ID:', authUser.user.id)
    console.log('📧 Email:', authUser.user.email)
    console.log('')

    // 2. Atualizar o usuário na tabela public.users com o ID correto
    console.log('2. Atualizando usuário na tabela public.users...')
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({
        id: authUser.user.id,
        email: 'superadmin@test.com',
        full_name: 'Super Admin Test',
        role: 'superadmin',
        status: 'active',
      })
      .eq('email', 'superadmin@test.com')

    if (updateError) {
      console.error('❌ Erro ao atualizar usuário:', updateError.message)
      return
    }

    console.log('✅ Usuário atualizado na tabela public.users!')
    console.log('')

    // 3. Testar login
    console.log('3. Testando login...')
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: 'superadmin@test.com',
        password: 'superadmin123',
      })

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message)
      return
    }

    console.log('✅ Login bem-sucedido!')
    console.log(
      '🔑 Token:',
      loginData.session.access_token.substring(0, 20) + '...'
    )
    console.log('')

    // 4. Verificar dados do usuário
    console.log('4. Verificando dados do usuário...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single()

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message)
      return
    }

    console.log('✅ Dados do usuário:')
    console.log('   ID:', userData.id)
    console.log('   Email:', userData.email)
    console.log('   Role:', userData.role)
    console.log('   Status:', userData.status)
    console.log('')

    console.log('🎉 Superadmin criado com sucesso!')
    console.log('')
    console.log('📋 Credenciais de login:')
    console.log('   Email: superadmin@test.com')
    console.log('   Senha: superadmin123')
    console.log('')
    console.log('🚀 Agora você pode fazer login no sistema!')
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createSuperadminAuth()
