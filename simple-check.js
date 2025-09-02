const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function simpleCheck() {
  console.log('🔍 Verificação simples das tabelas...\n')

  try {
    // Tentar acessar cada tabela diretamente
    console.log('1. Verificando tabela budgets...')
    try {
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Erro: ${error.message}`)
      } else {
        console.log(`✅ Tabela budgets existe (${budgets?.length || 0} registros)`)
      }
    } catch (e) {
      console.log(`❌ Exceção: ${e.message}`)
    }

    console.log('\n2. Verificando tabela budget_items...')
    try {
      const { data: items, error } = await supabase
        .from('budget_items')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Erro: ${error.message}`)
      } else {
        console.log(`✅ Tabela budget_items existe (${items?.length || 0} registros)`)
      }
    } catch (e) {
      console.log(`❌ Exceção: ${e.message}`)
    }

    console.log('\n3. Verificando tabela company_products...')
    try {
      const { data: products, error } = await supabase
        .from('company_products')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Erro: ${error.message}`)
      } else {
        console.log(`✅ Tabela company_products existe (${products?.length || 0} registros)`)
      }
    } catch (e) {
      console.log(`❌ Exceção: ${e.message}`)
    }

    console.log('\n4. Verificando tabela base_products...')
    try {
      const { data: baseProducts, error } = await supabase
        .from('base_products')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Erro: ${error.message}`)
      } else {
        console.log(`✅ Tabela base_products existe (${baseProducts?.length || 0} registros)`)
      }
    } catch (e) {
      console.log(`❌ Exceção: ${e.message}`)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

simpleCheck()
