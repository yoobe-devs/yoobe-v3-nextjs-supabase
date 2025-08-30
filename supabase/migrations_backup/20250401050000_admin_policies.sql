-- Políticas RLS adicionais para os novos roles do enum user_role
-- Esta migração adiciona as políticas que não puderam ser criadas na migração anterior

-- Políticas para client_admin em product_mappings
CREATE POLICY "Client admins can view their product mappings" ON product_mappings
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM stores s
            JOIN profiles p ON s.company_id = p.company_id
            WHERE p.id = auth.uid() AND p.user_role = 'client_admin'
        )
    );

-- Políticas para client_admin em cubbo_integrations
CREATE POLICY "Client admins can view their cubbo integrations" ON cubbo_integrations
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM stores s
            JOIN profiles p ON s.company_id = p.company_id
            WHERE p.id = auth.uid() AND p.user_role = 'client_admin'
        )
    );

-- Atualizar políticas existentes para incluir super_admin
DROP POLICY IF EXISTS "Admins can view all internal admins" ON internal_admins;
CREATE POLICY "Admins can view all internal admins" ON internal_admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can manage internal admins" ON internal_admins;
CREATE POLICY "Admins can manage internal admins" ON internal_admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'super_admin'
        )
    );

-- Atualizar políticas para global_products
DROP POLICY IF EXISTS "Admins can view all global products" ON global_products;
CREATE POLICY "Admins can view all global products" ON global_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can manage global products" ON global_products;
CREATE POLICY "Admins can manage global products" ON global_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );

-- Atualizar políticas para product_mappings
DROP POLICY IF EXISTS "Admins can view all product mappings" ON product_mappings;
CREATE POLICY "Admins can view all product mappings" ON product_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );

-- Atualizar políticas para cubbo_integrations
DROP POLICY IF EXISTS "Admins can view all cubbo integrations" ON cubbo_integrations;
CREATE POLICY "Admins can view all cubbo integrations" ON cubbo_integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );

-- Atualizar políticas para integration_logs
DROP POLICY IF EXISTS "Admins can view all integration logs" ON integration_logs;
CREATE POLICY "Admins can view all integration logs" ON integration_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );

-- Atualizar políticas para platform_configs
DROP POLICY IF EXISTS "Admins can view all platform configs" ON platform_configs;
CREATE POLICY "Admins can view all platform configs" ON platform_configs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can manage platform configs" ON platform_configs;
CREATE POLICY "Super admins can manage platform configs" ON platform_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'super_admin'
        )
    );

-- Atualizar políticas para admin_audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role IN ('admin', 'super_admin')
        )
    );


