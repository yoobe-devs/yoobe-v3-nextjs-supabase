const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserMetadata() {
  console.log('🔧 Corrigindo metadados dos usuários...');
  
  try {
    // Buscar empresa existente
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError);
      return;
    }
    
    let companyId;
    if (companies && companies.length > 0) {
      companyId = companies[0].id;
      console.log('✅ Empresa encontrada:', companyId);
    } else {
      console.error('❌ Nenhuma empresa encontrada');
      return;
    }
    
    // Listar todos os usuários do auth
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('❌ Erro ao listar usuários do auth:', authUsersError);
      return;
    }
    
    console.log(`📊 Encontrados ${authUsers.users.length} usuários no auth`);
    
    // Atualizar cada usuário
    for (const authUser of authUsers.users) {
      try {
        const email = authUser.email;
        const currentMetadata = authUser.user_metadata || {};
        
        // Determinar role baseado no email
        let role = 'user';
        if (email === 'admin@yoobe.co') {
          role = 'admin';
        } else if (email === 'gestor@yoobe.co') {
          role = 'manager';
        }
        
        // Verificar se precisa atualizar
        if (currentMetadata.role !== role || currentMetadata.company_id !== companyId) {
          console.log(`🔄 Atualizando usuário: ${email} (role: ${role})`);
          
          // Atualizar user_metadata no auth
          const { error: authError } = await supabase.auth.admin.updateUserById(
            authUser.id,
            {
              user_metadata: {
                role: role,
                company_id: companyId
              }
            }
          );
          
          if (authError) {
            console.error(`❌ Erro ao atualizar auth do usuário ${email}:`, authError);
            continue;
          }
          
          // Atualizar ou criar entrada na tabela users
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
          
          if (existingUser) {
            // Atualizar usuário existente
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                role: role,
                company_id: companyId 
              })
              .eq('email', email);
            
            if (updateError) {
              console.error(`❌ Erro ao atualizar tabela users do usuário ${email}:`, updateError);
            } else {
              console.log(`✅ Usuário ${email} atualizado com sucesso`);
            }
          } else {
            // Criar nova entrada na tabela users
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                email: email,
                role: role,
                company_id: companyId,
                status: 'active'
              });
            
            if (insertError) {
              console.error(`❌ Erro ao criar entrada na tabela users para ${email}:`, insertError);
            } else {
              console.log(`✅ Nova entrada criada na tabela users para ${email}`);
            }
          }
        } else {
          console.log(`✅ Usuário ${email} já está correto`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${authUser.email}:`, error);
      }
    }
    
    console.log('🎉 Processo de correção concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixUserMetadata();
