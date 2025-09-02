const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function checkExecSql() {
  console.log('🔍 Verificando função exec_sql...\n')

  try {
    // Tentar chamar a função exec_sql
    console.log('1. Testando função exec_sql...')
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT 1 as test'
      })
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`)
      console.log(`   Código: ${error.code}`)
      console.log(`   Detalhes: ${error.details}`)
      
      // Tentar com sql_query
      console.log('\n2. Tentando com parâmetro sql_query...')
      const { data: data2, error: error2 } = await supabase
        .rpc('exec_sql', {
          sql_query: 'SELECT 1 as test'
        })
      
      if (error2) {
        console.log(`❌ Erro: ${error2.message}`)
        console.log(`   Código: ${error2.code}`)
      } else {
        console.log('✅ Função exec_sql funciona com sql_query')
        console.log('Resultado:', data2)
      }
    } else {
      console.log('✅ Função exec_sql funciona com sql')
      console.log('Resultado:', data)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkExecSql()
