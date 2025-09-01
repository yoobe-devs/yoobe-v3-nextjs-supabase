-- Sistema Administrativo para Yoobe
-- Permite gerenciamento centralizado de clientes, produtos e operações

-- Atualizar enum user_role existente para incluir novos roles
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'client_admin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'client_user';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'super_admin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Atualizar tabela profiles para incluir role (se não existir)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role user_role DEFAULT 'user';

-- Tabela de administradores internos
CREATE TABLE internal_admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de catálogo global de produtos (catalogo.yoobe.co)
CREATE TABLE global_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    sku TEXT UNIQUE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    weight DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height}
    colors TEXT[],
    sizes TEXT[],
    materials TEXT[],
    tags TEXT[],
    image_urls TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES internal_admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de relacionamento entre produtos globais e produtos das lojas
CREATE TABLE product_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    global_product_id UUID REFERENCES global_products(id) ON DELETE CASCADE,
    store_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    custom_price DECIMAL(10,2),
    custom_name TEXT,
    custom_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(global_product_id, store_id)
);

-- Tabela de integração com Cubbo (fulfillment)
CREATE TABLE cubbo_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    cubbo_api_key TEXT NOT NULL,
    cubbo_warehouse_id TEXT,
    cubbo_company_id TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de rastreamento de pedidos no Cubbo
CREATE TABLE cubbo_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    cubbo_order_id TEXT UNIQUE,
    cubbo_tracking_code TEXT,
    cubbo_status TEXT,
    cubbo_status_details JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de logs de integração já existe na migração anterior

-- Tabela de configurações globais da plataforma
CREATE TABLE platform_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de auditoria de ações administrativas
CREATE TABLE admin_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES internal_admins(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'company', 'store', 'product', 'user'
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_internal_admins_email ON internal_admins(email);
CREATE INDEX idx_internal_admins_role ON internal_admins(role);
CREATE INDEX idx_global_products_category ON global_products(category);
CREATE INDEX idx_global_products_sku ON global_products(sku);
CREATE INDEX idx_global_products_active ON global_products(is_active);
CREATE INDEX idx_product_mappings_store ON product_mappings(store_id);
CREATE INDEX idx_product_mappings_global ON product_mappings(global_product_id);
CREATE INDEX idx_cubbo_integrations_store ON cubbo_integrations(store_id);
CREATE INDEX idx_cubbo_orders_order ON cubbo_orders(order_id);
CREATE INDEX idx_cubbo_orders_tracking ON cubbo_orders(cubbo_tracking_code);
-- Índices para integration_logs já existem na migração anterior
CREATE INDEX idx_admin_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_created ON admin_audit_logs(created_at);

-- Triggers para updated_at
CREATE TRIGGER update_internal_admins_updated_at BEFORE UPDATE ON internal_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_products_updated_at BEFORE UPDATE ON global_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cubbo_integrations_updated_at BEFORE UPDATE ON cubbo_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_configs_updated_at BEFORE UPDATE ON platform_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE internal_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cubbo_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cubbo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para internal_admins (usando valores existentes por enquanto)
CREATE POLICY "Admins can view all internal admins" ON internal_admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage internal admins" ON internal_admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

-- Políticas RLS para global_products
CREATE POLICY "Admins can view all global products" ON global_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage global products" ON global_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

-- Políticas RLS para product_mappings
CREATE POLICY "Admins can view all product mappings" ON product_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

-- Política para client admins será adicionada posteriormente quando o enum estiver disponível

-- Políticas RLS para cubbo_integrations
CREATE POLICY "Admins can view all cubbo integrations" ON cubbo_integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

-- Política para client admins será adicionada posteriormente quando o enum estiver disponível

-- Políticas RLS para integration_logs
CREATE POLICY "Admins can view all integration logs" ON integration_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

-- Políticas RLS para platform_configs
CREATE POLICY "Public configs are viewable by all" ON platform_configs
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can view all platform configs" ON platform_configs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage platform configs" ON platform_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

-- Políticas RLS para admin_audit_logs
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_admins ia
            JOIN profiles p ON ia.user_id = p.id
            WHERE p.id = auth.uid() AND ia.role = 'admin'
        )
    );

-- Função para criar log de auditoria
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_audit_logs (
        admin_id, action, resource_type, resource_id, 
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_admin_id, p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values, 
        inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para sincronizar produtos com Cubbo
CREATE OR REPLACE FUNCTION sync_products_with_cubbo(p_store_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    cubbo_config RECORD;
BEGIN
    -- Buscar configuração do Cubbo para a loja
    SELECT * INTO cubbo_config FROM cubbo_integrations WHERE store_id = p_store_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cubbo integration not found or inactive');
    END IF;
    
    -- Aqui seria implementada a lógica de sincronização com a API do Cubbo
    -- Por enquanto, retornamos um mock
    result := jsonb_build_object(
        'success', true,
        'synced_products', 0,
        'synced_orders', 0,
        'timestamp', now()
    );
    
    -- Log da integração
    INSERT INTO integration_logs (
        integration_type, store_id, action, status, 
        request_data, response_data, execution_time_ms
    ) VALUES (
        'cubbo', p_store_id, 'sync_products', 'success',
        jsonb_build_object('store_id', p_store_id),
        result, 100
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
