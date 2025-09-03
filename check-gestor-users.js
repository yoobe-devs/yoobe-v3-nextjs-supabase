const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGestorUsers() {
  try {
    console.log('🔍 Verificando usuários gestores...')
    console.log('')

    // 1. Verificar usuários na tabela users
    console.log('1️⃣ Verificando tabela users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, company_id, created_at')
      .limit(20)

    if (usersError) {
      console.log('❌ Erro ao buscar usuários:', usersError.message)
    } else {
      console.log(`✅ ${users?.length || 0} usuários encontrados:`)
      users?.forEach(user => {
        console.log(
          `   - ${user.email} (${user.role}) - Company: ${user.company_id || 'N/A'}`
        )
      })
    }

    // 2. Verificar usuários na tabela auth.users
    console.log('')
    console.log('2️⃣ Verificando auth.users...')
    try {
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers()

      if (authError) {
        console.log('❌ Erro ao buscar auth.users:', authError.message)
      } else {
        console.log(
          `✅ ${authUsers?.users?.length || 0} usuários auth encontrados:`
        )
        authUsers?.users?.forEach(user => {
          const role = user.user_metadata?.role || 'N/A'
          const companyId = user.user_metadata?.company_id || 'N/A'
          console.log(`   - ${user.email} (${role}) - Company: ${companyId}`)
        })
      }
    } catch (e) {
      console.log('⚠️ Erro ao acessar auth.users:', e.message)
    }

    // 3. Verificar produtos replicados existentes
    console.log('')
    console.log('3️⃣ Verificando produtos replicados...')
    const { data: clientProducts, error: productsError } = await supabase
      .from('client_products')
      .select('id, name, client_id, status, created_at')
      .limit(10)

    if (productsError) {
      console.log(
        '❌ Erro ao buscar produtos replicados:',
        productsError.message
      )
    } else {
      console.log(
        `✅ ${clientProducts?.length || 0} produtos replicados encontrados:`
      )
      clientProducts?.forEach(product => {
        console.log(
          `   - ${product.name} (${product.status}) - Client: ${product.client_id}`
        )
      })
    }

    // 4. Verificar empresas disponíveis
    console.log('')
    console.log('4️⃣ Verificando empresas...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, status')
      .limit(10)

    if (companiesError) {
      console.log('❌ Erro ao buscar empresas:', companiesError.message)
    } else {
      console.log(`✅ ${companies?.length || 0} empresas encontradas:`)
      companies?.forEach(company => {
        console.log(
          `   - ${company.name} (${company.status}) - ID: ${company.id}`
        )
      })
    }

    // 5. Criar um usuário gestor de teste se não existir
    console.log('')
    console.log('5️⃣ Criando usuário gestor de teste...')

    const testGestorEmail = 'gestor@teste.com'
    const testCompanyId = '550e8400-e29b-41d4-a716-446655440001' // Yoobeco

    try {
      // Verificar se já existe
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const gestorExists = existingUser?.users?.find(
        u => u.email === testGestorEmail
      )

      if (gestorExists) {
        console.log('✅ Usuário gestor de teste já existe')

        // Atualizar metadata se necessário
        if (gestorExists.user_metadata?.company_id !== testCompanyId) {
          const { error: updateError } =
            await supabase.auth.admin.updateUserById(gestorExists.id, {
              user_metadata: {
                ...gestorExists.user_metadata,
                role: 'manager',
                company_id: testCompanyId,
                name: 'Gestor Teste',
              },
            })

          if (updateError) {
            console.log('❌ Erro ao atualizar gestor:', updateError.message)
          } else {
            console.log('✅ Gestor atualizado com company_id correto')
          }
        }
      } else {
        // Criar novo gestor
        const { data: newGestor, error: createError } =
          await supabase.auth.admin.createUser({
            email: testGestorEmail,
            password: 'gestor123',
            email_confirm: true,
            user_metadata: {
              role: 'manager',
              company_id: testCompanyId,
              name: 'Gestor Teste',
            },
          })

        if (createError) {
          console.log('❌ Erro ao criar gestor:', createError.message)
        } else {
          console.log('✅ Gestor de teste criado:', newGestor.user.email)
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao processar gestor:', e.message)
    }

    // 6. Verificar se há produtos replicados para a empresa de teste
    console.log('')
    console.log('6️⃣ Verificando produtos para empresa de teste...')
    const { data: testProducts, error: testError } = await supabase
      .from('client_products')
      .select('id, name, status, created_at')
      .eq('client_id', testCompanyId)
      .limit(5)

    if (testError) {
      console.log('❌ Erro ao buscar produtos de teste:', testError.message)
    } else {
      console.log(
        `✅ ${testProducts?.length || 0} produtos para empresa de teste:`
      )
      testProducts?.forEach(product => {
        console.log(`   - ${product.name} (${product.status})`)
      })

      if (!testProducts || testProducts.length === 0) {
        console.log('⚠️ Nenhum produto replicado para a empresa de teste')
        console.log('   Isso explica por que a página está vazia!')
      }
    }

    console.log('')
    console.log('🎉 Verificação de usuários gestores concluída!')
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar a verificação
checkGestorUsers()
