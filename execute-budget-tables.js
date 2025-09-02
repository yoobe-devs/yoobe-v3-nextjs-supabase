const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function executeBudgetTables() {
  console.log('💰 Executando criação das tabelas de orçamentos...\n')

  try {
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('create-budget-tables-complete.sql', 'utf8')
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
      .map(cmd => cmd + ';')

    console.log(`📋 Executando ${commands.length} comandos SQL...\n`)

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      // Pular comentários e comandos vazios
      if (command.trim() === ';' || command.trim().startsWith('--')) {
        continue
      }

      try {
        console.log(`🔧 Executando comando ${i + 1}/${commands.length}...`)
        
        // Tentar executar via RPC se disponível
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command
        })
        
        if (error) {
          console.log(`   ⚠️  Erro no comando ${i + 1}: ${error.message}`)
          console.log(`   💡 Execute manualmente no Supabase Dashboard`)
          console.log(`   📄 Comando: ${command.substring(0, 100)}...`)
        } else {
          console.log(`   ✅ Comando ${i + 1} executado com sucesso`)
        }
      } catch (e) {
        console.log(`   ❌ Erro no comando ${i + 1}: ${e.message}`)
      }
    }

    console.log('\n🎉 Execução concluída!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Acesse o Supabase Dashboard')
    console.log('2. Vá para SQL Editor')
    console.log('3. Cole o conteúdo do arquivo create-budget-tables-complete.sql')
    console.log('4. Execute o SQL')
    console.log('5. Verifique se as tabelas foram criadas na aba Table Editor')

  } catch (error) {
    console.error('❌ Erro durante execução:', error)
    console.log('\n💡 Execute o SQL manualmente no Supabase Dashboard')
  }
}

executeBudgetTables()
