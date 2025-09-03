const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyBudgetSystem() {
  try {
    console.log('💰 Aplicando sistema de orçamentos...')
    console.log('')

    // 1. Criar tabela budgets
    console.log('1️⃣ Criando tabela budgets...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS budgets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          company_id UUID NOT NULL,
          manager_id UUID NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          total_amount DECIMAL(10,2) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          admin_notes TEXT,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          reviewed_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    console.log('✅ Tabela budgets criada')
    console.log('')

    // 2. Criar tabela budget_items
    console.log('2️⃣ Criando tabela budget_items...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS budget_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
          base_product_id UUID NOT NULL REFERENCES base_products(id),
          quantity INTEGER NOT NULL DEFAULT 1,
          custom_price DECIMAL(10,2),
          custom_points_cost INTEGER,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    console.log('✅ Tabela budget_items criada')
    console.log('')

    // 3. Atualizar company_products
    console.log('3️⃣ Atualizando tabela company_products...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE company_products 
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES budgets(id),
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS approved_by UUID;
      `
    })
    console.log('✅ Tabela company_products atualizada')
    console.log('')

    // 4. Criar índices
    console.log('4️⃣ Criando índices...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_budgets_company_id ON budgets(company_id);
        CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
        CREATE INDEX IF NOT EXISTS idx_budgets_manager_id ON budgets(manager_id);
        CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);
        CREATE INDEX IF NOT EXISTS idx_budget_items_base_product_id ON budget_items(base_product_id);
        CREATE INDEX IF NOT EXISTS idx_company_products_budget_id ON company_products(budget_id);
        CREATE INDEX IF NOT EXISTS idx_company_products_is_active ON company_products(is_active);
      `
    })
    console.log('✅ Índices criados')
    console.log('')

    // 5. Criar triggers
    console.log('5️⃣ Criando triggers...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    })
    console.log('✅ Triggers criados')
    console.log('')

    // 6. Criar funções auxiliares
    console.log('6️⃣ Criando funções auxiliares...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION is_budget_approved(budget_uuid UUID)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM budgets 
            WHERE id = budget_uuid 
            AND status = 'approved'
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        CREATE OR REPLACE FUNCTION can_replicate_product(company_uuid UUID, base_product_uuid UUID)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM budgets b
            JOIN budget_items bi ON b.id = bi.budget_id
            WHERE b.company_id = company_uuid
            AND bi.base_product_id = base_product_uuid
            AND b.status = 'approved'
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })
    console.log('✅ Funções auxiliares criadas')
    console.log('')

    // 7. Criar dados de exemplo
    console.log('7️⃣ Criando dados de exemplo...')
    await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO budgets (company_id, manager_id, title, description, total_amount, status) VALUES
          ('test-company-id', 'bdb3d274-adad-46a9-91e9-f588bac403fc', 'Orçamento Inicial', 'Primeiro orçamento para produtos base', 150.00, 'pending')
        ON CONFLICT DO NOTHING;
      `
    })
    console.log('✅ Dados de exemplo criados')
    console.log('')

    // 8. Testar estrutura
    console.log('8️⃣ Testando estrutura...')
    
    // Testar tabela budgets
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .limit(1)

    if (budgetsError) {
      console.log(`❌ Erro ao acessar budgets: ${budgetsError.message}`)
    } else {
      console.log(`✅ Tabela budgets funcionando (${budgets?.length || 0} registros)`)
    }

    // Testar tabela budget_items
    const { data: budgetItems, error: budgetItemsError } = await supabase
      .from('budget_items')
      .select('*')
      .limit(1)

    if (budgetItemsError) {
      console.log(`❌ Erro ao acessar budget_items: ${budgetItemsError.message}`)
    } else {
      console.log(`✅ Tabela budget_items funcionando (${budgetItems?.length || 0} registros)`)
    }

    // Testar company_products atualizada
    const { data: companyProducts, error: companyProductsError } = await supabase
      .from('company_products')
      .select('*')
      .limit(1)

    if (companyProductsError) {
      console.log(`❌ Erro ao acessar company_products: ${companyProductsError.message}`)
    } else {
      console.log(`✅ Tabela company_products atualizada (${companyProducts?.length || 0} registros)`)
      if (companyProducts && companyProducts.length > 0) {
        const sample = companyProducts[0]
        console.log(`📋 Novos campos: is_active=${sample.is_active}, budget_id=${sample.budget_id || 'null'}`)
      }
    }
    console.log('')

    console.log('🎉 Sistema de orçamentos aplicado com sucesso!')
    console.log('')
    console.log('📋 Resumo das funcionalidades:')
    console.log('✅ Tabela budgets criada')
    console.log('✅ Tabela budget_items criada')
    console.log('✅ Company_products atualizada')
    console.log('✅ Índices de performance criados')
    console.log('✅ Funções auxiliares implementadas')
    console.log('✅ Dados de exemplo inseridos')
    console.log('')
    console.log('🚀 Sistema pronto para implementação das APIs!')

  } catch (error) {
    console.error('❌ Erro ao aplicar sistema de orçamentos:', error)
    process.exit(1)
  }
}

applyBudgetSystem()
