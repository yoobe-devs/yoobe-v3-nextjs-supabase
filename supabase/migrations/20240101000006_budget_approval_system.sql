-- Sistema de Orçamentos e Aprovação
-- Criar tabela de orçamentos
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

-- Criar tabela de itens do orçamento
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

-- Atualizar tabela company_products para incluir flag de ativo e relacionamento com orçamento
ALTER TABLE company_products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES budgets(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_budgets_company_id ON budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_manager_id ON budgets(manager_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_base_product_id ON budget_items(base_product_id);
CREATE INDEX IF NOT EXISTS idx_company_products_budget_id ON company_products(budget_id);
CREATE INDEX IF NOT EXISTS idx_company_products_is_active ON company_products(is_active);

-- Criar triggers para updated_at
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar se um orçamento está aprovado
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

-- Função para verificar se um produto pode ser replicado
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

-- Função para obter orçamentos com detalhes
CREATE OR REPLACE FUNCTION get_budgets_with_details(company_uuid UUID DEFAULT NULL, budget_status VARCHAR(50) DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  manager_id UUID,
  title VARCHAR(255),
  description TEXT,
  total_amount DECIMAL(10,2),
  status VARCHAR(50),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  items_count INTEGER,
  manager_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.company_id,
    b.manager_id,
    b.title,
    b.description,
    b.total_amount,
    b.status,
    b.admin_notes,
    b.submitted_at,
    b.reviewed_at,
    b.reviewed_by,
    b.created_at,
    b.updated_at,
    COUNT(bi.id)::INTEGER as items_count,
    'Gestor Empresa' as manager_name
  FROM budgets b
  LEFT JOIN budget_items bi ON b.id = bi.budget_id
  WHERE (company_uuid IS NULL OR b.company_id = company_uuid)
    AND (budget_status IS NULL OR b.status = budget_status)
  GROUP BY b.id, b.company_id, b.manager_id, b.title, b.description, b.total_amount, 
           b.status, b.admin_notes, b.submitted_at, b.reviewed_at, b.reviewed_by, 
           b.created_at, b.updated_at
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter itens de um orçamento
CREATE OR REPLACE FUNCTION get_budget_items(budget_uuid UUID)
RETURNS TABLE (
  id UUID,
  budget_id UUID,
  base_product_id UUID,
  quantity INTEGER,
  custom_price DECIMAL(10,2),
  custom_points_cost INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  product_name VARCHAR(255),
  product_description TEXT,
  base_price DECIMAL(10,2),
  base_points_cost INTEGER,
  category_name VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bi.id,
    bi.budget_id,
    bi.base_product_id,
    bi.quantity,
    bi.custom_price,
    bi.custom_points_cost,
    bi.notes,
    bi.created_at,
    bi.updated_at,
    bp.name as product_name,
    bp.description as product_description,
    bp.base_price,
    bp.base_points_cost,
    pc.name as category_name
  FROM budget_items bi
  JOIN base_products bp ON bi.base_product_id = bp.id
  LEFT JOIN product_categories pc ON bp.category_id = pc.id
  WHERE bi.budget_id = budget_uuid
  ORDER BY bi.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS para budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_select_policy" ON budgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR (
          auth.users.raw_user_meta_data->>'role' = 'manager'
          AND auth.users.raw_user_meta_data->>'company_id' = budgets.company_id::text
        )
      )
    )
  );

CREATE POLICY "budgets_insert_policy" ON budgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'manager'
      AND auth.users.raw_user_meta_data->>'company_id' = budgets.company_id::text
    )
  );

CREATE POLICY "budgets_update_policy" ON budgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR (
          auth.users.raw_user_meta_data->>'role' = 'manager'
          AND auth.users.raw_user_meta_data->>'company_id' = budgets.company_id::text
        )
      )
    )
  );

-- Políticas RLS para budget_items
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_items_select_policy" ON budget_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets b
      JOIN auth.users u ON u.id = auth.uid()
      WHERE b.id = budget_items.budget_id
      AND (
        u.raw_user_meta_data->>'role' = 'admin'
        OR (
          u.raw_user_meta_data->>'role' = 'manager'
          AND u.raw_user_meta_data->>'company_id' = b.company_id::text
        )
      )
    )
  );

CREATE POLICY "budget_items_insert_policy" ON budget_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets b
      JOIN auth.users u ON u.id = auth.uid()
      WHERE b.id = budget_items.budget_id
      AND u.raw_user_meta_data->>'role' = 'manager'
      AND u.raw_user_meta_data->>'company_id' = b.company_id::text
    )
  );

CREATE POLICY "budget_items_update_policy" ON budget_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets b
      JOIN auth.users u ON u.id = auth.uid()
      WHERE b.id = budget_items.budget_id
      AND (
        u.raw_user_meta_data->>'role' = 'admin'
        OR (
          u.raw_user_meta_data->>'role' = 'manager'
          AND u.raw_user_meta_data->>'company_id' = b.company_id::text
        )
      )
    )
  );

-- Atualizar políticas RLS para company_products
DROP POLICY IF EXISTS "company_products_insert_policy" ON company_products;
CREATE POLICY "company_products_insert_policy" ON company_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR (
          auth.users.raw_user_meta_data->>'role' = 'manager'
          AND auth.users.raw_user_meta_data->>'company_id' = company_products.company_id::text
          AND (
            company_products.budget_id IS NULL
            OR is_budget_approved(company_products.budget_id)
          )
        )
      )
    )
  );

-- Inserir dados de exemplo
INSERT INTO budgets (company_id, manager_id, title, description, total_amount, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Orçamento Inicial', 'Primeiro orçamento para produtos base', 150.00, 'pending')
ON CONFLICT DO NOTHING;
