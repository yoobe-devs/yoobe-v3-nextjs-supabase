-- Corrigir lógica de lojas e funcionários
-- Adicionar store_id na tabela users para vincular funcionários às lojas
-- Atualizar relacionamentos para que gestores vejam dados da loja

-- Adicionar store_id na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL;

-- Adicionar store_id na tabela company_products para vincular produtos às lojas
ALTER TABLE company_products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- Adicionar store_id na tabela orders para vincular pedidos às lojas
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_company_products_store_id ON company_products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);

-- Atualizar dados existentes para vincular às lojas corretas
-- Para cada empresa, buscar sua loja e vincular funcionários e produtos

-- Vincular funcionários existentes às lojas de suas empresas
UPDATE users 
SET store_id = (
    SELECT s.id 
    FROM stores s 
    WHERE s.company_id = users.company_id 
    LIMIT 1
)
WHERE users.store_id IS NULL AND users.company_id IS NOT NULL;

-- Vincular produtos existentes às lojas de suas empresas
UPDATE company_products 
SET store_id = (
    SELECT s.id 
    FROM stores s 
    WHERE s.company_id = company_products.company_id 
    LIMIT 1
)
WHERE store_id IS NULL;

-- Vincular pedidos existentes às lojas de suas empresas
UPDATE orders 
SET store_id = (
    SELECT s.id 
    FROM stores s 
    WHERE s.company_id = orders.company_id 
    LIMIT 1
)
WHERE store_id IS NULL;

-- Atualizar RLS policies para usar store_id
DROP POLICY IF EXISTS "Users are viewable by company members" ON users;
CREATE POLICY "Users are viewable by store members" ON users
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            store_id IN (
                SELECT s.id FROM stores s 
                WHERE s.company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            )
            OR role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Company products are viewable by company members" ON company_products;
CREATE POLICY "Store products are viewable by store members" ON company_products
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            store_id IN (
                SELECT s.id FROM stores s 
                WHERE s.company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            )
            OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Orders are viewable by company members" ON orders;
CREATE POLICY "Orders are viewable by store members" ON orders
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            store_id IN (
                SELECT s.id FROM stores s 
                WHERE s.company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            )
            OR user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Policy para gestores verem apenas dados da sua loja
CREATE POLICY "Store managers can view store data" ON users
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = 'manager' 
                AND u.store_id = users.store_id
            )
            OR role = 'admin'
        )
    );

CREATE POLICY "Store managers can view store products" ON company_products
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = 'manager' 
                AND u.store_id = company_products.store_id
            )
            OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

CREATE POLICY "Store managers can view store orders" ON orders
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = 'manager' 
                AND u.store_id = orders.store_id
            )
            OR user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Policy para acesso público às lojas (sem autenticação)
CREATE POLICY "Public can view active stores" ON stores
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public can view store products" ON company_products
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM stores WHERE status = 'active'
        )
    );
