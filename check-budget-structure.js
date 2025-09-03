const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBudgetStructure() {
  try {
    console.log('🔍 Verificando estrutura das tabelas de orçamentos...')
    console.log('')

    // 1. Verificar estrutura da tabela budgets
    console.log('1️⃣ Verificando tabela budgets...')
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .limit(1)

      if (error) {
        console.log('❌ Erro ao selecionar budgets:', error.message)
      } else {
        console.log('✅ Seleção de budgets funcionou')
        if (data && data.length > 0) {
          console.log('   Campos disponíveis:', Object.keys(data[0]))
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao selecionar budgets:', e.message)
    }

    // 2. Verificar estrutura da tabela budget_items
    console.log('')
    console.log('2️⃣ Verificando tabela budget_items...')
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .limit(1)

      if (error) {
        console.log('❌ Erro ao selecionar budget_items:', error.message)
      } else {
        console.log('✅ Seleção de budget_items funcionou')
        if (data && data.length > 0) {
          console.log('   Campos disponíveis:', Object.keys(data[0]))
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao selecionar budget_items:', e.message)
    }

    // 3. Testar inserção em budgets com campos corretos
    console.log('')
    console.log('3️⃣ Testando inserção em budgets...')

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          company_id: '550e8400-e29b-41d4-a716-446655440001',
          total_amount: 100,
          status: 'pending',
        })
        .select()

      if (error) {
        console.log('❌ Erro na inserção de budget:', error.message)
      } else {
        console.log('✅ Inserção de budget funcionou')
        // Remover o registro de teste
        if (data && data[0]) {
          await supabase.from('budgets').delete().eq('id', data[0].id)
          console.log('🧹 Budget de teste removido')
        }
      }
    } catch (e) {
      console.log('⚠️ Erro na inserção de budget:', e.message)
    }

    // 4. Testar inserção em budget_items com campos corretos
    console.log('')
    console.log('4️⃣ Testando inserção em budget_items...')

    try {
      // Primeiro criar um budget para referência
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          company_id: '550e8400-e29b-41d4-a716-446655440001',
          total_amount: 100,
          status: 'pending',
        })
        .select()
        .single()

      if (budgetError) {
        console.log('❌ Erro ao criar budget para teste:', budgetError.message)
        return
      }

      // Agora tentar inserir item
      const { data: item, error: itemError } = await supabase
        .from('budget_items')
        .insert({
          budget_id: budget.id,
          quantity: 2,
          unit_price: 50,
          total_price: 100,
        })
        .select()

      if (itemError) {
        console.log('❌ Erro na inserção de item:', itemError.message)
      } else {
        console.log('✅ Inserção de item funcionou')
      }

      // Limpar dados de teste
      await supabase.from('budget_items').delete().eq('budget_id', budget.id)
      await supabase.from('budgets').delete().eq('id', budget.id)
      console.log('🧹 Dados de teste removidos')
    } catch (e) {
      console.log('⚠️ Erro na inserção de item:', e.message)
    }

    console.log('')
    console.log('🎉 Verificação da estrutura concluída!')
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar a verificação
checkBudgetStructure()
