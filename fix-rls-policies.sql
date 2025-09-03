-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA GLOBAL SUPERADMIN
-- =====================================================

-- 1. Criar função auth.role() se não existir
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

-- 2. Criar função auth.tenant_id() se não existir
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

-- 3. Políticas RLS para client_products
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

-- 4. Políticas RLS para base_products
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

-- 5. Políticas RLS para product_categories
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

-- 6. Políticas RLS para companies
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

-- 7. Políticas RLS para budgets (sistema de orçamentos)
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Política para gestores verem orçamentos de sua empresa
DROP POLICY IF EXISTS "Managers can view own company budgets" ON budgets;
CREATE POLICY "Managers can view own company budgets" ON budgets
  FOR SELECT USING (
    company_id = auth.tenant_id() OR 
    auth.role() IN ('admin_global', 'superadmin')
  );

-- Política para admin_global e superadmin verem todos os orçamentos
DROP POLICY IF EXISTS "Global admins can view all budgets" ON budgets;
CREATE POLICY "Global admins can view all budgets" ON budgets
  FOR SELECT USING (auth.role() IN ('admin_global', 'superadmin'));

-- Política para inserção (apenas gestores, admin_global e superadmin)
DROP POLICY IF EXISTS "Authorized users can insert budgets" ON budgets;
CREATE POLICY "Authorized users can insert budgets" ON budgets
  FOR INSERT WITH CHECK (
    auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
  );

-- Política para atualização (apenas gestores, admin_global e superadmin)
DROP POLICY IF EXISTS "Authorized users can update budgets" ON budgets;
CREATE POLICY "Authorized users can update budgets" ON budgets
  FOR UPDATE USING (
    auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
  );

-- 8. Políticas RLS para budget_items
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Política para gestores verem itens de orçamentos de sua empresa
DROP POLICY IF EXISTS "Managers can view own company budget items" ON budget_items;
CREATE POLICY "Managers can view own company budget items" ON budget_items
  FOR SELECT USING (
    budget_id IN (
      SELECT id FROM budgets 
      WHERE company_id = auth.tenant_id()
    ) OR 
    auth.role() IN ('admin_global', 'superadmin')
  );

-- Política para admin_global e superadmin verem todos os itens
DROP POLICY IF EXISTS "Global admins can view all budget items" ON budget_items;
CREATE POLICY "Global admins can view all budget items" ON budget_items
  FOR SELECT USING (auth.role() IN ('admin_global', 'superadmin'));

-- Política para inserção (apenas gestores, admin_global e superadmin)
DROP POLICY IF EXISTS "Authorized users can insert budget items" ON budget_items;
CREATE POLICY "Authorized users can insert budget items" ON budget_items
  FOR INSERT WITH CHECK (
    auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
  );

-- Política para atualização (apenas gestores, admin_global e superadmin)
DROP POLICY IF EXISTS "Authorized users can update budget items" ON budget_items;
CREATE POLICY "Authorized users can update budget items" ON budget_items
  FOR UPDATE USING (
    auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
  );

-- 9. Políticas RLS para company_products
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;

-- Política para gestores verem produtos de sua empresa
DROP POLICY IF EXISTS "Managers can view own company products" ON company_products;
CREATE POLICY "Managers can view own company products" ON company_products
  FOR SELECT USING (
    company_id = auth.tenant_id() OR 
    auth.role() IN ('admin_global', 'superadmin')
  );

-- Política para admin_global e superadmin verem todos os produtos
DROP POLICY IF EXISTS "Global admins can view all company products" ON company_products;
CREATE POLICY "Global admins can view all company products" ON company_products
  FOR SELECT USING (auth.role() IN ('admin_global', 'superadmin'));

-- Política para inserção (apenas gestores, admin_global e superadmin)
DROP POLICY IF EXISTS "Authorized users can insert company products" ON company_products;
CREATE POLICY "Authorized users can insert company products" ON company_products
  FOR INSERT WITH CHECK (
    auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
  );

-- Política para atualização (apenas gestores, admin_global e superadmin)
DROP POLICY IF EXISTS "Authorized users can update company products" ON company_products;
CREATE POLICY "Authorized users can update company products" ON company_products
  FOR UPDATE USING (
    auth.role() IN ('admin_global', 'superadmin', 'manager', 'admin_gestor')
  );

-- Política para exclusão (apenas admin_global e superadmin)
DROP POLICY IF EXISTS "Global admins can delete company products" ON company_products;
CREATE POLICY "Global admins can delete company products" ON company_products
  FOR DELETE USING (auth.role() IN ('admin_global', 'superadmin'));

-- 10. Políticas RLS para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios dados
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = auth.uid());

-- Política para gestores verem usuários de sua empresa
DROP POLICY IF EXISTS "Managers can view company users" ON users;
CREATE POLICY "Managers can view company users" ON users
  FOR SELECT USING (
    company_id = auth.tenant_id() OR 
    auth.role() IN ('admin_global', 'superadmin')
  );

-- Política para admin_global e superadmin verem todos os usuários
DROP POLICY IF EXISTS "Global admins can view all users" ON users;
CREATE POLICY "Global admins can view all users" ON users
  FOR SELECT USING (auth.role() IN ('admin_global', 'superadmin'));

-- Política para inserção (apenas admin_global e superadmin)
DROP POLICY IF EXISTS "Global admins can insert users" ON users;
CREATE POLICY "Global admins can insert users" ON users
  FOR INSERT WITH CHECK (auth.role() IN ('admin_global', 'superadmin'));

-- Política para atualização (apenas admin_global e superadmin)
DROP POLICY IF EXISTS "Global admins can update users" ON users;
CREATE POLICY "Global admins can update users" ON users
  FOR UPDATE USING (auth.role() IN ('admin_global', 'superadmin'));

-- Política para exclusão (apenas admin_global e superadmin)
DROP POLICY IF EXISTS "Global admins can delete users" ON users;
CREATE POLICY "Global admins can delete users" ON users
  FOR DELETE USING (auth.role() IN ('admin_global', 'superadmin'));

-- =====================================================
-- RESUMO DAS POLÍTICAS CRIADAS
-- =====================================================
-- ✅ auth.role() - Função para obter role do usuário
-- ✅ auth.tenant_id() - Função para obter company_id do usuário
-- ✅ client_products - Políticas para produtos de clientes
-- ✅ base_products - Políticas para produtos base
-- ✅ product_categories - Políticas para categorias
-- ✅ companies - Políticas para empresas
-- ✅ budgets - Políticas para orçamentos
-- ✅ budget_items - Políticas para itens de orçamentos
-- ✅ company_products - Políticas para produtos das empresas
-- ✅ users - Políticas para usuários
-- =====================================================
