const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  try {
    console.log('🚀 Criando usuário admin...')

    const adminEmail = 'admin@yoobe.com'
    
    // Verificar se admin já existe
    let { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (!existingAdmin) {
      // Criar usuário no Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
          name: 'Administrador',
          role: 'admin'
        }
      })

      if (authError) {
        console.error('❌ Erro ao criar admin no Auth:', authError)
        return
      }

      // Criar usuário na tabela
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          name: 'Administrador',
          email: adminEmail,
          role: 'admin',
          company_id: null,
          department: 'Administração',
          position: 'Administrador do Sistema',
          status: 'active'
        })
        .select()
        .single()

      if (userError) {
        console.error('❌ Erro ao criar admin na tabela:', userError)
        return
      }

      console.log('✅ Admin criado com sucesso:')
      console.log('   Email:', adminEmail)
      console.log('   Senha: admin123')
      console.log('   ID:', user.id)
    } else {
      console.log('✅ Admin já existe:', adminEmail)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createAdminUser()
