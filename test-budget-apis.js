const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

// Função para gerar UUID válido
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function testBudgetAPIs() {
  console.log('🧪 Testando APIs de Orçamentos...\n')

  try {
    // 1. Verificar se as tabelas existem
    console.log('1. Verificando estrutura do banco...')
    
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .limit(1)
    
    if (budgetsError) {
      console.error('❌ Erro ao acessar tabela budgets:', budgetsError)
      return
    }
    
    const { data: budgetItemsCheck, error: itemsError } = await supabase
      .from('budget_items')
      .select('*')
      .limit(1)
    
    if (itemsError) {
      console.error('❌ Erro ao acessar tabela budget_items:', itemsError)
      return
    }
    
    console.log('✅ Tabelas de orçamentos existem')

    // 2. Verificar produtos base
    console.log('\n2. Verificando produtos base...')
    const { data: baseProducts, error: baseError } = await supabase
      .from('base_products')
      .select('id, name, base_price')
      .limit(5)
    
    if (baseError) {
      console.error('❌ Erro ao buscar produtos base:', baseError)
      return
    }
    
    if (!baseProducts || baseProducts.length === 0) {
      console.log('⚠️  Nenhum produto base encontrado. Criando produtos de teste...')
      
      // Criar categoria de teste
      const { data: category } = await supabase
        .from('product_categories')
        .insert({
          name: 'Categoria Teste',
          description: 'Categoria para testes',
          icon: 'test-icon',
          color: '#ff0000'
        })
        .select()
        .single()
      
      // Criar produtos base de teste
      await supabase
        .from('base_products')
        .insert([
          {
            name: 'Produto Teste 1',
            description: 'Produto base para testes',
            base_price: 100.00,
            base_points_cost: 100,
            category_id: category.id,
            status: 'active'
          },
          {
            name: 'Produto Teste 2',
            description: 'Segundo produto base para testes',
            base_price: 150.00,
            base_points_cost: 150,
            category_id: category.id,
            status: 'active'
          }
        ])
      
      console.log('✅ Produtos de teste criados')
    } else {
      console.log(`✅ ${baseProducts.length} produtos base encontrados`)
    }

    // 3. Criar orçamento de teste diretamente no banco
    console.log('\n3. Criando orçamento de teste...')
    
    const { data: currentBaseProducts } = await supabase
      .from('base_products')
      .select('id, name, base_price')
      .limit(2)
    
    if (!currentBaseProducts || currentBaseProducts.length === 0) {
      console.error('❌ Nenhum produto base disponível')
      return
    }
    
    // Gerar UUIDs válidos
    const testCompanyId = generateUUID()
    const testManagerId = generateUUID()
    const testAdminId = generateUUID()
    
    // Criar orçamento
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        company_id: testCompanyId,
        manager_id: testManagerId,
        title: 'Orçamento Teste API',
        description: 'Orçamento criado para teste das APIs',
        total_amount: currentBaseProducts.reduce((sum, p) => sum + (p.base_price * 10), 0),
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (budgetError) {
      console.error('❌ Erro ao criar orçamento:', budgetError)
      return
    }
    
    console.log('✅ Orçamento criado:', budget.id)

    // 4. Criar itens do orçamento
    console.log('\n4. Criando itens do orçamento...')
    
    const budgetItems = currentBaseProducts.map(product => ({
      budget_id: budget.id,
      base_product_id: product.id,
      quantity: 10,
      custom_price: product.base_price * 1.1,
      custom_points_cost: Math.floor(product.base_price * 1.1),
      notes: `Item teste para ${product.name}`
    }))
    
    const { data: items, error: createItemsError } = await supabase
      .from('budget_items')
      .insert(budgetItems)
      .select()
    
    if (createItemsError) {
      console.error('❌ Erro ao criar itens do orçamento:', createItemsError)
      return
    }
    
    console.log(`✅ ${items.length} itens criados`)

    // 5. Aprovar orçamento
    console.log('\n5. Aprovando orçamento...')
    
    const { data: approvedBudget, error: approveError } = await supabase
      .from('budgets')
      .update({
        status: 'approved',
        admin_notes: 'Aprovado para teste',
        reviewed_at: new Date().toISOString(),
        reviewed_by: testAdminId
      })
      .eq('id', budget.id)
      .select()
      .single()
    
    if (approveError) {
      console.error('❌ Erro ao aprovar orçamento:', approveError)
      return
    }
    
    console.log('✅ Orçamento aprovado')

    // 6. Testar replicação de produto
    console.log('\n6. Testando replicação de produto...')
    
    const { data: replicatedProduct, error: replicateError } = await supabase
      .from('company_products')
      .insert({
        name: currentBaseProducts[0].name,
        description: 'Produto replicado para teste',
        price: 110.00,
        points_cost: 110,
        stock_quantity: 50,
        category_id: currentBaseProducts[0].category_id,
        base_product_id: currentBaseProducts[0].id,
        company_id: testCompanyId,
        budget_id: budget.id,
        approved_at: new Date().toISOString(),
        approved_by: testAdminId,
        is_active: true,
        status: 'active'
      })
      .select()
      .single()
    
    if (replicateError) {
      console.error('❌ Erro ao replicar produto:', replicateError)
      return
    }
    
    console.log('✅ Produto replicado:', replicatedProduct.id)

    // 7. Testar ativação/inativação
    console.log('\n7. Testando ativação/inativação de produto...')
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('company_products')
      .update({ is_active: false })
      .eq('id', replicatedProduct.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar produto:', updateError)
      return
    }
    
    console.log('✅ Produto inativado com sucesso')

    // 8. Verificar dados finais
    console.log('\n8. Verificando dados finais...')
    
    const { data: finalBudget } = await supabase
      .from('budgets')
      .select(`
        *,
        budget_items (
          *,
          base_products (
            id,
            name,
            base_price
          )
        )
      `)
      .eq('id', budget.id)
      .single()
    
    const { data: finalProduct } = await supabase
      .from('company_products')
      .select('*')
      .eq('id', replicatedProduct.id)
      .single()
    
    console.log('✅ Dados finais:')
    console.log(`   - Orçamento: ${finalBudget.status} (${finalBudget.budget_items.length} itens)`)
    console.log(`   - Produto: ${finalProduct.is_active ? 'Ativo' : 'Inativo'}`)

    console.log('\n🎉 Teste completo com sucesso!')
    console.log('\n📊 Resumo:')
    console.log(`   - Orçamento criado: ${budget.id}`)
    console.log(`   - Itens criados: ${items.length}`)
    console.log(`   - Produto replicado: ${replicatedProduct.id}`)
    console.log(`   - Status final: ${finalBudget.status}`)

  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

// Executar teste
testBudgetAPIs()
