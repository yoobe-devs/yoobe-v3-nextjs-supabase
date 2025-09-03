const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminUser() {
  console.log('🔧 Corrigindo usuário admin...');

  try {
    // Atualizar o usuário admin
    const { data, error } = await supabase.auth.admin.updateUserById(
      '550e8400-e29b-41d4-a716-446655440000',
      {
        user_metadata: {
          role: 'admin',
          company_id: '550e8400-e29b-41d4-a716-446655440001'
        }
      }
    );

    if (error) {
      console.error('❌ Erro ao atualizar admin:', error);
      return;
    }

    console.log('✅ Admin atualizado com sucesso!');
    console.log('   Role: admin');
    console.log('   Company ID: 550e8400-e29b-41d4-a716-446655440001');

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

fixAdminUser();
