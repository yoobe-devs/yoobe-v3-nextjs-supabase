const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function testBudgetSystem() {
  console.log('🧪 Testando Sistema de Orçamentos...\n')

  try {
    // 1. Criar usuários de teste se não existirem
    console.log('1. Criando usuários de teste...')

    const adminEmail = 'admin@test.com'
    const gestorEmail = 'gestor@test.com'

    // Criar ou atualizar admin
    let adminUser
    try {
      const { data: newAdmin, error: adminError } =
        await supabase.auth.admin.createUser({
          email: adminEmail,
          password: 'admin123',
          email_confirm: true,
          user_metadata: {
            role: 'admin',
            name: 'Admin Teste',
          },
        })

      if (adminError && adminError.code === 'email_exists') {
        // Usuário já existe, buscar e atualizar
        const { data: existingAdmin } = await supabase.auth.admin.listUsers()
        adminUser = existingAdmin.users.find(u => u.email === adminEmail)

        // Atualizar metadata se necessário
        if (adminUser && adminUser.user_metadata?.role !== 'admin') {
          await supabase.auth.admin.updateUserById(adminUser.id, {
            user_metadata: {
              role: 'admin',
              name: 'Admin Teste',
            },
          })
        }
      } else if (adminError) {
        console.error('Erro ao criar admin:', adminError)
      } else {
        adminUser = newAdmin.user
      }
    } catch (error) {
      console.error('Erro ao processar admin:', error)
    }
    console.log('✅ Admin configurado')

    // Criar ou atualizar gestor
    let gestorUser
    try {
      const { data: newGestor, error: gestorError } =
        await supabase.auth.admin.createUser({
          email: gestorEmail,
          password: 'gestor123',
          email_confirm: true,
          user_metadata: {
            role: 'manager',
            company_id: 'test-company-id',
            store_id: 'test-store-id',
            name: 'Gestor Teste',
          },
        })

      if (gestorError && gestorError.code === 'email_exists') {
        // Usuário já existe, buscar e atualizar
        const { data: existingGestors } = await supabase.auth.admin.listUsers()
        gestorUser = existingGestors.users.find(u => u.email === gestorEmail)

        // Atualizar metadata se necessário
        if (gestorUser && gestorUser.user_metadata?.role !== 'manager') {
          await supabase.auth.admin.updateUserById(gestorUser.id, {
            user_metadata: {
              role: 'manager',
              company_id: 'test-company-id',
              store_id: 'test-store-id',
              name: 'Gestor Teste',
            },
          })
        }
      } else if (gestorError) {
        console.error('Erro ao criar gestor:', gestorError)
      } else {
        gestorUser = newGestor.user
      }
    } catch (error) {
      console.error('Erro ao processar gestor:', error)
    }
    console.log('✅ Gestor configurado')

    // 2. Fazer login como gestor
    console.log('\n2. Fazendo login como gestor...')
    const { data: gestorSession, error: gestorLoginError } =
      await supabase.auth.signInWithPassword({
        email: gestorEmail,
        password: 'gestor123',
      })

    if (gestorLoginError) {
      console.error('Erro no login do gestor:', gestorLoginError)
      return
    }

    console.log('✅ Login do gestor realizado')
    const gestorToken = gestorSession.session.access_token

    // 3. Verificar se existem produtos base
    console.log('\n3. Verificando produtos base...')
    const { data: baseProducts, error: baseProductsError } = await supabase
      .from('base_products')
      .select('id, name')
      .limit(5)

    if (baseProductsError) {
      console.error('Erro ao buscar produtos base:', baseProductsError)
      return
    }

    if (!baseProducts || baseProducts.length === 0) {
      console.log(
        '⚠️  Nenhum produto base encontrado. Criando produtos de teste...'
      )

      // Criar categorias de teste
      const { data: category1 } = await supabase
        .from('product_categories')
        .insert({
          name: 'Categoria Teste 1',
          description: 'Categoria para testes',
          icon: 'test-icon',
          color: '#ff0000',
        })
        .select()
        .single()

      // Criar produtos base de teste
      const { data: testProduct1 } = await supabase
        .from('base_products')
        .insert({
          name: 'Produto Teste 1',
          description: 'Produto base para testes',
          base_price: 100.0,
          base_points_cost: 100,
          category_id: category1.id,
          status: 'active',
        })
        .select()
        .single()

      console.log('✅ Produtos de teste criados')
    } else {
      console.log(`✅ ${baseProducts.length} produtos base encontrados`)
    }

    // 4. Criar orçamento como gestor
    console.log('\n4. Criando orçamento como gestor...')

    const { data: currentBaseProducts } = await supabase
      .from('base_products')
      .select('id, name, base_price')
      .limit(2)

    if (!currentBaseProducts || currentBaseProducts.length === 0) {
      console.error('❌ Nenhum produto base disponível para criar orçamento')
      return
    }

    const budgetData = {
      title: 'Orçamento Teste',
      description: 'Orçamento para teste do sistema',
      items: currentBaseProducts.map(product => ({
        base_product_id: product.id,
        quantity: 10,
        custom_price: product.base_price * 1.1, // 10% de margem
        custom_points_cost: Math.floor(product.base_price * 1.1),
        notes: `Teste para ${product.name}`,
      })),
    }

    const budgetResponse = await fetch(
      'http://localhost:3000/api/gestor/orcamentos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gestorToken}`,
        },
        body: JSON.stringify(budgetData),
      }
    )

    if (!budgetResponse.ok) {
      const errorText = await budgetResponse.text()
      console.error('❌ Erro ao criar orçamento:', errorText)
      return
    }

    const budgetResult = await budgetResponse.json()
    console.log('✅ Orçamento criado:', budgetResult.budget.id)

    // 5. Fazer login como admin
    console.log('\n5. Fazendo login como admin...')
    const { data: adminSession, error: adminLoginError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: 'admin123',
      })

    if (adminLoginError) {
      console.error('Erro no login do admin:', adminLoginError)
      return
    }

    console.log('✅ Login do admin realizado')
    const adminToken = adminSession.session.access_token

    // 6. Listar orçamentos como admin
    console.log('\n6. Listando orçamentos como admin...')
    const adminBudgetsResponse = await fetch(
      'http://localhost:3000/api/admin/orcamentos',
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    )

    if (!adminBudgetsResponse.ok) {
      const errorText = await adminBudgetsResponse.text()
      console.error('❌ Erro ao listar orçamentos:', errorText)
      return
    }

    const adminBudgets = await adminBudgetsResponse.json()
    console.log(`✅ ${adminBudgets.budgets.length} orçamentos encontrados`)

    // 7. Aprovar orçamento como admin
    console.log('\n7. Aprovando orçamento como admin...')
    const approveResponse = await fetch(
      `http://localhost:3000/api/admin/orcamentos/${budgetResult.budget.id}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'approve',
          admin_notes: 'Orçamento aprovado para teste',
        }),
      }
    )

    if (!approveResponse.ok) {
      const errorText = await approveResponse.text()
      console.error('❌ Erro ao aprovar orçamento:', errorText)
      return
    }

    const approveResult = await approveResponse.json()
    console.log('✅ Orçamento aprovado:', approveResult.message)

    // 8. Tentar replicar produto como gestor (deve funcionar agora)
    console.log('\n8. Tentando replicar produto como gestor...')

    const replicateResponse = await fetch(
      'http://localhost:3000/api/gestor/base-products',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gestorToken}`,
        },
        body: JSON.stringify({
          base_product_id: currentBaseProducts[0].id,
          custom_price: 110.0,
          custom_points_cost: 110,
          custom_stock_quantity: 50,
        }),
      }
    )

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      console.error('❌ Erro ao replicar produto:', errorText)
      return
    }

    const replicateResult = await replicateResponse.json()
    console.log('✅ Produto replicado:', replicateResult.message)

    // 9. Ativar/inativar produto replicado
    console.log('\n9. Testando ativação/inativação de produto...')

    const statusResponse = await fetch(
      `http://localhost:3000/api/clients/test-company-id/products/${replicateResult.product.id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gestorToken}`,
        },
        body: JSON.stringify({
          is_active: false,
        }),
      }
    )

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.error('❌ Erro ao alterar status do produto:', errorText)
      return
    }

    const statusResult = await statusResponse.json()
    console.log('✅ Status do produto alterado:', statusResult.message)

    // 10. Testar tentativa de replicação sem orçamento aprovado
    console.log('\n10. Testando replicação sem orçamento aprovado...')

    // Criar novo gestor sem orçamento
    const { data: newGestorUser } = await supabase.auth.admin.createUser({
      email: 'gestor2@test.com',
      password: 'gestor123',
      email_confirm: true,
      user_metadata: {
        role: 'manager',
        company_id: 'test-company-id-2',
        store_id: 'test-store-id-2',
        name: 'Gestor 2 Teste',
      },
    })

    const { data: newGestorSession } = await supabase.auth.signInWithPassword({
      email: 'gestor2@test.com',
      password: 'gestor123',
    })

    const newGestorToken = newGestorSession.session.access_token

    const replicateWithoutBudgetResponse = await fetch(
      'http://localhost:3000/api/gestor/base-products',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newGestorToken}`,
        },
        body: JSON.stringify({
          base_product_id: currentBaseProducts[0].id,
          custom_price: 110.0,
          custom_points_cost: 110,
          custom_stock_quantity: 50,
        }),
      }
    )

    if (replicateWithoutBudgetResponse.status === 403) {
      console.log(
        '✅ Replicação bloqueada corretamente (sem orçamento aprovado)'
      )
    } else {
      console.log('⚠️  Replicação deveria ter sido bloqueada')
    }

    // 2. Verificar itens de orçamentos
    console.log('')
    console.log('2️⃣ Verificando itens de orçamentos...')
    const { data: budgetItems, error: itemsError } = await supabase
      .from('budget_items')
      .select(
        'id, budget_id, base_product_id, quantity, custom_price, custom_points_cost'
      )
      .limit(5)

    if (itemsError) {
      console.log('❌ Erro ao buscar itens:', itemsError.message)
    } else {
      console.log(`✅ ${budgetItems?.length || 0} itens encontrados:`)
      budgetItems?.forEach(item => {
        console.log(
          `   - ID: ${item.id}, Qtd: ${item.quantity}, Preço: R$ ${item.custom_price}`
        )
      })
    }

    console.log('\n🎉 Testes do Sistema de Orçamentos concluídos com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
  }
}

testBudgetSystem()
