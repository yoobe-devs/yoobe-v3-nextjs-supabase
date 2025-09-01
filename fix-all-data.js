const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function fixAllData() {
  try {
    console.log('🔧 Corrigindo todos os dados...')

    // 1. Criar usuário gestor
    console.log('\n👤 Criando usuário gestor...')
    
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'gestor.join.tech@jointecnologia.com.br')
      .single()

    if (!existingUser) {
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
    } else {
      console.log('✅ Usuário gestor já existe!')
    }

    // 2. Atualizar produtos com categorias e produtos-base
    console.log('\n📦 Atualizando produtos com categorias...')
    
    // Buscar categorias
    const { data: categories } = await supabase
      .from('product_categories')
      .select('*')

    if (categories && categories.length > 0) {
      // Buscar produtos-base
      const { data: baseProducts } = await supabase
        .from('base_products')
        .select('*')

      // Atualizar produtos existentes
      const { data: existingProducts } = await supabase
        .from('company_products')
        .select('*')

      if (existingProducts && existingProducts.length > 0) {
        for (const product of existingProducts) {
          let categoryId = null
          let baseProductId = null

          // Determinar categoria baseada no nome
          if (product.name.toLowerCase().includes('camiseta') || product.name.toLowerCase().includes('roupa')) {
            categoryId = categories.find(c => c.name === 'Vestuário')?.id
          } else if (product.name.toLowerCase().includes('caneca') || product.name.toLowerCase().includes('copo')) {
            categoryId = categories.find(c => c.name === 'Escritório')?.id
          } else if (product.name.toLowerCase().includes('power') || product.name.toLowerCase().includes('carregador')) {
            categoryId = categories.find(c => c.name === 'Tecnologia')?.id
          } else if (product.name.toLowerCase().includes('garrafa') || product.name.toLowerCase().includes('térmica')) {
            categoryId = categories.find(c => c.name === 'Bem-estar')?.id
          } else if (product.name.toLowerCase().includes('mochila') || product.name.toLowerCase().includes('bolsa')) {
            categoryId = categories.find(c => c.name === 'Escritório')?.id
          } else {
            categoryId = categories.find(c => c.name === 'Escritório')?.id // Default
          }

          // Determinar produto-base baseado no nome
          if (product.name.toLowerCase().includes('camiseta')) {
            baseProductId = baseProducts?.find(bp => bp.name.includes('Camiseta'))?.id
          } else if (product.name.toLowerCase().includes('caneca')) {
            baseProductId = baseProducts?.find(bp => bp.name.includes('Caneca'))?.id
          } else if (product.name.toLowerCase().includes('power')) {
            baseProductId = baseProducts?.find(bp => bp.name.includes('Power'))?.id
          } else if (product.name.toLowerCase().includes('garrafa')) {
            baseProductId = baseProducts?.find(bp => bp.name.includes('Garrafa'))?.id
          } else if (product.name.toLowerCase().includes('mochila')) {
            baseProductId = baseProducts?.find(bp => bp.name.includes('Mochila'))?.id
          }

          // Atualizar produto
          const { error: updateError } = await supabase
            .from('company_products')
            .update({
              category_id: categoryId,
              base_product_id: baseProductId
            })
            .eq('id', product.id)

          if (updateError) {
            console.error(`❌ Erro ao atualizar produto ${product.name}:`, updateError)
          } else {
            console.log(`✅ Produto ${product.name} atualizado`)
          }
        }
      }
    }

    // 3. Verificar e corrigir lojas
    console.log('\n🏪 Verificando lojas...')
    
    const { data: stores } = await supabase
      .from('stores')
      .select('*')

    if (!stores || stores.length === 0) {
      console.log('❌ Nenhuma loja encontrada, criando lojas...')
      
      const { data: companies } = await supabase
        .from('companies')
        .select('*')

      if (companies && companies.length > 0) {
        for (const company of companies) {
          if (company.name !== 'Yoobe') { // Não criar loja para Yoobe
            const { error: storeError } = await supabase
              .from('stores')
              .insert({
                name: `${company.name} Store`,
                company_id: company.id,
                address: company.address || 'Endereço não informado',
                city: company.city || 'Cidade não informada',
                state: company.state || 'Estado não informado',
                status: 'active'
              })

            if (storeError) {
              console.error(`❌ Erro ao criar loja para ${company.name}:`, storeError)
            } else {
              console.log(`✅ Loja criada para ${company.name}`)
            }
          }
        }
      }
    } else {
      console.log(`✅ ${stores.length} lojas encontradas`)
    }

    // 4. Verificar dados do gestor
    console.log('\n👤 Verificando dados do gestor...')
    
    const { data: gestorData } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name,
          email
        )
      `)
      .eq('email', 'gestor.join.tech@jointecnologia.com.br')
      .single()

    if (gestorData) {
      console.log('✅ Dados do gestor:')
      console.log(`   Nome: ${gestorData.full_name}`)
      console.log(`   Role: ${gestorData.role}`)
      console.log(`   Empresa: ${gestorData.companies?.name || 'N/A'}`)
      console.log(`   Pontos: ${gestorData.points_balance}`)
    }

    // 5. Verificar produtos da empresa do gestor
    console.log('\n📦 Verificando produtos da empresa do gestor...')
    
    if (gestorData?.company_id) {
      const { data: companyProducts } = await supabase
        .from('company_products')
        .select(`
          *,
          product_categories (
            id,
            name,
            description,
            icon,
            color
          ),
          base_products (
            id,
            name,
            description,
            base_price,
            base_points_cost
          )
        `)
        .eq('company_id', gestorData.company_id)

      if (companyProducts && companyProducts.length > 0) {
        console.log(`✅ ${companyProducts.length} produtos encontrados para a empresa do gestor`)
        companyProducts.forEach(product => {
          console.log(`   - ${product.name} (${product.product_categories?.name || 'Sem categoria'})`)
        })
      } else {
        console.log('⚠️ Nenhum produto encontrado para a empresa do gestor')
      }
    }

    console.log('\n🎉 Correção de dados concluída!')
    console.log('\n📋 Resumo:')
    console.log('✅ Usuário gestor criado/verificado')
    console.log('✅ Produtos atualizados com categorias')
    console.log('✅ Lojas verificadas/criadas')
    console.log('✅ Dados do gestor verificados')

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

fixAllData()
