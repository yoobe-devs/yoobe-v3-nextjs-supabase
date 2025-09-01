-- Sistema de Resgate - Loja de Brindes
-- Migração para criar todas as tabelas necessárias para o sistema de resgate

-- Tabela de configurações da loja
CREATE TABLE store_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES profiles(id),
    store_name TEXT NOT NULL,
    store_description TEXT,
    store_domain TEXT UNIQUE,
    logo_url TEXT,
    banner_url TEXT,
    theme TEXT DEFAULT 'light',
    currency TEXT DEFAULT 'BRL',
    language TEXT DEFAULT 'pt-BR',
    is_active BOOLEAN DEFAULT true,
    allow_reviews BOOLEAN DEFAULT true,
    show_prices BOOLEAN DEFAULT true,
    contact_email TEXT,
    contact_phone TEXT,
    contact_address JSONB,
    working_hours TEXT,
    payment_methods TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de pontos/fidelidade dos usuários
CREATE TABLE user_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de transações de pontos
CREATE TABLE point_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- 'earn', 'spend', 'expire', 'adjustment'
    points_amount INTEGER NOT NULL,
    description TEXT,
    reference_id UUID, -- ID da ordem, campanha, etc.
    reference_type TEXT, -- 'order', 'campaign', 'manual', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de carrinho de compras
CREATE TABLE shopping_carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de itens do carrinho
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES shopping_carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    claim_method TEXT NOT NULL, -- 'points', 'credit_card', 'pix', 'boleto', 'free'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de endereços de entrega
CREATE TABLE shipping_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    recipient_name TEXT NOT NULL,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'Brasil',
    phone TEXT,
    additional_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de rastreamento de pedidos
CREATE TABLE order_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_code TEXT,
    carrier TEXT, -- 'cubbo', 'correios', etc.
    status TEXT NOT NULL, -- 'pending', 'shipped', 'delivered', 'returned'
    status_details TEXT,
    estimated_delivery DATE,
    actual_delivery DATE,
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de integrações com APIs externas
CREATE TABLE api_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    integration_type TEXT NOT NULL, -- 'workvivo', 'cubbo', 'olist', 'payment_gateway'
    is_active BOOLEAN DEFAULT true,
    api_key TEXT,
    api_secret TEXT,
    base_url TEXT,
    webhook_url TEXT,
    config JSONB,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de logs de integração
CREATE TABLE integration_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    integration_id UUID REFERENCES api_integrations(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'sync', 'webhook', 'error'
    status TEXT NOT NULL, -- 'success', 'error', 'pending'
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de campanhas promocionais
CREATE TABLE promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'percentage', 'fixed', 'free_shipping', 'points_multiplier'
    discount_value DECIMAL(10,2),
    min_order_value DECIMAL(10,2),
    max_discount DECIMAL(10,2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    applicable_products UUID[],
    applicable_users UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de cupons de desconto
CREATE TABLE coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de avaliações de produtos
CREATE TABLE product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de notificações
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'order_status', 'points_earned', 'promotion', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);
CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX idx_order_tracking_tracking_code ON order_tracking(tracking_code);
CREATE INDEX idx_api_integrations_type ON api_integrations(integration_type);
CREATE INDEX idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX idx_integration_logs_created_at ON integration_logs(created_at);
CREATE INDEX idx_promotions_active ON promotions(is_active) WHERE is_active = true;
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_store_configs_updated_at BEFORE UPDATE ON store_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON shipping_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_tracking_updated_at BEFORE UPDATE ON order_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_integrations_updated_at BEFORE UPDATE ON api_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular pontos do usuário
CREATE OR REPLACE FUNCTION calculate_user_points(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN transaction_type = 'earn' THEN points_amount
            WHEN transaction_type = 'spend' THEN -points_amount
            WHEN transaction_type = 'expire' THEN -points_amount
            ELSE 0
        END
    ), 0) INTO total_points
    FROM point_transactions
    WHERE user_id = user_uuid;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar saldo de pontos
CREATE OR REPLACE FUNCTION update_user_points_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_points 
    SET points_balance = calculate_user_points(NEW.user_id),
        last_updated = TIMEZONE('utc'::text, NOW())
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo de pontos automaticamente
CREATE TRIGGER update_points_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON point_transactions
    FOR EACH ROW EXECUTE FUNCTION update_user_points_balance();


