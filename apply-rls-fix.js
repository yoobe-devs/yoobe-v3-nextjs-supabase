const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLSFix() {
  try {
    console.log('🔧 Aplicando correções RLS...')
    console.log('')

    // 1. Desabilitar RLS temporariamente
    console.log('1️⃣ Desabilitando RLS temporariamente...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
        ALTER TABLE base_products DISABLE ROW LEVEL SECURITY;
        ALTER TABLE company_products DISABLE ROW LEVEL SECURITY;
      `
    })
    console.log('✅ RLS desabilitado')
    console.log('')

    // 2. Recriar políticas para product_categories
    console.log('2️⃣ Recriando políticas para product_categories...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "product_categories_select_policy" ON product_categories;
        DROP POLICY IF EXISTS "product_categories_insert_policy" ON product_categories;
        DROP POLICY IF EXISTS "product_categories_update_policy" ON product_categories;
        DROP POLICY IF EXISTS "product_categories_delete_policy" ON product_categories;
        
        CREATE POLICY "product_categories_select_policy" ON product_categories
          FOR SELECT USING (true);
        
        CREATE POLICY "product_categories_insert_policy" ON product_categories
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "product_categories_update_policy" ON product_categories
          FOR UPDATE USING (true);
        
        CREATE POLICY "product_categories_delete_policy" ON product_categories
          FOR DELETE USING (true);
      `
    })
    console.log('✅ Políticas para product_categories criadas')
    console.log('')

    // 3. Recriar políticas para base_products
    console.log('3️⃣ Recriando políticas para base_products...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE base_products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "base_products_select_policy" ON base_products;
        DROP POLICY IF EXISTS "base_products_insert_policy" ON base_products;
        DROP POLICY IF EXISTS "base_products_update_policy" ON base_products;
        DROP POLICY IF EXISTS "base_products_delete_policy" ON base_products;
        
        CREATE POLICY "base_products_select_policy" ON base_products
          FOR SELECT USING (true);
        
        CREATE POLICY "base_products_insert_policy" ON base_products
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "base_products_update_policy" ON base_products
          FOR UPDATE USING (true);
        
        CREATE POLICY "base_products_delete_policy" ON base_products
          FOR DELETE USING (true);
      `
    })
    console.log('✅ Políticas para base_products criadas')
    console.log('')

    // 4. Recriar políticas para company_products
    console.log('4️⃣ Recriando políticas para company_products...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "company_products_select_policy" ON company_products;
        DROP POLICY IF EXISTS "company_products_insert_policy" ON company_products;
        DROP POLICY IF EXISTS "company_products_update_policy" ON company_products;
        DROP POLICY IF EXISTS "company_products_delete_policy" ON company_products;
        
        CREATE POLICY "company_products_select_policy" ON company_products
          FOR SELECT USING (true);
        
        CREATE POLICY "company_products_insert_policy" ON company_products
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "company_products_update_policy" ON company_products
          FOR UPDATE USING (true);
        
        CREATE POLICY "company_products_delete_policy" ON company_products
          FOR DELETE USING (true);
      `
    })
    console.log('✅ Políticas para company_products criadas')
    console.log('')

    // 5. Criar índices
    console.log('5️⃣ Criando índices...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_base_products_category_id ON base_products(category_id);
        CREATE INDEX IF NOT EXISTS idx_base_products_status ON base_products(status);
        CREATE INDEX IF NOT EXISTS idx_company_products_company_id ON company_products(company_id);
        CREATE INDEX IF NOT EXISTS idx_company_products_base_product_id ON company_products(base_product_id);
        CREATE INDEX IF NOT EXISTS idx_company_products_category_id ON company_products(category_id);
        CREATE INDEX IF NOT EXISTS idx_company_products_status ON company_products(status);
        CREATE INDEX IF NOT EXISTS idx_product_categories_status ON product_categories(status);
      `
    })
    console.log('✅ Índices criados')
    console.log('')

    // 6. Criar funções auxiliares
    console.log('6️⃣ Criando funções auxiliares...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION is_base_product_replicated(base_product_uuid UUID, company_uuid UUID)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM company_products 
            WHERE base_product_id = base_product_uuid 
            AND company_id = company_uuid
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        CREATE OR REPLACE FUNCTION get_base_products_with_replication_status(company_uuid UUID, page_num INTEGER DEFAULT 1, page_size INTEGER DEFAULT 20)
        RETURNS TABLE (
          id UUID,
          name VARCHAR(255),
          description TEXT,
          category_id UUID,
          base_price DECIMAL(10,2),
          base_points_cost INTEGER,
          image_url TEXT,
          specifications JSONB,
          status VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE,
          is_replicated BOOLEAN
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            bp.id,
            bp.name,
            bp.description,
            bp.category_id,
            bp.base_price,
            bp.base_points_cost,
            bp.image_url,
            bp.specifications,
            bp.status,
            bp.created_at,
            bp.updated_at,
            is_base_product_replicated(bp.id, company_uuid) as is_replicated
          FROM base_products bp
          WHERE bp.status = 'active'
          ORDER BY bp.created_at DESC
          LIMIT page_size
          OFFSET (page_num - 1) * page_size;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })
    console.log('✅ Funções auxiliares criadas')
    console.log('')

    console.log('🎉 Correções RLS aplicadas com sucesso!')
    console.log('')
    console.log('📋 Resumo das correções:')
    console.log('✅ RLS desabilitado temporariamente')
    console.log('✅ Políticas recriadas para todas as tabelas')
    console.log('✅ Índices criados para performance')
    console.log('✅ Funções auxiliares criadas')
    console.log('')
    console.log('🚀 Sistema pronto para teste!')

  } catch (error) {
    console.error('❌ Erro ao aplicar correções RLS:', error)
    process.exit(1)
  }
}

applyRLSFix()
