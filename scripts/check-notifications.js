const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNotifications() {
  console.log('🔍 Verificando tabela notifications...');

  try {
    // Tentar buscar dados da tabela notifications
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Erro ao buscar notificações:', fetchError);
      return;
    }

    console.log('✅ Tabela notifications existe e é acessível');
    console.log(`📊 Total de notificações: ${notifications?.length || 0}`);

    // Tentar inserir uma notificação de teste
    console.log('🧪 Testando inserção de notificação...');
    
    const { data: users } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('role', 'manager')
      .limit(1);

    if (users && users.length > 0) {
      const testNotification = {
        user_id: users[0].id,
        company_id: users[0].company_id,
        type: 'orcamento',
        title: 'Teste',
        message: 'Notificação de teste',
        data: {},
        is_read: false
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(testNotification)
        .select();

      if (error) {
        console.error('❌ Erro ao inserir notificação de teste:', error);
        console.error('Detalhes do erro:', error.message);
        console.error('Código do erro:', error.code);
      } else {
        console.log('✅ Notificação de teste inserida com sucesso:', data[0]);
        
        // Limpar notificação de teste
        await supabase
          .from('notifications')
          .delete()
          .eq('id', data[0].id);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar notifications:', error);
  }
}

checkNotifications();
