const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createGestor() {
  try {
    console.log('Criando gestor...')

    // Primeiro, criar usuário no auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: '123456',
      email_confirm: true
    })

    if (authError) {
      console.error('Erro ao criar usuário no auth:', authError)
      return
    }

    console.log('Usuário criado no auth:', authUser.user.id)

    // Depois, inserir na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authUser.user.id,
        name: 'João Silva - Gestor',
        email: 'gestor.join.tech@jointecnologia.com.br',
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        role: 'manager',
        status: 'active',
        points_balance: 0
      }])
      .select()
      .single()

    if (userError) {
      console.error('Erro ao criar usuário no banco:', userError)
      return
    }

    console.log('Gestor criado com sucesso:', user)

  } catch (error) {
    console.error('Erro:', error)
  }
}

createGestor()
