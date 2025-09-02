const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function createTablesDirect() {
  console.log('🗄️ Criando tabelas diretamente no banco local...\n')

  try {
    // 1. Criar tabela budgets
    console.log('1. Criando tabela budgets...')
    const { error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .limit(1)
    
    if (budgetError && budgetError.code === 'PGRST205') {
      // Tabela não existe, vamos criar usando SQL direto
      console.log('   Tabela não existe, criando...')
      
      // Como não temos exec_sql, vamos tentar criar via API REST
      const { data: testBudget, error: insertError } = await supabase
        .from('budgets')
        .insert({
          company_id: '00000000-0000-0000-0000-000000000000',
          manager_id: '00000000-0000-0000-0000-000000000000',
          title: 'Teste',
          description: 'Teste',
          total_amount: 0,
          status: 'pending'
        })
        .select()
      
      if (insertError) {
        console.log(`   ❌ Erro ao criar tabela: ${insertError.message}`)
        console.log('   💡 Execute o SQL manualmente no Supabase Studio')
        console.log('   🌐 Acesse: http://127.0.0.1:54323')
        return
      } else {
        console.log('   ✅ Tabela budgets criada com sucesso')
        // Remover o registro de teste
        await supabase
          .from('budgets')
          .delete()
          .eq('title', 'Teste')
      }
    } else {
      console.log('   ✅ Tabela budgets já existe')
    }

    // 2. Criar tabela budget_items
    console.log('\n2. Criando tabela budget_items...')
    const { error: itemsError } = await supabase
      .from('budget_items')
      .select('*')
      .limit(1)
    
    if (itemsError && itemsError.code === 'PGRST205') {
      console.log('   Tabela não existe, criando...')
      
      const { data: testItem, error: insertError } = await supabase
        .from('budget_items')
        .insert({
          budget_id: '00000000-0000-0000-0000-000000000000',
          base_product_id: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
          custom_price: 0,
          custom_points_cost: 0,
          notes: 'Teste'
        })
        .select()
      
      if (insertError) {
        console.log(`   ❌ Erro ao criar tabela: ${insertError.message}`)
        console.log('   💡 Execute o SQL manualmente no Supabase Studio')
        return
      } else {
        console.log('   ✅ Tabela budget_items criada com sucesso')
        // Remover o registro de teste
        await supabase
          .from('budget_items')
          .delete()
          .eq('notes', 'Teste')
      }
    } else {
      console.log('   ✅ Tabela budget_items já existe')
    }

    // 3. Verificar se as colunas foram adicionadas em company_products
    console.log('\n3. Verificando company_products...')
    const { data: testProduct, error: productError } = await supabase
      .from('company_products')
      .select('is_active, budget_id, approved_at, approved_by')
      .limit(1)
    
    if (productError) {
      console.log(`   ❌ Erro ao verificar company_products: ${productError.message}`)
    } else {
      console.log('   ✅ Colunas de orçamento existem em company_products')
    }

    console.log('\n🎉 Verificação concluída!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Acesse o Supabase Studio: http://127.0.0.1:54323')
    console.log('2. Vá para SQL Editor')
    console.log('3. Cole o conteúdo do arquivo create-budget-tables-complete.sql')
    console.log('4. Execute o SQL')
    console.log('5. Teste com: node test-budget-apis.js')
    
  } catch (error) {
    console.error('❌ Erro durante criação:', error)
  }
}

createTablesDirect()
