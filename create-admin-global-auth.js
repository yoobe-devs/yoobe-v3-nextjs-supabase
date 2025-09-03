const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminGlobalAuth() {
  try {
    console.log('🔐 Criando conta de autenticação para admin_global...')
    console.log('')

    // 1. Criar usuário na tabela auth.users
    console.log('1. Criando usuário na tabela auth.users...')
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
        email: 'admin@yoobe.co',
        full_name: 'Administrador',
        role: 'admin_global',
        status: 'active',
      })
      .eq('email', 'admin@yoobe.co')

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
        email: 'admin@yoobe.co',
        password: 'admin123',
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

    console.log('🎉 Admin Global criado com sucesso!')
    console.log('')
    console.log('📋 Credenciais de login:')
    console.log('   Email: admin@yoobe.co')
    console.log('   Senha: admin123')
    console.log('')
    console.log('🚀 Agora você pode fazer login e acessar todos os menus!')
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createAdminGlobalAuth()
