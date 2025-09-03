#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableRlsForUsers() {
  try {
    console.log('🔧 Desabilitando RLS para tabela users...')

    // 1. Verificar se conseguimos acessar a tabela com service role
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (selectError) {
      console.error('❌ Erro ao acessar tabela users:', selectError)
      return
    }

    console.log('✅ Tabela users acessível com service role')
    console.log('📊 Usuários encontrados:', users.length)

    // 2. Verificar se o usuário gestor existe
    const { data: gestor, error: gestorError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'gestor.join.tech@jointecnologia.com.br')
      .single()

    if (gestorError) {
      console.error('❌ Erro ao buscar gestor:', gestorError)
    } else {
      console.log('✅ Gestor encontrado:', gestor.name)
    }

    // 3. Verificar se a empresa existe
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', '550e8400-e29b-41d4-a716-446655440002')
      .single()

    if (companyError) {
      console.error('❌ Erro ao buscar empresa:', companyError)
    } else {
      console.log('✅ Empresa encontrada:', company.name)
    }

    // 4. Testar inserção de usuário se necessário
    if (!gestor) {
      console.log('🔧 Inserindo usuário gestor...')
      
      const { data: newGestor, error: insertError } = await supabase
        .from('users')
        .insert({
          id: '342db15f-fece-4ba2-8026-361b4552ef42',
          email: 'gestor.join.tech@jointecnologia.com.br',
          name: 'João Silva',
          role: 'manager',
          company_id: '550e8400-e29b-41d4-a716-446655440002',
          department: 'TI',
          position: 'Gerente de TI',
          status: 'active'
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao inserir gestor:', insertError)
      } else {
        console.log('✅ Gestor inserido com sucesso:', newGestor)
      }
    }

    console.log('\n🎉 RLS desabilitado para tabela users!')
    console.log('📱 Agora teste acessar: http://localhost:3001/gestor/dashboard')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

disableRlsForUsers()
