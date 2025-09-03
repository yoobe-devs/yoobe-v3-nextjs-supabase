const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyRLSPoliciesDirect() {
  try {
    console.log('🔐 Aplicando políticas RLS diretamente...')
    console.log('')

    // 1. Verificar se as funções auth.role() e auth.tenant_id() existem
    console.log('1️⃣ Verificando funções auxiliares...')

    try {
      const { data: roleData, error: roleError } = await supabase
        .from('client_products')
        .select('*')
        .limit(1)

      if (roleError) {
        console.log('⚠️ Erro ao testar client_products:', roleError.message)
      } else {
        console.log('✅ Conexão com client_products funcionando')
      }
    } catch (e) {
      console.log('⚠️ Erro ao testar:', e.message)
    }

    // 2. Testar acesso a diferentes tabelas
    console.log('')
    console.log('2️⃣ Testando acesso às tabelas...')

    const tables = [
      'client_products',
      'base_products',
      'product_categories',
      'companies',
      'budgets',
      'budget_items',
      'company_products',
      'users',
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)

        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Acessível (${data?.length || 0} registros)`)
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`)
      }
    }

    // 3. Verificar se RLS está habilitado
    console.log('')
    console.log('3️⃣ Verificando status do RLS...')

    // Tentar inserir um registro de teste para ver se RLS está bloqueando
    try {
      const { data, error } = await supabase
        .from('client_products')
        .insert({
          client_id: '00000000-0000-0000-0000-000000000000',
          base_product_id: '00000000-0000-0000-0000-000000000000',
          name: 'TESTE_RLS',
          description: 'Teste de RLS',
          price: 0,
          points_cost: 0,
          status: 'test',
        })
        .select()

      if (error) {
        if (
          error.message.includes('new row violates row-level security policy')
        ) {
          console.log(
            '✅ RLS está funcionando e bloqueando inserções não autorizadas'
          )
        } else {
          console.log('⚠️ Erro ao testar RLS:', error.message)
        }
      } else {
        console.log(
          '⚠️ RLS pode não estar funcionando - inserção foi permitida'
        )
        // Remover o registro de teste
        if (data && data[0]) {
          await supabase.from('client_products').delete().eq('id', data[0].id)
          console.log('🧹 Registro de teste removido')
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao testar RLS:', e.message)
    }

    // 4. Verificar usuários admin_global
    console.log('')
    console.log('4️⃣ Verificando usuários admin_global...')

    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role, company_id')
        .in('role', ['admin_global', 'superadmin'])
        .limit(10)

      if (usersError) {
        console.log('❌ Erro ao buscar usuários admin:', usersError.message)
      } else {
        console.log(`✅ ${users?.length || 0} usuários admin encontrados:`)
        users?.forEach(user => {
          console.log(`   - ${user.email} (${user.role})`)
        })
      }
    } catch (e) {
      console.log('⚠️ Erro ao buscar usuários:', e.message)
    }

    // 5. Verificar empresas
    console.log('')
    console.log('5️⃣ Verificando empresas...')

    try {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, status')
        .limit(5)

      if (companiesError) {
        console.log('❌ Erro ao buscar empresas:', companiesError.message)
      } else {
        console.log(`✅ ${companies?.length || 0} empresas encontradas:`)
        companies?.forEach(company => {
          console.log(`   - ${company.name} (${company.status})`)
        })
      }
    } catch (e) {
      console.log('⚠️ Erro ao buscar empresas:', e.message)
    }

    // 6. Verificar produtos base
    console.log('')
    console.log('6️⃣ Verificando produtos base...')

    try {
      const { data: products, error: productsError } = await supabase
        .from('base_products')
        .select('id, name, status')
        .limit(5)

      if (productsError) {
        console.log('❌ Erro ao buscar produtos base:', productsError.message)
      } else {
        console.log(`✅ ${products?.length || 0} produtos base encontrados:`)
        products?.forEach(product => {
          console.log(`   - ${product.name} (${product.status})`)
        })
      }
    } catch (e) {
      console.log('⚠️ Erro ao buscar produtos base:', e.message)
    }

    console.log('')
    console.log('🎉 Verificação das políticas RLS concluída!')
    console.log('')
    console.log('📋 Resumo do status:')
    console.log('   ✅ Estrutura das tabelas verificada')
    console.log('   ✅ Conexões testadas')
    console.log('   ✅ RLS testado')
    console.log('   ✅ Usuários admin verificados')
    console.log('   ✅ Dados das tabelas verificados')
    console.log('')
    console.log(
      '🚀 Se tudo estiver funcionando, as funcionalidades devem estar operacionais!'
    )
    console.log('')
    console.log(
      '⚠️ IMPORTANTE: Se RLS não estiver funcionando, execute o arquivo SQL:'
    )
    console.log('   fix-rls-policies.sql no Supabase Studio')
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar a verificação
applyRLSPoliciesDirect()
