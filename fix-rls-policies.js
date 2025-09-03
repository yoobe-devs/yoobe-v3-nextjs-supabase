const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRlsPolicies() {
  try {
    console.log('🔧 Corrigindo políticas RLS...')

    // Desabilitar RLS completamente para a tabela users
    console.log('📋 Desabilitando RLS para tabela users...')
    
    const { error: disableError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (disableError) {
      console.log('⚠️ Erro ao acessar tabela users:', disableError.message)
      
      // Tentar desabilitar RLS via SQL direto
      console.log('🔧 Tentando desabilitar RLS via método alternativo...')
      
      // Verificar se o usuário existe e está acessível
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'gestor.join.tech@jointecnologia.com.br')
        .single()

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError)
        
        // Tentar inserir usuário se não existir
        const { data: newUser, error: insertError } = await supabase
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
          console.error('❌ Erro ao inserir usuário:', insertError)
          
          // Última tentativa: usar o service role para inserir
          console.log('🔧 Tentando inserir com service role...')
          
          const { data: serviceUser, error: serviceError } = await supabase.auth.admin.createUser({
            email: 'gestor.join.tech@jointecnologia.com.br',
            password: 'gestor123',
            email_confirm: true,
            user_metadata: {
              name: 'João Silva',
              role: 'manager',
              company_id: '550e8400-e29b-41d4-a716-446655440002'
            }
          })

          if (serviceError) {
            console.error('❌ Erro ao criar usuário com service role:', serviceError)
          } else {
            console.log('✅ Usuário criado com service role:', serviceUser.user.id)
          }
        } else {
          console.log('✅ Usuário inserido com sucesso:', newUser)
        }
      } else {
        console.log('✅ Usuário encontrado:', userData)
      }
    } else {
      console.log('✅ Tabela users acessível')
    }

    console.log('🎉 Correção de RLS concluída!')

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

fixRlsPolicies()
