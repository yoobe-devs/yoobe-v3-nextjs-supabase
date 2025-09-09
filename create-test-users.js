const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const testUsers = [
  {
    email: 'admin@yoobe.com',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
  },
  {
    email: 'gestor@yoobe.com',
    password: 'gestor123',
    role: 'manager',
    name: 'Gestor',
  },
  {
    email: 'funcionario@yoobe.com',
    password: 'funcionario123',
    role: 'user',
    name: 'Funcionário',
  },
]

async function createTestUsers() {
  console.log('Criando usuários de teste...')

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          role: user.role,
          name: user.name,
        },
        email_confirm: true,
      })

      if (error) {
        console.error(`Erro ao criar usuário ${user.email}:`, error.message)
      } else {
        console.log(`✅ Usuário criado: ${user.email} (${user.role})`)
      }
    } catch (err) {
      console.error(`Erro ao criar usuário ${user.email}:`, err.message)
    }
  }

  console.log('Processo concluído!')
}

createTestUsers()







