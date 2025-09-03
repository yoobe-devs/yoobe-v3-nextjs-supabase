const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Verificando tabelas existentes...');

  const tables = [
    'companies',
    'users', 
    'base_products',
    'product_categories',
    'company_products',
    'budgets',
    'budget_items',
    'orders',
    'categories'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Existe`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n👥 Verificando usuários autenticados...');
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log(`❌ Erro ao buscar usuários:`, error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    console.log(`✅ ${users.length} usuários encontrados`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 Usuário ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.user_metadata?.role || 'N/A'}`);
      console.log(`   Company ID: ${user.user_metadata?.company_id || 'N/A'}`);
      console.log(`   Created: ${user.created_at}`);
    });

  } catch (err) {
    console.log(`❌ Erro geral:`, err);
  }
}

checkTables();
