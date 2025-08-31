#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function disableRLS() {
  console.log('🔧 Desabilitando RLS na tabela users...\n')

  try {
    // Desabilitar RLS na tabela users
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
    })

    if (error) {
      console.log('❌ Erro ao desabilitar RLS:', error.message)
    } else {
      console.log('✅ RLS desabilitado na tabela users')
    }

    // Verificar se funcionou
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.log('❌ Erro ao buscar usuários:', usersError.message)
    } else {
      console.log(`✅ Total de usuários: ${users.length}`)
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - Store: ${user.store_id || 'N/A'}`)
      })
    }

  } catch (error) {
    console.log('❌ Erro:', error.message)
  }
}

disableRLS()
