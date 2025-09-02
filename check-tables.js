const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function checkTables() {
  console.log('🔍 Verificando tabelas no banco...\n')

  try {
    // Verificar tabelas usando SQL direto
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('budgets', 'budget_items', 'company_products', 'base_products', 'product_categories')
          ORDER BY table_name
        `
      })
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      return
    }
    
    console.log('📋 Tabelas encontradas:')
    tables.forEach(table => {
      console.log(`  ✅ ${table.table_name}`)
    })

    // Verificar estrutura da tabela budgets
    console.log('\n🔍 Verificando estrutura da tabela budgets...')
    const { data: budgetColumns, error: budgetColumnsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'budgets'
          ORDER BY ordinal_position
        `
      })
    
    if (budgetColumnsError) {
      console.error('❌ Erro ao verificar colunas de budgets:', budgetColumnsError)
    } else {
      console.log('📋 Colunas da tabela budgets:')
      budgetColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }

    // Verificar estrutura da tabela budget_items
    console.log('\n🔍 Verificando estrutura da tabela budget_items...')
    const { data: itemColumns, error: itemColumnsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'budget_items'
          ORDER BY ordinal_position
        `
      })
    
    if (itemColumnsError) {
      console.error('❌ Erro ao verificar colunas de budget_items:', itemColumnsError)
    } else {
      console.log('📋 Colunas da tabela budget_items:')
      itemColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }

    // Verificar dados nas tabelas
    console.log('\n🔍 Verificando dados nas tabelas...')
    
    const { data: budgetCount, error: budgetCountError } = await supabase
      .rpc('exec_sql', {
        sql_query: 'SELECT COUNT(*) as count FROM budgets'
      })
    
    if (budgetCountError) {
      console.error('❌ Erro ao contar budgets:', budgetCountError)
    } else {
      console.log(`📊 Budgets: ${budgetCount[0].count} registros`)
    }
    
    const { data: itemCount, error: itemCountError } = await supabase
      .rpc('exec_sql', {
        sql_query: 'SELECT COUNT(*) as count FROM budget_items'
      })
    
    if (itemCountError) {
      console.error('❌ Erro ao contar budget_items:', itemCountError)
    } else {
      console.log(`📊 Budget items: ${itemCount[0].count} registros`)
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  }
}

checkTables()
