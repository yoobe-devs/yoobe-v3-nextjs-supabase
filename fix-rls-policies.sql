-- Corrigir políticas RLS da tabela users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Managers can view store users" ON users;
DROP POLICY IF EXISTS "Managers can update store users" ON users;

-- Criar políticas simples e funcionais
CREATE POLICY "Enable read access for authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for admins" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Corrigir políticas RLS da tabela stores
DROP POLICY IF EXISTS "Users can view own store" ON stores;
DROP POLICY IF EXISTS "Admins can view all stores" ON stores;
DROP POLICY IF EXISTS "Admins can update all stores" ON stores;

CREATE POLICY "Enable read access for authenticated users" ON stores
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON stores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for store managers" ON stores
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND (role = 'admin' OR (role = 'manager' AND store_id = stores.id))
        )
    );

-- Corrigir políticas RLS da tabela companies
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can update all companies" ON companies;

CREATE POLICY "Enable read access for authenticated users" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON companies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for admins" ON companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Corrigir políticas RLS da tabela company_products
DROP POLICY IF EXISTS "Users can view store products" ON company_products;
DROP POLICY IF EXISTS "Managers can manage store products" ON company_products;
DROP POLICY IF EXISTS "Admins can manage all products" ON company_products;

CREATE POLICY "Enable read access for authenticated users" ON company_products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON company_products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for product managers" ON company_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND (role = 'admin' OR (role = 'manager' AND store_id = company_products.store_id))
        )
    );

-- Corrigir políticas RLS da tabela orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Managers can view store orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

CREATE POLICY "Enable read access for authenticated users" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for order managers" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND (role = 'admin' OR (role = 'manager' AND store_id = orders.store_id))
        )
    );
