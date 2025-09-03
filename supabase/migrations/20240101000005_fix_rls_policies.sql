-- Corrigir políticas RLS para evitar recursão infinita
-- Desabilitar RLS temporariamente para as tabelas principais
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE base_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_products DISABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS corretas para product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de categorias
CREATE POLICY "product_categories_select_policy" ON product_categories
  FOR SELECT USING (true);

-- Política para permitir inserção/atualização apenas para admins
CREATE POLICY "product_categories_insert_policy" ON product_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "product_categories_update_policy" ON product_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "product_categories_delete_policy" ON product_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Recriar políticas RLS corretas para base_products
ALTER TABLE base_products ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de produtos base
CREATE POLICY "base_products_select_policy" ON base_products
  FOR SELECT USING (true);

-- Política para permitir inserção/atualização apenas para admins
CREATE POLICY "base_products_insert_policy" ON base_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "base_products_update_policy" ON base_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "base_products_delete_policy" ON base_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Recriar políticas RLS corretas para company_products
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para gestores da mesma empresa
CREATE POLICY "company_products_select_policy" ON company_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR (
          auth.users.raw_user_meta_data->>'role' = 'manager'
          AND auth.users.raw_user_meta_data->>'company_id' = company_products.company_id::text
        )
      )
    )
  );

-- Política para permitir inserção para gestores da mesma empresa
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
        )
      )
    )
  );

-- Política para permitir atualização para gestores da mesma empresa
CREATE POLICY "company_products_update_policy" ON company_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR (
          auth.users.raw_user_meta_data->>'role' = 'manager'
          AND auth.users.raw_user_meta_data->>'company_id' = company_products.company_id::text
        )
      )
    )
  );

-- Política para permitir exclusão para gestores da mesma empresa
CREATE POLICY "company_products_delete_policy" ON company_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR (
          auth.users.raw_user_meta_data->>'role' = 'manager'
          AND auth.users.raw_user_meta_data->>'company_id' = company_products.company_id::text
        )
      )
    )
  );

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_base_products_category_id ON base_products(category_id);
CREATE INDEX IF NOT EXISTS idx_base_products_status ON base_products(status);
CREATE INDEX IF NOT EXISTS idx_company_products_company_id ON company_products(company_id);
CREATE INDEX IF NOT EXISTS idx_company_products_base_product_id ON company_products(base_product_id);
CREATE INDEX IF NOT EXISTS idx_company_products_category_id ON company_products(category_id);
CREATE INDEX IF NOT EXISTS idx_company_products_status ON company_products(status);
CREATE INDEX IF NOT EXISTS idx_product_categories_status ON product_categories(status);

-- Criar função para verificar se um produto base já foi replicado para uma empresa
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

-- Criar função para obter produtos base com status de replicação
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
