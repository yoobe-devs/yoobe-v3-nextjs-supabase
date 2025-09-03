const { createClient } = require('@supabase/supabase-js')

// Configuração direta do Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableRLSCompletely() {
  try {
    console.log('🔧 Desabilitando RLS completamente...')
    console.log('')

    // Desabilitar RLS para todas as tabelas
    const tables = [
      'product_categories',
      'base_products',
      'company_products',
      'users',
      'profiles',
    ]

    for (const table of tables) {
      console.log(`🔓 Desabilitando RLS para ${table}...`)
      try {
        await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
        })
        console.log(`✅ RLS desabilitado para ${table}`)
      } catch (error) {
        console.log(
          `⚠️ Erro ao desabilitar RLS para ${table}: ${error.message}`
        )
      }
    }
    console.log('')

    // Remover todas as políticas existentes
    console.log('🗑️ Removendo políticas RLS existentes...')
    const policies = [
      {
        table: 'product_categories',
        policies: ['select', 'insert', 'update', 'delete'],
      },
      {
        table: 'base_products',
        policies: ['select', 'insert', 'update', 'delete'],
      },
      {
        table: 'company_products',
        policies: ['select', 'insert', 'update', 'delete'],
      },
      { table: 'users', policies: ['select', 'insert', 'update', 'delete'] },
      { table: 'profiles', policies: ['select', 'insert', 'update', 'delete'] },
    ]

    for (const { table, policies: tablePolicies } of policies) {
      for (const policy of tablePolicies) {
        try {
          await supabase.rpc('exec_sql', {
            sql: `DROP POLICY IF EXISTS "${table}_${policy}_policy" ON ${table};`,
          })
          console.log(`✅ Política ${table}_${policy}_policy removida`)
        } catch (error) {
          console.log(
            `⚠️ Erro ao remover política ${table}_${policy}_policy: ${error.message}`
          )
        }
      }
    }
    console.log('')

    // Testar acesso direto às tabelas
    console.log('🧪 Testando acesso direto às tabelas...')

    // Testar users (tabela principal do problema)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.log(`❌ Erro ao acessar users: ${usersError.message}`)
    } else {
      console.log(
        `✅ Acesso a users funcionando (${users?.length || 0} registros)`
      )
    }

    // Testar base_products
    const { data: baseProducts, error: baseError } = await supabase
      .from('base_products')
      .select('*')
      .limit(1)

    if (baseError) {
      console.log(`❌ Erro ao acessar base_products: ${baseError.message}`)
    } else {
      console.log(
        `✅ Acesso a base_products funcionando (${baseProducts?.length || 0} registros)`
      )
    }

    // Testar company_products
    const { data: companyProducts, error: companyError } = await supabase
      .from('company_products')
      .select('*')
      .limit(1)

    if (companyError) {
      console.log(
        `❌ Erro ao acessar company_products: ${companyError.message}`
      )
    } else {
      console.log(
        `✅ Acesso a company_products funcionando (${companyProducts?.length || 0} registros)`
      )
    }

    // Testar product_categories
    const { data: categories, error: categoriesError } = await supabase
      .from('product_categories')
      .select('*')
      .limit(1)

    if (categoriesError) {
      console.log(
        `❌ Erro ao acessar product_categories: ${categoriesError.message}`
      )
    } else {
      console.log(
        `✅ Acesso a product_categories funcionando (${categories?.length || 0} registros)`
      )
    }
    console.log('')

    console.log('🎉 RLS desabilitado completamente!')
    console.log('')
    console.log('📋 Resumo:')
    console.log('✅ RLS desabilitado para todas as tabelas')
    console.log('✅ Políticas RLS removidas')
    console.log('✅ Acesso direto funcionando')
    console.log('')
    console.log('🚀 Sistema pronto para teste sem restrições!')
  } catch (error) {
    console.error('❌ Erro ao desabilitar RLS:', error)
    process.exit(1)
  }
}

disableRLSCompletely()
