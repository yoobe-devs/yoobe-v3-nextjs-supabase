const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkExecSql() {
  try {
    console.log('🔍 Verificando se a função exec_sql existe...')

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'SELECT version();',
    })

    if (error) {
      console.log('❌ exec_sql não existe:', error.message)
      return false
    }

    console.log('✅ exec_sql existe e funcionando')
    console.log('📊 Resultado:', data)
    return true
  } catch (error) {
    console.log('❌ Erro ao verificar exec_sql:', error.message)
    return false
  }
}

checkExecSql()
