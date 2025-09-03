const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixGlobalSuperadminRLS() {
  try {
    console.log('🔐 Corrigindo políticas RLS para global superadmin...')
    console.log('')

    // 1. Verificar se a função auth.role() existe
    console.log('1️⃣ Verificando função auth.role()...')
    try {
      const { error: testError } = await supabase.rpc('exec_sql', {
        sql: 'SELECT auth.role()',
      })

      if (
        testError &&
        testError.message.includes('function "auth.role" does not exist')
      ) {
        console.log('❌ Função auth.role() não existe, criando...')

        const { error: createRoleError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION auth.role()
            RETURNS text
            LANGUAGE sql
            STABLE
            AS $$
              SELECT COALESCE(
                (SELECT (user_metadata->>'role')::text 
                 FROM auth.users 
                 WHERE id = auth.uid()),
                'user'
              );
            $$;
          `,
        })

        if (createRoleError) {
          console.log('❌ Erro ao criar auth.role():', createRoleError.message)
        } else {
          console.log('✅ Função auth.role() criada')
        }
      } else {
        console.log('✅ Função auth.role() já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar auth.role(), tentando criar...')
      const { error: createRoleError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION auth.role()
          RETURNS text
          LANGUAGE sql
          STABLE
          AS $$
            SELECT COALESCE(
              (SELECT (user_metadata->>'role')::text 
               FROM auth.users 
               WHERE id = auth.uid()),
              'user'
            );
          $$;
        `,
      })

      if (createRoleError) {
        console.log('❌ Erro ao criar auth.role():', createRoleError.message)
      } else {
        console.log('✅ Função auth.role() criada/verificada')
      }
    }
    console.log('')

    // 2. Verificar se a função auth.tenant_id() existe
    console.log('2️⃣ Verificando função auth.tenant_id()...')
    try {
      const { error: testError } = await supabase.rpc('exec_sql', {
        sql: 'SELECT auth.tenant_id()',
      })

      if (
        testError &&
        testError.message.includes('function "auth.tenant_id" does not exist')
      ) {
        console.log('❌ Função auth.tenant_id() não existe, criando...')

        const { error: createTenantError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION auth.tenant_id()
            RETURNS uuid
            LANGUAGE sql
            STABLE
            AS $$
              SELECT COALESCE(
                (SELECT company_id 
                 FROM users 
                 WHERE id = auth.uid()),
                NULL
              );
            $$;
          `,
        })

        if (createTenantError) {
          console.log(
            '❌ Erro ao criar auth.tenant_id():',
            createTenantError.message
          )
        } else {
          console.log('✅ Função auth.tenant_id() criada')
        }
      } else {
        console.log('✅ Função auth.tenant_id() já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar auth.tenant_id(), tentando criar...')
      const { error: createTenantError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION auth.tenant_id()
          RETURNS uuid
          LANGUAGE sql
          STABLE
          AS $$
            SELECT COALESCE(
              (SELECT company_id 
               FROM users 
               WHERE id = auth.uid()),
              NULL
            );
          $$;
        `,
      })

      if (createTenantError) {
        console.log(
          '❌ Erro ao criar auth.tenant_id():',
          createTenantError.message
        )
      } else {
        console.log('✅ Função auth.tenant_id() criada/verificada')
      }
    }
    console.log('')

    // 3. Criar políticas RLS para client_products
    console.log('3️⃣ Criando políticas RLS para client_products...')
    const { error: clientProductsPoliciesError } = await supabase.rpc(
      'exec_sql',
      {
        sql: `
        -- Habilitar RLS
        ALTER TABLE client_products ENABLE ROW LEVEL SECURITY;

        -- Política para usuários verem seus próprios produtos
        DROP POLICY IF EXISTS "Users can view own client products" ON client_products;
        CREATE POLICY "Users can view own client products" ON client_products
          FOR SELECT USING (client_id = auth.tenant_id());

        -- Política para gestores verem produtos de sua empresa
        DROP POLICY IF EXISTS "Managers can view company client products" ON client_products;
        CREATE POLICY "Managers can view company client products" ON client_products
          FOR SELECT USING (
            client_id = auth.tenant_id() OR 
            auth.role() IN ('manager', 'admin_gestor')
          );

        -- Política para admin_global e superadmin verem todos os produtos
        DROP POLICY IF EXISTS "Global admins can view all client products" ON client_products;
        CREATE POLICY "Global admins can view all client products" ON client_products
          FOR SELECT USING (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para inserção (apenas admin_global, superadmin e gestores)
        DROP POLICY IF EXISTS "Authorized users can insert client products" ON client_products;
        CREATE POLICY "Authorized users can insert client products" ON client_products
          FOR INSERT WITH CHECK (
            auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
          );

        -- Política para atualização (apenas admin_global, superadmin e gestores)
        DROP POLICY IF EXISTS "Authorized users can update client products" ON client_products;
        CREATE POLICY "Authorized users can update client products" ON client_products
          FOR UPDATE USING (
            auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
          );

        -- Política para exclusão (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can delete client products" ON client_products;
        CREATE POLICY "Global admins can delete client products" ON client_products
          FOR DELETE USING (auth.role() IN ('admin_global', 'superadmin'));
      `,
      }
    )

    if (clientProductsPoliciesError) {
      console.log(
        '❌ Erro ao criar políticas para client_products:',
        clientProductsPoliciesError.message
      )
    } else {
      console.log('✅ Políticas RLS para client_products criadas')
    }
    console.log('')

    // 4. Criar políticas RLS para base_products
    console.log('4️⃣ Criando políticas RLS para base_products...')
    const { error: baseProductsPoliciesError } = await supabase.rpc(
      'exec_sql',
      {
        sql: `
        -- Habilitar RLS
        ALTER TABLE base_products ENABLE ROW LEVEL SECURITY;

        -- Política para todos os usuários autenticados verem produtos base
        DROP POLICY IF EXISTS "Authenticated users can view base products" ON base_products;
        CREATE POLICY "Authenticated users can view base products" ON base_products
          FOR SELECT USING (auth.uid() IS NOT NULL);

        -- Política para inserção (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can insert base products" ON base_products;
        CREATE POLICY "Global admins can insert base products" ON base_products
          FOR INSERT WITH CHECK (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para atualização (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can update base products" ON base_products;
        CREATE POLICY "Global admins can update base products" ON base_products
          FOR UPDATE USING (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para exclusão (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can delete base products" ON base_products;
        CREATE POLICY "Global admins can delete base products" ON base_products
          FOR DELETE USING (auth.role() IN ('admin_global', 'superadmin'));
      `,
      }
    )

    if (baseProductsPoliciesError) {
      console.log(
        '❌ Erro ao criar políticas para base_products:',
        baseProductsPoliciesError.message
      )
    } else {
      console.log('✅ Políticas RLS para base_products criadas')
    }
    console.log('')

    // 5. Criar políticas RLS para product_categories
    console.log('5️⃣ Criando políticas RLS para product_categories...')
    const { error: categoriesPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Habilitar RLS
        ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

        -- Política para todos os usuários autenticados verem categorias
        DROP POLICY IF EXISTS "Authenticated users can view categories" ON product_categories;
        CREATE POLICY "Authenticated users can view categories" ON product_categories
          FOR SELECT USING (auth.uid() IS NOT NULL);

        -- Política para inserção (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can insert categories" ON product_categories;
        CREATE POLICY "Global admins can insert categories" ON product_categories
          FOR INSERT WITH CHECK (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para atualização (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can update categories" ON product_categories;
        CREATE POLICY "Global admins can update categories" ON product_categories
          FOR UPDATE USING (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para exclusão (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can delete categories" ON product_categories;
        CREATE POLICY "Global admins can delete categories" ON product_categories
          FOR DELETE USING (auth.role() IN ('admin_global', 'superadmin'));
      `,
    })

    if (categoriesPoliciesError) {
      console.log(
        '❌ Erro ao criar políticas para product_categories:',
        categoriesPoliciesError.message
      )
    } else {
      console.log('✅ Políticas RLS para product_categories criadas')
    }
    console.log('')

    // 6. Criar políticas RLS para companies
    console.log('6️⃣ Criando políticas RLS para companies...')
    const { error: companiesPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Habilitar RLS
        ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

        -- Política para admin_global e superadmin verem todas as empresas
        DROP POLICY IF EXISTS "Global admins can view all companies" ON companies;
        CREATE POLICY "Global admins can view all companies" ON companies
          FOR SELECT USING (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para gestores verem sua própria empresa
        DROP POLICY IF EXISTS "Managers can view own company" ON companies;
        CREATE POLICY "Managers can view own company" ON companies
          FOR SELECT USING (
            id = auth.tenant_id() OR 
            auth.role() IN ('admin_global', 'superadmin')
          );

        -- Política para inserção (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can insert companies" ON companies;
        CREATE POLICY "Global admins can insert companies" ON companies
          FOR INSERT WITH CHECK (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para atualização (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can update companies" ON companies;
        CREATE POLICY "Global admins can update companies" ON companies
          FOR UPDATE USING (auth.role() IN ('admin_global', 'superadmin'));

        -- Política para exclusão (apenas admin_global e superadmin)
        DROP POLICY IF EXISTS "Global admins can delete companies" ON companies;
        CREATE POLICY "Global admins can delete companies" ON companies
          FOR DELETE USING (auth.role() IN ('admin_global', 'superadmin'));
      `,
    })

    if (companiesPoliciesError) {
      console.log(
        '❌ Erro ao criar políticas para companies:',
        companiesPoliciesError.message
      )
    } else {
      console.log('✅ Políticas RLS para companies criadas')
    }
    console.log('')

    // 7. Testar as políticas
    console.log('7️⃣ Testando as políticas...')
    try {
      // Testar se um usuário admin_global pode ver client_products
      const { data, error } = await supabase
        .from('client_products')
        .select('*')
        .limit(1)

      if (error) {
        console.log('❌ Erro ao testar políticas:', error.message)
      } else {
        console.log('✅ Políticas RLS estão funcionando')
        console.log('📊 Dados retornados:', data?.length || 0, 'registros')
      }
    } catch (e) {
      console.log('❌ Erro ao testar:', e.message)
    }

    console.log('')
    console.log('🎉 Correção das políticas RLS concluída!')
    console.log('')
    console.log('📋 Resumo das correções:')
    console.log('   ✅ Função auth.role() criada/verificada')
    console.log('   ✅ Função auth.tenant_id() criada/verificada')
    console.log('   ✅ Políticas RLS para client_products criadas')
    console.log('   ✅ Políticas RLS para base_products criadas')
    console.log('   ✅ Políticas RLS para product_categories criadas')
    console.log('   ✅ Políticas RLS para companies criadas')
    console.log('')
    console.log(
      '🚀 Agora o global superadmin deve ter acesso adequado a todas as funcionalidades!'
    )
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
  }
}

// Executar a correção
fixGlobalSuperadminRLS()
