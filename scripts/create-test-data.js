const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestData() {
  console.log('🚀 Criando dados de teste...');

  try {
    // 1. Verificar se a empresa padrão existe
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('email', 'admin@yoobe.co');

    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError);
      return;
    }

    let companyId;
    if (companies && companies.length > 0) {
      companyId = companies[0].id;
      console.log('✅ Empresa encontrada:', companyId);
    } else {
      // Criar empresa se não existir
      const { data: newCompany, error: createCompanyError } = await supabase
        .from('companies')
        .insert({
          name: 'Yoobe Test Company',
          email: 'admin@yoobe.co',
          phone: '(41) 98760-7512',
          address: 'Rua Teste, 123',
          city: 'Curitiba',
          state: 'PR',
          zip_code: '80020-000',
          status: 'active'
        })
        .select()
        .single();

      if (createCompanyError) {
        console.error('❌ Erro ao criar empresa:', createCompanyError);
        return;
      }

      companyId = newCompany.id;
      console.log('✅ Empresa criada:', companyId);
    }

    // 2. Criar usuário admin
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@yoobe.co',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        company_id: companyId,
        full_name: 'Administrador Global'
      }
    });

    if (adminError) {
      console.error('❌ Erro ao criar admin:', adminError);
    } else {
      console.log('✅ Admin criado:', adminUser.user.id);
    }

    // 3. Criar usuário gestor
    const { data: managerUser, error: managerError } = await supabase.auth.admin.createUser({
      email: 'gestor@yoobe.co',
      password: 'gestor123',
      email_confirm: true,
      user_metadata: {
        role: 'manager',
        company_id: companyId,
        full_name: 'Gestor Empresa'
      }
    });

    if (managerError) {
      console.error('❌ Erro ao criar gestor:', managerError);
    } else {
      console.log('✅ Gestor criado:', managerUser.user.id);
    }

    // 4. Criar usuário comum
    const { data: regularUser, error: userError } = await supabase.auth.admin.createUser({
      email: 'user@yoobe.co',
      password: 'user123',
      email_confirm: true,
      user_metadata: {
        role: 'user',
        company_id: companyId,
        full_name: 'Usuário Comum'
      }
    });

    if (userError) {
      console.error('❌ Erro ao criar usuário:', userError);
    } else {
      console.log('✅ Usuário criado:', regularUser.user.id);
    }

    // 5. Verificar produtos base
    const { data: baseProducts, error: productsError } = await supabase
      .from('base_products')
      .select('*');

    if (productsError) {
      console.error('❌ Erro ao buscar produtos base:', productsError);
    } else {
      console.log(`✅ ${baseProducts.length} produtos base encontrados`);
    }

    // 6. Verificar categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('product_categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Erro ao buscar categorias:', categoriesError);
    } else {
      console.log(`✅ ${categories.length} categorias encontradas`);
    }

    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('👑 Admin: admin@yoobe.co / admin123');
    console.log('👨‍💼 Gestor: gestor@yoobe.co / gestor123');
    console.log('👤 Usuário: user@yoobe.co / user123');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestData();
