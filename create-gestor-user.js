const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function createGestorUser() {
  try {
    console.log('🔧 Criando usuário gestor...')

    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'gestor.join.tech@jointecnologia.com.br')
      .single()

    if (existingUser) {
      console.log('✅ Usuário gestor já existe!')
      return
    }

    // Criar usuário no auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: 'gestor123',
      email_confirm: true,
      user_metadata: {
        name: 'Gestor Join Tecnologia',
        role: 'manager'
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário no auth:', authError)
      return
    }

    console.log('✅ Usuário criado no auth:', authUser.user.id)

    // Inserir na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: 'gestor.join.tech@jointecnologia.com.br',
        full_name: 'Gestor Join Tecnologia',
        name: 'Gestor Join',
        role: 'manager',
        company_id: '550e8400-e29b-41d4-a716-446655440002', // Join Tecnologia
        department: 'Administrativo',
        position: 'Gestor',
        points_balance: 0,
        status: 'active',
        avatar_url: 'https://ui-avatars.com/api/?name=Gestor+Join&background=3b82f6&color=ffffff&size=128'
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Erro ao inserir na tabela users:', userError)
      return
    }

    console.log('✅ Usuário gestor criado com sucesso!')
    console.log('📧 Email:', user.email)
    console.log('🔑 Senha: gestor123')
    console.log('🏢 Empresa: Join Tecnologia')

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

createGestorUser()
