const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestData() {
  try {
    console.log('🚀 Iniciando criação de dados de teste...')

    // 1. Criar empresa Join Tecnologia se não existir
    console.log('📋 Verificando empresa Join Tecnologia...')
    let { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Join Tecnologia')
      .single()

    let joinCompanyId
    if (!existingCompany) {
      console.log('🏢 Criando empresa Join Tecnologia...')
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Join Tecnologia',
          description: 'Empresa de tecnologia especializada em desenvolvimento de software',
          primary_color: '#3B82F6',
          logo_url: null,
          status: 'active'
        })
        .select()
        .single()

      if (companyError) {
        console.error('❌ Erro ao criar empresa:', companyError)
        return
      }

      joinCompanyId = company.id
      console.log('✅ Empresa Join Tecnologia criada com ID:', joinCompanyId)
    } else {
      joinCompanyId = existingCompany.id
      console.log('✅ Empresa Join Tecnologia já existe com ID:', joinCompanyId)
    }

    // 2. Criar gestor para Join Tecnologia
    console.log('👤 Criando gestor para Join Tecnologia...')
    const gestorEmail = 'gestor.join.tech@jointecnologia.com.br'
    
    // Verificar se gestor já existe
    let { data: existingGestor } = await supabase
      .from('users')
      .select('id')
      .eq('email', gestorEmail)
      .single()

    if (!existingGestor) {
      // Criar usuário no Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: gestorEmail,
        password: 'gestor123',
        email_confirm: true,
        user_metadata: {
          name: 'João Silva',
          role: 'manager',
          company_id: joinCompanyId
        }
      })

      if (authError) {
        console.error('❌ Erro ao criar gestor no Auth:', authError)
        return
      }

      // Criar usuário na tabela
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          name: 'João Silva',
          email: gestorEmail,
          role: 'manager',
          company_id: joinCompanyId,
          department: 'TI',
          position: 'Gerente de TI',
          status: 'active'
        })
        .select()
        .single()

      if (userError) {
        console.error('❌ Erro ao criar gestor na tabela:', userError)
        return
      }

      console.log('✅ Gestor criado com sucesso:')
      console.log('   Email:', gestorEmail)
      console.log('   Senha: gestor123')
      console.log('   ID:', user.id)
    } else {
      console.log('✅ Gestor já existe:', gestorEmail)
    }

    // 3. Criar funcionários de teste para Join Tecnologia
    console.log('👥 Criando funcionários de teste...')
    const funcionarios = [
      {
        name: 'Maria Santos',
        email: 'maria.santos@jointecnologia.com.br',
        department: 'Desenvolvimento',
        position: 'Desenvolvedora Frontend',
        password: 'maria123'
      },
      {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@jointecnologia.com.br',
        department: 'Desenvolvimento',
        position: 'Desenvolvedor Backend',
        password: 'pedro123'
      },
      {
        name: 'Ana Costa',
        email: 'ana.costa@jointecnologia.com.br',
        department: 'Design',
        position: 'UX/UI Designer',
        password: 'ana123'
      }
    ]

    for (const funcionario of funcionarios) {
      // Verificar se já existe
      let { data: existingFunc } = await supabase
        .from('users')
        .select('id')
        .eq('email', funcionario.email)
        .single()

      if (!existingFunc) {
        // Criar usuário no Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: funcionario.email,
          password: funcionario.password,
          email_confirm: true,
          user_metadata: {
            name: funcionario.name,
            role: 'user',
            company_id: joinCompanyId
          }
        })

        if (authError) {
          console.error(`❌ Erro ao criar ${funcionario.name} no Auth:`, authError)
          continue
        }

        // Criar usuário na tabela
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            name: funcionario.name,
            email: funcionario.email,
            role: 'user',
            company_id: joinCompanyId,
            department: funcionario.department,
            position: funcionario.position,
            status: 'active'
          })
          .select()
          .single()

        if (userError) {
          console.error(`❌ Erro ao criar ${funcionario.name} na tabela:`, userError)
          continue
        }

        console.log(`✅ Funcionário criado: ${funcionario.name} (${funcionario.email})`)
      } else {
        console.log(`✅ Funcionário já existe: ${funcionario.name}`)
      }
    }

    // 4. Criar produtos de teste para Join Tecnologia
    console.log('📦 Criando produtos de teste...')
    const produtos = [
      {
        name: 'Camiseta Join Tecnologia',
        description: 'Camiseta personalizada da empresa',
        price: 25.00,
        points_cost: 100,
        category_id: null,
        company_id: joinCompanyId
      },
      {
        name: 'Caneca Join Tecnologia',
        description: 'Caneca personalizada da empresa',
        price: 15.00,
        points_cost: 60,
        category_id: null,
        company_id: joinCompanyId
      },
      {
        name: 'Mochila Join Tecnologia',
        description: 'Mochila personalizada da empresa',
        price: 45.00,
        points_cost: 180,
        category_id: null,
        company_id: joinCompanyId
      }
    ]

    for (const produto of produtos) {
      // Verificar se já existe
      let { data: existingProd } = await supabase
        .from('company_products')
        .select('id')
        .eq('name', produto.name)
        .eq('company_id', joinCompanyId)
        .single()

      if (!existingProd) {
        const { data: product, error: productError } = await supabase
          .from('company_products')
          .insert({
            ...produto,
            status: 'active'
          })
          .select()
          .single()

        if (productError) {
          console.error(`❌ Erro ao criar produto ${produto.name}:`, productError)
          continue
        }

        console.log(`✅ Produto criado: ${produto.name}`)
      } else {
        console.log(`✅ Produto já existe: ${produto.name}`)
      }
    }

    // 5. Criar pedidos de teste
    console.log('🛒 Criando pedidos de teste...')
    
    // Buscar funcionários para criar pedidos
    const { data: funcionariosData } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', joinCompanyId)
      .eq('role', 'user')
      .limit(2)

    if (funcionariosData && funcionariosData.length > 0) {
      // Buscar produtos para criar pedidos
      const { data: produtosData } = await supabase
        .from('company_products')
        .select('id, price')
        .eq('company_id', joinCompanyId)
        .limit(2)

      if (produtosData && produtosData.length > 0) {
        for (let i = 0; i < 3; i++) {
          const funcionario = funcionariosData[i % funcionariosData.length]
          const produto = produtosData[i % produtosData.length]

          // Verificar se pedido já existe
          let { data: existingOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', funcionario.id)
            .eq('status', 'pending')
            .limit(1)

          if (!existingOrder || existingOrder.length === 0) {
            const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert({
                user_id: funcionario.id,
                company_id: joinCompanyId,
                total_amount: produto.price,
                payment_method: 'points',
                status: 'pending',
                notes: 'Pedido de teste'
              })
              .select()
              .single()

            if (orderError) {
              console.error('❌ Erro ao criar pedido:', orderError)
              continue
            }

            // Criar item do pedido
            const { error: itemError } = await supabase
              .from('order_items')
              .insert({
                order_id: order.id,
                product_id: produto.id,
                quantity: 1,
                unit_price: produto.price,
                total_price: produto.price
              })

            if (itemError) {
              console.error('❌ Erro ao criar item do pedido:', itemError)
              continue
            }

            console.log(`✅ Pedido criado: ID ${order.id}`)
          }
        }
      }
    }

    console.log('🎉 Dados de teste criados com sucesso!')
    console.log('\n📋 RESUMO DOS ACESSOS:')
    console.log('👤 Gestor Join Tecnologia:')
    console.log('   Email: gestor.join.tech@jointecnologia.com.br')
    console.log('   Senha: gestor123')
    console.log('   URL: http://localhost:3001/gestor/dashboard')
    console.log('\n👥 Funcionários Join Tecnologia:')
    console.log('   Maria Santos: maria.santos@jointecnologia.com.br / maria123')
    console.log('   Pedro Oliveira: pedro.oliveira@jointecnologia.com.br / pedro123')
    console.log('   Ana Costa: ana.costa@jointecnologia.com.br / ana123')
    console.log('   URL: http://localhost:3001/store/dashboard')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestData()
