-- Sistema Multitenant para Yoobe
-- Permite múltiplas empresas com suas próprias lojas

-- Tabela de empresas
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    corporate_name TEXT,
    cnpj TEXT UNIQUE,
    email TEXT NOT NULL,
    phone TEXT,
    address JSONB,
    logo_url TEXT,
    website TEXT,
    industry TEXT,
    employee_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de lojas corporativas
CREATE TABLE stores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- identificador único da loja (ex: join-tecnologia)
    domain TEXT UNIQUE, -- domínio personalizado (ex: join.yoobe.co)
    description TEXT,
    theme JSONB DEFAULT '{"primary_color": "#1e40af", "secondary_color": "#3b82f6", "accent_color": "#60a5fa"}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Atualizar tabela profiles para incluir company_id
ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
ALTER TABLE profiles ADD COLUMN store_id UUID REFERENCES stores(id);

-- Atualizar tabela products para incluir store_id
ALTER TABLE products ADD COLUMN store_id UUID REFERENCES stores(id);

-- Atualizar tabela categories para incluir store_id
ALTER TABLE categories ADD COLUMN store_id UUID REFERENCES stores(id);

-- Atualizar tabela orders para incluir store_id
ALTER TABLE orders ADD COLUMN store_id UUID REFERENCES stores(id);

-- Atualizar tabela campaigns para incluir store_id
ALTER TABLE campaigns ADD COLUMN store_id UUID REFERENCES stores(id);

-- Alterar tabela store_configs existente para suportar multitenant
ALTER TABLE store_configs ADD COLUMN IF NOT EXISTS store_id UUID;
ALTER TABLE store_configs ADD COLUMN IF NOT EXISTS config_key TEXT;
ALTER TABLE store_configs ADD COLUMN IF NOT EXISTS config_value JSONB;

-- Criar nova tabela store_configs_new para substituir a antiga
CREATE TABLE store_configs_new (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    config_key TEXT NOT NULL,
    config_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(store_id, config_key)
);

-- Tabela de domínios personalizados
CREATE TABLE custom_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    domain TEXT UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    ssl_certificate JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_store_id ON profiles(store_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_categories_store_id ON categories(store_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_campaigns_store_id ON campaigns(store_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_domain ON stores(domain);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_configs_new_updated_at BEFORE UPDATE ON store_configs_new FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_domains_updated_at BEFORE UPDATE ON custom_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) para multitenant
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_configs_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para companies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Company admins can update their company" ON companies
    FOR UPDATE USING (id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Políticas RLS para stores
CREATE POLICY "Users can view stores from their company" ON stores
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Company admins can manage their stores" ON stores
    FOR ALL USING (company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Políticas RLS para store_configs_new
CREATE POLICY "Users can view store configs from their company" ON store_configs_new
    FOR SELECT USING (store_id IN (
        SELECT s.id FROM stores s 
        JOIN profiles p ON s.company_id = p.company_id 
        WHERE p.id = auth.uid()
    ));

CREATE POLICY "Company admins can manage store configs" ON store_configs_new
    FOR ALL USING (store_id IN (
        SELECT s.id FROM stores s 
        JOIN profiles p ON s.company_id = p.company_id 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

-- Políticas RLS para custom_domains
CREATE POLICY "Users can view custom domains from their company" ON custom_domains
    FOR SELECT USING (store_id IN (
        SELECT s.id FROM stores s 
        JOIN profiles p ON s.company_id = p.company_id 
        WHERE p.id = auth.uid()
    ));

CREATE POLICY "Company admins can manage custom domains" ON custom_domains
    FOR ALL USING (store_id IN (
        SELECT s.id FROM stores s 
        JOIN profiles p ON s.company_id = p.company_id 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ));
