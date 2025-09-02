const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUsers() {
  try {
    console.log('👥 Criando usuários de teste...')
    console.log('')

    // 1. Criar admin
    console.log('1️⃣ Criando usuário admin...')
    const { data: { user: adminUser }, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@yoobe.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Administrador Global'
      }
    })

    if (adminError) {
      console.log(`⚠️ Admin já existe ou erro: ${adminError.message}`)
    } else {
      console.log('✅ Admin criado com sucesso')
      console.log(`👤 Email: ${adminUser.email}`)
      console.log(`🔑 ID: ${adminUser.id}`)
    }
    console.log('')

    // 2. Criar gestor
    console.log('2️⃣ Criando usuário gestor...')
    const { data: { user: gestorUser }, error: gestorError } = await supabase.auth.admin.createUser({
      email: 'gestor@empresa1.com',
      password: 'gestor123',
      email_confirm: true,
      user_metadata: {
        role: 'manager',
        name: 'Gestor Empresa 1',
        company_id: 'test-company-id',
        store_id: 'test-store-id'
      }
    })

    if (gestorError) {
      console.log(`⚠️ Gestor já existe ou erro: ${gestorError.message}`)
    } else {
      console.log('✅ Gestor criado com sucesso')
      console.log(`👤 Email: ${gestorUser.email}`)
      console.log(`🔑 ID: ${gestorUser.id}`)
      console.log(`🏢 Company ID: ${gestorUser.user_metadata?.company_id}`)
    }
    console.log('')

    // 3. Criar funcionário
    console.log('3️⃣ Criando usuário funcionário...')
    const { data: { user: employeeUser }, error: employeeError } = await supabase.auth.admin.createUser({
      email: 'funcionario@empresa1.com',
      password: 'funcionario123',
      email_confirm: true,
      user_metadata: {
        role: 'employee',
        name: 'Funcionário Empresa 1',
        company_id: 'test-company-id',
        store_id: 'test-store-id'
      }
    })

    if (employeeError) {
      console.log(`⚠️ Funcionário já existe ou erro: ${employeeError.message}`)
    } else {
      console.log('✅ Funcionário criado com sucesso')
      console.log(`👤 Email: ${employeeUser.email}`)
      console.log(`🔑 ID: ${employeeUser.id}`)
      console.log(`🏢 Company ID: ${employeeUser.user_metadata?.company_id}`)
    }
    console.log('')

    // 4. Testar login dos usuários
    console.log('4️⃣ Testando login dos usuários...')
    
    // Testar admin
    const { data: { user: testAdmin }, error: testAdminError } = await supabase.auth.signInWithPassword({
      email: 'admin@yoobe.com',
      password: 'admin123'
    })

    if (testAdminError) {
      console.log(`❌ Erro no login do admin: ${testAdminError.message}`)
    } else {
      console.log('✅ Login do admin funcionando')
      console.log(`👤 Admin logado: ${testAdmin.email}`)
      console.log(`🔑 Role: ${testAdmin.user_metadata?.role}`)
    }

    // Testar gestor
    const { data: { user: testGestor }, error: testGestorError } = await supabase.auth.signInWithPassword({
      email: 'gestor@empresa1.com',
      password: 'gestor123'
    })

    if (testGestorError) {
      console.log(`❌ Erro no login do gestor: ${testGestorError.message}`)
    } else {
      console.log('✅ Login do gestor funcionando')
      console.log(`👤 Gestor logado: ${testGestor.email}`)
      console.log(`🔑 Role: ${testGestor.user_metadata?.role}`)
      console.log(`🏢 Company ID: ${testGestor.user_metadata?.company_id}`)
    }

    // Testar funcionário
    const { data: { user: testEmployee }, error: testEmployeeError } = await supabase.auth.signInWithPassword({
      email: 'funcionario@empresa1.com',
      password: 'funcionario123'
    })

    if (testEmployeeError) {
      console.log(`❌ Erro no login do funcionário: ${testEmployeeError.message}`)
    } else {
      console.log('✅ Login do funcionário funcionando')
      console.log(`👤 Funcionário logado: ${testEmployee.email}`)
      console.log(`🔑 Role: ${testEmployee.user_metadata?.role}`)
      console.log(`🏢 Company ID: ${testEmployee.user_metadata?.company_id}`)
    }
    console.log('')

    console.log('🎉 Usuários de teste criados e testados!')
    console.log('')
    console.log('📋 Credenciais de teste:')
    console.log('👑 Admin: admin@yoobe.com / admin123')
    console.log('👨‍💼 Gestor: gestor@empresa1.com / gestor123')
    console.log('👷 Funcionário: funcionario@empresa1.com / funcionario123')
    console.log('')
    console.log('🚀 Sistema pronto para uso!')

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error)
    process.exit(1)
  }
}

createTestUsers()
